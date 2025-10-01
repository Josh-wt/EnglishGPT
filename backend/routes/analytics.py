"""
Analytics and badges routes.
"""
from fastapi import APIRouter, HTTPException
import logging
import re
import json
import httpx
from datetime import datetime, timedelta
from collections import defaultdict
from config.settings import get_user_management_service, get_supabase_client, RECOMMENDATIONS_API_KEY, RECOMMENDATIONS_MODEL

router = APIRouter()
logger = logging.getLogger(__name__)

# Get services
supabase = get_supabase_client()
user_management_service = get_user_management_service(supabase)  # Pass supabase client

def calculate_streak(dates):
    """Calculate current streak from sorted dates"""
    if not dates:
        return 0
    
    # Group by date (ignore time)
    date_strings = list(set(date.strftime("%Y-%m-%d") for date in dates))
    date_strings.sort()
    
    if not date_strings:
        return 0
    
    # Check if today or yesterday is in the list
    today = datetime.now().strftime("%Y-%m-%d")
    yesterday = (datetime.now() - timedelta(days=1)).strftime("%Y-%m-%d")
    
    if today not in date_strings and yesterday not in date_strings:
        return 0
    
    # Count consecutive days backwards from today/yesterday
    current_streak = 0
    check_date = datetime.now().date()
    
    for _ in range(len(date_strings)):
        if check_date.strftime("%Y-%m-%d") in date_strings:
            current_streak += 1
            check_date -= timedelta(days=1)
        else:
            break
    
    return current_streak

def extract_numeric_grade(grade_str):
    """Extract numeric value from grade string"""
    match = re.search(r'(\d+)', grade_str)
    return int(match.group(1)) if match else 0

@router.post("/badges/check/{user_id}")
async def check_and_award_badges(user_id: str):
    """Check user activity and award badges"""
    try:
        logger.info(f"🏆 Badge check request for user: {user_id}")
        
        # Get user and evaluations using the user management service
        if not user_management_service:
            logger.error("❌ User management service not available")
            raise HTTPException(status_code=500, detail="User management service not available")
        
        if not supabase:
            logger.error("❌ Supabase client not available")
            raise HTTPException(status_code=500, detail="Database connection not available")
        
        user_data = await user_management_service.get_user_by_id(user_id)
        if not user_data:
            logger.warning(f"⚠️ User not found: {user_id}")
            raise HTTPException(status_code=404, detail="User not found")
        
        evaluations_response = supabase.table('assessment_evaluations').select('*').eq('user_id', user_id).execute()
        evaluations = evaluations_response.data
        
        # Badge definitions
        badges_to_check = [
            # Streak badges
            {"type": "streak", "name": "3-Day Streak", "description": "Submit for 3 consecutive days", "icon": "🔥", "requirement": 3},
            {"type": "streak", "name": "7-Day Streak", "description": "Submit for 7 consecutive days", "icon": "🏆", "requirement": 7},
            {"type": "streak", "name": "30-Day Streak", "description": "Submit for 30 consecutive days", "icon": "💎", "requirement": 30},
            
            # Volume badges
            {"type": "volume", "name": "10 Essay Milestone", "description": "Submit 10 essays", "icon": "📝", "requirement": 10},
            {"type": "volume", "name": "25 Essay Milestone", "description": "Submit 25 essays", "icon": "📚", "requirement": 25},
            {"type": "volume", "name": "50 Essay Milestone", "description": "Submit 50 essays", "icon": "🎯", "requirement": 50},
            
            # Word count badges
            {"type": "words", "name": "10K Word Club", "description": "Write 10,000 words total", "icon": "✍️", "requirement": 10000},
            {"type": "words", "name": "25K Word Club", "description": "Write 25,000 words total", "icon": "📖", "requirement": 25000},
            
            # Improvement badges
            {"type": "improvement", "name": "Band Booster", "description": "Improve by 2 bands", "icon": "⬆️", "requirement": 2},
            {"type": "improvement", "name": "Perseverance Award", "description": "Submit 5 times on same question type", "icon": "💪", "requirement": 5},
            
            # Exploration badges
            {"type": "exploration", "name": "Paper Explorer", "description": "Try 5 different question types", "icon": "🗺️", "requirement": 5},
            {"type": "exploration", "name": "IGCSE Specialist", "description": "Complete 10 IGCSE questions", "icon": "🎓", "requirement": 10},
            {"type": "exploration", "name": "A-Level Expert", "description": "Complete 10 A-Level questions", "icon": "🏅", "requirement": 10}
        ]
        
        awarded_badges = []
        
        for badge_def in badges_to_check:
            # Check if user already has this badge
            existing_badges_response = supabase.table('assessment_badges').select('*').eq('user_id', user_id).eq('badge_name', badge_def["name"]).execute()
            if existing_badges_response.data:
                continue
            
            progress = 0
            earned = False
            
            if badge_def["type"] == "streak":
                # Calculate current streak
                dates = [datetime.fromisoformat(e["timestamp"].replace("Z", "+00:00")) for e in evaluations]
                dates.sort()
                current_streak = calculate_streak(dates)
                progress = current_streak
                earned = progress >= badge_def["requirement"]
                
            elif badge_def["type"] == "volume":
                progress = len(evaluations)
                earned = progress >= badge_def["requirement"]
                
            elif badge_def["type"] == "words":
                total_words = sum(len(e["student_response"].split()) for e in evaluations)
                progress = total_words
                earned = progress >= badge_def["requirement"]
                
            elif badge_def["type"] == "improvement":
                # Check for grade improvements
                improvements = 0
                for i in range(1, len(evaluations)):
                    prev_grade = extract_numeric_grade(evaluations[i-1]["grade"])
                    curr_grade = extract_numeric_grade(evaluations[i]["grade"])
                    if curr_grade > prev_grade:
                        improvements += 1
                progress = improvements
                earned = progress >= badge_def["requirement"]
                
            elif badge_def["type"] == "exploration":
                if badge_def["name"] == "Paper Explorer":
                    unique_types = set(e["question_type"] for e in evaluations)
                    progress = len(unique_types)
                    earned = progress >= badge_def["requirement"]
                elif badge_def["name"] == "IGCSE Specialist":
                    igcse_count = sum(1 for e in evaluations if e["question_type"].startswith("igcse"))
                    progress = igcse_count
                    earned = progress >= badge_def["requirement"]
                elif badge_def["name"] == "A-Level Expert":
                    alevel_count = sum(1 for e in evaluations if e["question_type"].startswith("alevel"))
                    progress = alevel_count
                    earned = progress >= badge_def["requirement"]
            
            if earned:
                # Award badge
                badge_data = {
                    "user_id": user_id,
                    "badge_type": badge_def["type"],
                    "badge_name": badge_def["name"],
                    "badge_description": badge_def["description"],
                    "badge_icon": badge_def["icon"],
                    "progress": progress,
                    "requirement": badge_def["requirement"],
                    "earned_at": datetime.utcnow().isoformat()
                }
                supabase.table('assessment_badges').insert(badge_data).execute()
                awarded_badges.append(badge_data)
        
        logger.info(f"✅ Badge check completed for user: {user_id}, awarded: {len(awarded_badges)}")
        return {"awarded_badges": awarded_badges}
        
    except HTTPException as he:
        logger.error(f"❌ HTTP Exception in badge check: {he.status_code} - {he.detail}")
        raise he
    except Exception as e:
        logger.error(f"❌ Badge check error for user {user_id}: {str(e)}")
        logger.exception("Full traceback:")
        raise HTTPException(status_code=500, detail=f"Badge check error: {str(e)}")

@router.get("/badges/{user_id}")
async def get_user_badges(user_id: str):
    """Get all badges for a user"""
    try:
        logger.info(f"🏅 Fetching badges for user: {user_id}")
        
        if not supabase:
            logger.error("❌ Supabase client not available")
            raise HTTPException(status_code=500, detail="Database connection not available")
        
        badges_response = supabase.table('assessment_badges').select('*').eq('user_id', user_id).order('earned_at', desc=True).limit(100).execute()
        badges = badges_response.data
        
        logger.info(f"✅ Retrieved {len(badges)} badges for user: {user_id}")
        return {"badges": badges}
    except HTTPException as he:
        logger.error(f"❌ HTTP Exception in badge retrieval: {he.status_code} - {he.detail}")
        raise he
    except Exception as e:
        logger.error(f"❌ Badge retrieval error for user {user_id}: {str(e)}")
        logger.exception("Full traceback:")
        raise HTTPException(status_code=500, detail=f"Badge retrieval error: {str(e)}")

@router.get("/analytics/{user_id}")
async def get_user_analytics(user_id: str):
    """Get analytics data for a specific user"""
    try:
        logger.info(f"📊 Analytics request for user: {user_id}")
        
        # Get user to check if they have analytics access using the user management service
        if not user_management_service:
            logger.error("❌ User management service not available")
            raise HTTPException(status_code=500, detail="User management service not available")
        
        if not supabase:
            logger.error("❌ Supabase client not available")
            raise HTTPException(status_code=500, detail="Database connection not available")
        
        logger.info(f"🔍 Fetching user data for: {user_id}")
        user_data = await user_management_service.get_user_by_id(user_id)
        if not user_data:
            logger.warning(f"⚠️ User not found: {user_id}")
            raise HTTPException(status_code=404, detail="User not found")
        
        logger.info(f"✅ User found: {user_id}, plan: {user_data.get('current_plan')}")
        
        # Check if user has analytics access (unlimited plan)
        if user_data.get('current_plan') != 'unlimited':
            raise HTTPException(status_code=403, detail="Analytics access requires Unlimited plan")
        
        # Get user's evaluations
        evaluations_response = supabase.table('assessment_evaluations').select('*').eq('user_id', user_id).execute()
        evaluations = evaluations_response.data
        
        # Calculate analytics data
        analytics_data = {
            "total_responses": len(evaluations),
            "evaluations": evaluations,
            "user_plan": user_data.get('current_plan'),
            "questions_marked": user_data.get('questions_marked', 0),
            "credits_remaining": user_data.get('credits', 0)
        }

        # Recommendations: only after first 5 submissions and update every 5
        recommendations = None
        if len(evaluations) >= 5:
            try:
                # Determine if we need to refresh: every 5 submissions
                refresh_needed = (len(evaluations) % 5 == 0)
                # Fetch last cached recommendations if present
                rec_key = f"recos_{user_id}"
                rec_resp = supabase.table('assessment_meta').select('*').eq('key', rec_key).execute()
                cached = rec_resp.data[0] if rec_resp.data else None

                if refresh_needed or not cached:
                    # Aggregate per question type: average score and improvement suggestions
                    type_to_scores = defaultdict(list)
                    type_to_improvements = defaultdict(list)
                    for ev in evaluations:
                        qtype = ev.get('question_type')
                        grade_str = ev.get('grade', '')
                        # Extract achieved and total
                        nums = re.findall(r"(\d+)\/(\d+)", str(grade_str))
                        if nums:
                            achieved = int(nums[0][0])
                            total = int(nums[0][1]) if int(nums[0][1]) > 0 else 1
                            pct = achieved / total
                            type_to_scores[qtype].append(pct)
                        for imp in ev.get('improvement_suggestions', []) or []:
                            if isinstance(imp, str) and imp:
                                type_to_improvements[qtype].append(imp)

                    summaries = []
                    for qtype, scores in type_to_scores.items():
                        avg_pct = sum(scores) / max(len(scores), 1)
                        avg_score_pct = round(avg_pct * 100)
                        improvements_sample = type_to_improvements.get(qtype, [])[:10]
                        summaries.append({
                            "questionType": qtype,
                            "averageScorePercent": avg_score_pct,
                            "improvementSuggestions": improvements_sample,
                        })

                    # Compose enhanced prompt aligned with KimiK2 evaluation style
                    guide = (
                        "CRITICAL FOCUS AREAS:\n"
                        "1. Vocabulary Enhancement: Focus on advanced vocabulary that demonstrates sophistication\n"
                        "2. Structure & Organization: Clear progression of ideas with effective paragraphing\n"
                        "3. Evidence & Analysis: Use specific textual evidence and detailed analysis\n"
                        "4. Writing Techniques: Employ varied sentence structures and literary devices\n"
                        "5. Time Management: Practice completing responses within allocated time\n"
                        "6. Marking Criteria Mastery: Understand exactly what examiners look for\n"
                        "7. Comparative Analysis: For comparative essays, balance discussion between texts\n"
                        "8. Critical Thinking: Develop original insights and interpretations\n"
                    )
                    
                    user_prompt = f"""
You are analyzing a student's English assessment performance using the KimiK2 evaluation methodology.

STUDENT PERFORMANCE DATA:
{json.dumps(summaries, indent=2)}

EVALUATION APPROACH (KimiK2 Style):
- Give specific, actionable recommendations
- Focus on vocabulary improvement as a priority (highest marks for good vocabulary)
- Identify patterns across multiple assessments
- Provide concrete examples of how to improve
- Be encouraging while being honest about areas needing work

{guide}

Based on this student's specific performance patterns, generate personalized recommendations following this structure:

1. **Immediate Priority Areas** (2-3 most critical improvements needed)
   - Be specific about WHAT to improve and HOW

2. **Vocabulary Development Strategy**
   - Specific vocabulary areas to focus on based on their weak question types
   - Resources and techniques for vocabulary enhancement

3. **Question-Type Specific Improvements**
   - For each weak question type, provide targeted advice
   - Include specific techniques that work for that question type

4. **Study Plan** (Weekly structure)
   - Concrete daily/weekly goals
   - Balance between practice and learning new concepts

5. **Success Indicators**
   - What improvements to look for in next 5 assessments
   - Measurable goals to track progress

Remember: This student has completed {len(evaluations)} assessments. Tailor your advice to their current level and progression.

Format your response in clear bullet points, using "you" to address the student directly. Be encouraging but specific - avoid generic advice."""

                    # Call OpenRouter API for recommendations using OPENROUTER_GPT_OSS_120B_KEY
                    async def call_recommendations(prompt: str) -> str:
                        if not RECOMMENDATIONS_API_KEY:
                            raise Exception("OPENROUTER_GPT_OSS_120B_KEY not configured for recommendations")
                        
                        async with httpx.AsyncClient() as client:
                            headers = {
                                "Authorization": f"Bearer {RECOMMENDATIONS_API_KEY}",
                                "Content-Type": "application/json",
                                "HTTP-Referer": "https://englishgpt.everythingenglish.xyz",
                                "X-Title": "EnglishGPT Recommendations"
                            }
                            
                            # Enhanced system prompt with KimiK2-style evaluation approach
                            system_prompt = """You are an expert English language tutor using the KimiK2 evaluation methodology. 
                            Generate practical, encouraging study recommendations based on student performance data. 
                            Focus heavily on vocabulary improvement as it yields the highest marks.
                            Be specific, actionable, and personalized to the student's weaknesses."""
                            
                            payload = {
                                "model": RECOMMENDATIONS_MODEL,
                                "messages": [
                                    {"role": "system", "content": system_prompt},
                                    {"role": "user", "content": prompt}
                                ],
                                "max_tokens": 800,
                                "temperature": 0.5
                            }
                            
                            r = await client.post("https://openrouter.ai/api/v1/chat/completions", headers=headers, json=payload, timeout=60.0)
                            r.raise_for_status()
                            res = r.json()
                            return res['choices'][0]['message']['content']

                    rec_text = await call_recommendations(user_prompt)

                    # Cache recommendations
                    record = {
                        "key": rec_key,
                        "value": rec_text,
                        "updated_at": datetime.utcnow().isoformat(),
                        "meta": json.dumps({"count": len(evaluations)})
                    }
                    if cached:
                        supabase.table('assessment_meta').update(record).eq('key', rec_key).execute()
                    else:
                        supabase.table('assessment_meta').insert(record).execute()
                    recommendations = rec_text
                else:
                    recommendations = cached.get('value')
            except Exception as e:
                logger.error(f"Recommendations error: {str(e)}")
                recommendations = None

        analytics_data["recommendations"] = recommendations

        logger.info(f"✅ Analytics data successfully generated for user: {user_id}")
        return {"analytics": analytics_data}
        
    except HTTPException as he:
        # Re-raise HTTP exceptions as-is
        logger.error(f"❌ HTTP Exception in analytics: {he.status_code} - {he.detail}")
        raise he
    except Exception as e:
        logger.error(f"❌ Analytics error for user {user_id}: {str(e)}")
        logger.exception("Full traceback:")
        raise HTTPException(status_code=500, detail=f"Analytics error: {str(e)}")
