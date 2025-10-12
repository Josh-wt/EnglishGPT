"""
Admin Dashboard API Routes
Provides comprehensive admin dashboard data
"""

import logging
from typing import Dict, List, Any, Optional
from fastapi import APIRouter, HTTPException, Request
from pydantic import BaseModel
from datetime import datetime, timedelta
from collections import defaultdict
from datetime import date

from config.settings import get_supabase_client
from utils.admin_auth import require_admin_access

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/admin", tags=["admin-dashboard"])

# Pydantic models
class DashboardStats(BaseModel):
    total_users: int
    total_evaluations: int
    average_grade: float
    total_credits_used: int
    active_users_today: int
    completion_rate: float

class EvaluationTrend(BaseModel):
    date: str
    count: int

class GradeDistribution(BaseModel):
    grade_range: str
    count: int

class QuestionTypeStats(BaseModel):
    question_type: str
    count: int
    average_grade: float

class SubscriptionStats(BaseModel):
    plan: str
    count: int

class RecentActivity(BaseModel):
    id: str
    type: str
    description: str
    timestamp: str
    user_id: Optional[str] = None

@router.get("/dashboard/stats", response_model=DashboardStats)
async def get_dashboard_stats(request: Request):
    """Get main dashboard statistics"""
    try:
        require_admin_access(request)
        supabase = get_supabase_client()
        
        # Get total users
        users_result = supabase.table('assessment_users').select('uid', count='exact').execute()
        total_users = users_result.count or 0
        
        # Get total evaluations
        evaluations_result = supabase.table('assessment_evaluations').select('id', count='exact').execute()
        total_evaluations = evaluations_result.count or 0
        
        # Get average grade
        grade_result = supabase.table('assessment_evaluations').select('grade').execute()
        if grade_result.data:
            total_score = sum(eval.get('grade', 0) for eval in grade_result.data)
            average_grade = total_score / len(grade_result.data) if grade_result.data else 0
        else:
            average_grade = 0
        
        # Get total credits used
        credits_result = supabase.table('assessment_users').select('credits').execute()
        total_credits_used = sum(user.get('credits', 0) for user in credits_result.data) if credits_result.data else 0
        
        # Get active users today
        today = datetime.now().date()
        active_users_result = supabase.table('assessment_users').select('uid').gte('updated_at', today.isoformat()).execute()
        active_users_today = len(active_users_result.data) if active_users_result.data else 0
        
        # Calculate completion rate (users who have completed at least one evaluation)
        completed_users_result = supabase.table('assessment_evaluations').select('user_id').execute()
        unique_users = len(set(eval.get('user_id') for eval in completed_users_result.data)) if completed_users_result.data else 0
        completion_rate = (unique_users / total_users * 100) if total_users > 0 else 0
        
        return DashboardStats(
            total_users=total_users,
            total_evaluations=total_evaluations,
            average_grade=round(average_grade, 2),
            total_credits_used=total_credits_used,
            active_users_today=active_users_today,
            completion_rate=round(completion_rate, 2)
        )
        
    except Exception as e:
        logger.error(f"Error getting dashboard stats: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Dashboard stats error: {str(e)}")

@router.get("/dashboard/evaluations-trend", response_model=List[EvaluationTrend])
async def get_evaluations_trend(request: Request, days: int = 30):
    """Get evaluations trend over time"""
    try:
        require_admin_access(request)
        supabase = get_supabase_client()
        
        # Get evaluations from the last N days
        start_date = (datetime.now() - timedelta(days=days)).date()
        result = supabase.table('assessment_evaluations').select('timestamp').gte('timestamp', start_date.isoformat()).execute()
        
        # Group by date
        trends = {}
        for eval in result.data or []:
            date = eval.get('timestamp', '')[:10]  # Get YYYY-MM-DD
            trends[date] = trends.get(date, 0) + 1
        
        # Fill in missing dates with 0
        trend_data = []
        for i in range(days):
            date = (start_date + timedelta(days=i)).isoformat()
            count = trends.get(date, 0)
            trend_data.append(EvaluationTrend(date=date, count=count))
        
        return trend_data
        
    except Exception as e:
        logger.error(f"Error getting evaluations trend: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Evaluations trend error: {str(e)}")

@router.get("/dashboard/grade-distribution", response_model=List[GradeDistribution])
async def get_grade_distribution(request: Request):
    """Get grade distribution"""
    try:
        require_admin_access(request)
        supabase = get_supabase_client()
        
        result = supabase.table('assessment_evaluations').select('grade').execute()
        
        # Define grade ranges
        ranges = [
            ("0-20", 0, 20),
            ("21-40", 21, 40),
            ("41-60", 41, 60),
            ("61-80", 61, 80),
            ("81-100", 81, 100)
        ]
        
        distribution = []
        for range_name, min_score, max_score in ranges:
            count = sum(1 for eval in result.data or [] 
                       if min_score <= eval.get('grade', 0) <= max_score)
            distribution.append(GradeDistribution(grade_range=range_name, count=count))
        
        return distribution
        
    except Exception as e:
        logger.error(f"Error getting grade distribution: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Grade distribution error: {str(e)}")

@router.get("/dashboard/question-types", response_model=List[QuestionTypeStats])
async def get_question_type_stats(request: Request):
    """Get question type statistics"""
    try:
        require_admin_access(request)
        supabase = get_supabase_client()
        
        result = supabase.table('assessment_evaluations').select('question_type', 'grade').execute()
        
        # Group by question type
        type_stats = {}
        for eval in result.data or []:
            q_type = eval.get('question_type', 'Unknown')
            score = eval.get('grade', 0)
            
            if q_type not in type_stats:
                type_stats[q_type] = {'count': 0, 'total_score': 0}
            
            type_stats[q_type]['count'] += 1
            type_stats[q_type]['total_score'] += score
        
        # Calculate averages
        stats = []
        for q_type, data in type_stats.items():
            avg_grade = data['total_score'] / data['count'] if data['count'] > 0 else 0
            stats.append(QuestionTypeStats(
                question_type=q_type,
                count=data['count'],
                average_grade=round(avg_grade, 2)
            ))
        
        return sorted(stats, key=lambda x: x.count, reverse=True)
        
    except Exception as e:
        logger.error(f"Error getting question type stats: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Question type stats error: {str(e)}")

@router.get("/dashboard/subscription-stats", response_model=List[SubscriptionStats])
async def get_subscription_stats(request: Request):
    """Get subscription statistics"""
    try:
        require_admin_access(request)
        supabase = get_supabase_client()
        
        result = supabase.table('assessment_users').select('current_plan').execute()
        
        # Count by plan
        plan_counts = {}
        for user in result.data or []:
            plan = user.get('current_plan', 'free')
            plan_counts[plan] = plan_counts.get(plan, 0) + 1
        
        stats = []
        for plan, count in plan_counts.items():
            stats.append(SubscriptionStats(plan=plan, count=count))
        
        return sorted(stats, key=lambda x: x.count, reverse=True)
        
    except Exception as e:
        logger.error(f"Error getting subscription stats: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Subscription stats error: {str(e)}")

@router.get("/dashboard/recent-activity", response_model=List[RecentActivity])
async def get_recent_activity(request: Request, limit: int = 20):
    """Get recent activity"""
    try:
        require_admin_access(request)
        supabase = get_supabase_client()
        
        # Get recent evaluations
        evaluations_result = supabase.table('assessment_evaluations').select('id', 'user_id', 'question_type', 'timestamp').order('timestamp', desc=True).limit(limit).execute()
        
        activities = []
        for eval in evaluations_result.data or []:
            activities.append(RecentActivity(
                id=eval.get('id', ''),
                type='evaluation',
                description=f"New evaluation: {eval.get('question_type', 'Unknown')}",
                timestamp=eval.get('timestamp', ''),
                user_id=eval.get('user_id')
            ))
        
        # Get recent user registrations
        users_result = supabase.table('assessment_users').select('uid', 'email', 'created_at').order('created_at', desc=True).limit(limit).execute()
        
        for user in users_result.data or []:
            activities.append(RecentActivity(
                id=user.get('uid', ''),
                type='user_registration',
                description=f"New user: {user.get('email', 'Unknown')}",
                timestamp=user.get('created_at', ''),
                user_id=user.get('uid')
            ))
        
        # Sort by timestamp and limit
        activities.sort(key=lambda x: x.timestamp, reverse=True)
        return activities[:limit]
        
    except Exception as e:
        logger.error(f"Error getting recent activity: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Recent activity error: {str(e)}")

@router.get("/dashboard/users")
async def get_all_users_admin(request: Request, limit: int = 25, offset: int = 0, search: str = "", sort_by: str = "created_at", sort_dir: str = "desc", subscription: str = "", academic_level: str = "", min_credits: str = "", max_credits: str = "", created_from: str = "", created_to: str = ""):
    """Get all users for admin view with server-side search/sort/pagination and filters"""
    try:
        require_admin_access(request)
        supabase = get_supabase_client()

        # Parse optional ints
        min_credits_int = int(min_credits) if min_credits else None
        max_credits_int = int(max_credits) if max_credits else None

        allowed_sort_fields = {"created_at", "updated_at", "display_name", "email", "credits", "questions_marked", "current_plan"}
        sort_column = sort_by if sort_by in allowed_sort_fields else "created_at"
        sort_desc = (sort_dir.lower() != "asc")

        logger.info(f"[ADMIN_USERS] start limit={limit} offset={offset} search='{search}' sort_by={sort_by} sort_dir={sort_dir} sub={subscription} level={academic_level} minC={min_credits_int} maxC={max_credits_int} from={created_from} to={created_to}")

        query = supabase.table('assessment_users').select('*', count='exact')

        if subscription:
            query = query.eq('current_plan', subscription)
        if academic_level:
            query = query.eq('academic_level', academic_level)
        if min_credits_int is not None:
            query = query.gte('credits', min_credits_int)
        if max_credits_int is not None:
            query = query.lte('credits', max_credits_int)
        if created_from:
            query = query.gte('created_at', created_from)
        if created_to:
            query = query.lte('created_at', created_to)

        if search:
            search_value = search.replace('%', '').replace(' ', '%')
            or_filter = f"email.ilike.%{search_value}%,display_name.ilike.%{search_value}%,uid.ilike.%{search_value}%"
            query = query.or_(or_filter)

        query = query.order(sort_column, desc=sort_desc).range(offset, offset + limit - 1)
        try:
            result = query.execute()
            logger.info(f"[ADMIN_USERS] primary rows={len(result.data or [])} count={result.count}")
        except Exception as e:
            logger.error(f"[ADMIN_USERS] primary query error: {e}")
            raise

        if result.data is None:
            logger.warning("[ADMIN_USERS] primary data is None; returning empty structure")
            return {"data": [], "count": result.count or 0, "limit": limit, "offset": offset}

        if not result.data:
            logger.info("[ADMIN_USERS] primary returned 0 rows; trying active_assessment_users")
            alt_q = supabase.table('active_assessment_users').select('*', count='exact')
            if subscription:
                alt_q = alt_q.eq('current_plan', subscription)
            if academic_level:
                alt_q = alt_q.eq('academic_level', academic_level)
            if min_credits_int is not None:
                alt_q = alt_q.gte('credits', min_credits_int)
            if max_credits_int is not None:
                alt_q = alt_q.lte('credits', max_credits_int)
            if created_from:
                alt_q = alt_q.gte('created_at', created_from)
            if created_to:
                alt_q = alt_q.lte('created_at', created_to)
            if search:
                search_value = search.replace('%', '').replace(' ', '%')
                alt_q = alt_q.or_(f"email.ilike.%{search_value}%,display_name.ilike.%{search_value}%,uid.ilike.%{search_value}%")
            alt_q = alt_q.order(sort_column if sort_column in {"created_at","updated_at","display_name","email","credits","questions_marked","current_plan"} else 'created_at', desc=sort_desc).range(offset, offset + limit - 1)
            try:
                alt_res = alt_q.execute()
                logger.info(f"[ADMIN_USERS] fallback rows={len(alt_res.data or [])} count={alt_res.count}")
                return {"data": alt_res.data or [], "count": alt_res.count or 0, "limit": limit, "offset": offset}
            except Exception as e:
                logger.error(f"[ADMIN_USERS] fallback query error: {e}")
                raise

        return {"data": result.data or [], "count": result.count or 0, "limit": limit, "offset": offset}
    except Exception as e:
        logger.error(f"[ADMIN_USERS] fatal error: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Users error: {str(e)}")

@router.get("/dashboard/evaluations")
async def get_all_evaluations_admin(
    request: Request,
    limit: int = 25,
    offset: int = 0,
    search: str = "",
    sort_by: str = "timestamp",
    sort_dir: str = "desc",
    include: str = "basic",
    question_types: str = "",  # comma-separated
    user_id: str = "",
    date_from: str = "",
    date_to: str = "",
    grade_contains: str = ""
):
    """Get all evaluations for admin view with server-side search/sort/pagination and filters."""
    try:
        require_admin_access(request)
        supabase = get_supabase_client()

        allowed_sort_fields = {"timestamp", "grade", "question_type"}
        sort_column = sort_by if sort_by in allowed_sort_fields else "timestamp"
        sort_desc = (sort_dir.lower() != "asc")

        if include == "details":
            select_fields = "id, short_id, user_id, question_type, grade, reading_marks, writing_marks, ao1_marks, ao2_marks, ao3_marks, content_structure_marks, style_accuracy_marks, student_response, improvement_suggestions, strengths, next_steps, feedback, timestamp"
        else:
            select_fields = "id, short_id, user_id, question_type, grade, reading_marks, writing_marks, ao1_marks, ao2_marks, ao3_marks, timestamp"

        query = supabase.table('assessment_evaluations').select(select_fields, count='exact')

        if question_types:
            types_list = [t for t in (question_types.split(',') if question_types else []) if t]
            if types_list:
                query = query.in_('question_type', types_list)
        if user_id:
            query = query.eq('user_id', user_id)
        if date_from:
            query = query.gte('timestamp', date_from)
        if date_to:
            query = query.lte('timestamp', date_to)
        if grade_contains:
            try:
                query = query.ilike('grade', f"%{grade_contains}%")
            except Exception:
                query = query.or_(f"grade.ilike.%{grade_contains}%")

        if search:
            search_value = search.replace('%', '').replace(' ', '%')
            or_filter = f"short_id.ilike.%{search_value}%,question_type.ilike.%{search_value}%,user_id.ilike.%{search_value}%"
            query = query.or_(or_filter)

        query = query.order(sort_column, desc=sort_desc).range(offset, offset + limit - 1)
        result = query.execute()

        return {
            "data": result.data or [],
            "count": result.count or 0,
            "limit": limit,
            "offset": offset
        }
    except Exception as e:
        logger.error(f"Error getting evaluations: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Evaluations error: {str(e)}")

@router.get("/search")
async def admin_global_search(request: Request, q: str, limit: int = 10):
    """Global admin search across users, evaluations, and feedback with related data."""
    try:
        require_admin_access(request)
        supabase = get_supabase_client()
        query = q.strip()
        if not query:
            return {"query": q, "users": [], "evaluations": [], "feedback": []}

        # Users
        users_q = supabase.table('assessment_users').select('uid, email, display_name, current_plan, credits, created_at') \
            .or_(f"uid.ilike.%{query}%,email.ilike.%{query}%,display_name.ilike.%{query}%") \
            .order('created_at', desc=True).limit(limit).execute()
        users = users_q.data or []

        # Evaluations
        evals_q = supabase.table('assessment_evaluations').select('id, short_id, user_id, question_type, grade, timestamp') \
            .or_(f"short_id.ilike.%{query}%,user_id.ilike.%{query}%,question_type.ilike.%{query}%,grade.ilike.%{query}%") \
            .order('timestamp', desc=True).limit(limit).execute()
        evaluations = evals_q.data or []

        # Feedback
        try:
            fb_q = supabase.table('assessment_feedback').select('id, evaluation_id, user_id, category, accurate, comments, created_at') \
                .or_(f"comments.ilike.%{query}%,category.ilike.%{query}%") \
                .order('created_at', desc=True).limit(limit).execute()
            feedback = fb_q.data or []
        except Exception:
            feedback = []

        # Related: users for evaluations
        user_ids = list({e.get('user_id') for e in evaluations if e.get('user_id')})
        users_map: Dict[str, Any] = {}
        if user_ids:
            users_rel_q = supabase.table('assessment_users').select('uid, email, display_name, current_plan') \
                .in_('uid', user_ids).execute()
            for u in users_rel_q.data or []:
                users_map[u['uid']] = u
        evaluations_with_users = [
            {**e, 'user': users_map.get(e.get('user_id'))} for e in evaluations
        ]

        # Related: recent evaluations for users
        users_with_recent: List[Dict[str, Any]] = []
        for u in users[:limit]:
            try:
                recent = supabase.table('assessment_evaluations').select('id, short_id, question_type, grade, timestamp') \
                    .eq('user_id', u['uid']).order('timestamp', desc=True).limit(3).execute()
                users_with_recent.append({**u, 'recent_evaluations': recent.data or []})
            except Exception:
                users_with_recent.append({**u, 'recent_evaluations': []})

        return {
            "query": q,
            "users": users_with_recent,
            "evaluations": evaluations_with_users,
            "feedback": feedback
        }
    except Exception as e:
        logger.error(f"Admin global search error: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Search error: {str(e)}")

@router.get("/analytics")
async def get_admin_analytics(request: Request, days: int = 30):
    """Ultra-comprehensive analytics for admin: totals, trends, distributions, time-based analysis, and much more."""
    try:
        logger.info("=== ANALYTICS ENDPOINT DEBUG START ===")
        logger.info(f"Days parameter: {days}")
        
        require_admin_access(request)
        logger.info("Admin access verified for analytics")
        
        supabase = get_supabase_client()
        logger.info("Supabase client obtained for analytics")
        from datetime import datetime, timedelta, date
        from collections import Counter
        import statistics
        
        # Ensure days is within reasonable bounds
        days = max(1, min(days, 365))
        
        start_dt = datetime.utcnow() - timedelta(days=days)
        start_date = start_dt.date().isoformat()

        # Helpers
        def parse_grade_value(g):
            try:
                if g is None:
                    return 0.0
                if isinstance(g, (int, float)):
                    return float(g)
                s = str(g)
                if '/' in s:
                    num, den = s.split('/')[:2]
                    num = float(num.strip() or 0)
                    den = float(den.strip() or 1)
                    return (num / den) * 100.0 if den else num
                return float(s)
            except Exception:
                return 0.0

        # Base datasets - get more comprehensive data
        users_rows = supabase.table('assessment_users').select('uid, email, display_name, current_plan, credits, created_at, updated_at').execute().data or []
        evals_rows = supabase.table('assessment_evaluations').select('id, user_id, question_type, grade, timestamp, short_id, reading_marks, writing_marks, ao1_marks, ao2_marks').execute().data or []

        # Enhanced totals with growth trends
        total_users = len(users_rows)
        total_evaluations = len(evals_rows)
        users_with_evals = {e.get('user_id') for e in evals_rows if e.get('user_id')}
        unique_users_with_evals = len(users_with_evals)

        # Growth trend calculations
        prev_period_start = start_dt - timedelta(days=days)
        prev_period_date = prev_period_start.date().isoformat()
        
        prev_users = sum(1 for u in users_rows if prev_period_date <= (u.get('created_at') or '')[:10] < start_date)
        new_users = sum(1 for u in users_rows if (u.get('created_at') or '')[:10] >= start_date)
        user_growth_rate = f"{((new_users - prev_users) / prev_users * 100) if prev_users else 0:.1f}%"
        user_growth_trend = "up" if new_users > prev_users else "down" if new_users < prev_users else "flat"

        prev_evals = sum(1 for e in evals_rows if prev_period_date <= (e.get('timestamp') or '')[:10] < start_date)
        evals_last_n = sum(1 for e in evals_rows if (e.get('timestamp') or '')[:10] >= start_date)
        eval_growth_rate = f"{((evals_last_n - prev_evals) / prev_evals * 100) if prev_evals else 0:.1f}%"
        eval_growth_trend = "up" if evals_last_n > prev_evals else "down" if evals_last_n < prev_evals else "flat"

        # Advanced user metrics
        avg_evals_per_user = (total_evaluations / total_users) if total_users else 0

        # Activity-based user counts with more granular periods
        def get_active_users(period_days):
            cutoff = (datetime.utcnow() - timedelta(days=period_days)).date().isoformat()
            return len({e.get('user_id') for e in evals_rows if e.get('user_id') and (e.get('timestamp') or '')[:10] >= cutoff})

        active_1d = get_active_users(1)
        active_7d = get_active_users(7)
        active_30d = get_active_users(30)

        # Retention calculations
        retention_7d = (active_7d / total_users * 100) if total_users else 0
        retention_30d = (active_30d / total_users * 100) if total_users else 0
        retention_rate = (unique_users_with_evals / total_users * 100) if total_users else 0

        # Conversion rates
        conversion_overall = (unique_users_with_evals / total_users * 100) if total_users else 0
        recent_users = sum(1 for u in users_rows if (u.get('created_at') or '')[:10] >= start_date)
        recent_converted = len({e.get('user_id') for e in evals_rows if e.get('user_id') and (e.get('timestamp') or '')[:10] >= start_date})
        conversion_last_n = (recent_converted / recent_users * 100) if recent_users else 0

        # Revenue estimation (basic calculation)
        plan_revenue = {'free': 0, 'basic': 9.99, 'premium': 19.99, 'pro': 39.99}
        estimated_revenue = sum(plan_revenue.get(u.get('current_plan', 'free'), 0) for u in users_rows)

        # Enhanced daily breakdown with more metrics
        daily = {}
        for i in range(days):
            day = (start_dt.date() + timedelta(days=i)).isoformat()
            daily[day] = {
                'date': day,
                'evaluations': 0,
                'new_users': 0,
                'active_users': 0,
                'grades': [],
                'cumulative_users': 0,
                'cumulative_evaluations': 0
            }

        # Populate daily data
        for u in users_rows:
            day = (u.get('created_at') or '')[:10]
            if day in daily:
                daily[day]['new_users'] += 1

        for e in evals_rows:
            day = (e.get('timestamp') or '')[:10]
            if day in daily:
                daily[day]['evaluations'] += 1
                grade = parse_grade_value(e.get('grade'))
                if grade > 0:
                    daily[day]['grades'].append(grade)

        # Calculate cumulative and derived metrics
        cumulative_users = sum(1 for u in users_rows if (u.get('created_at') or '')[:10] < start_date)
        cumulative_evals = sum(1 for e in evals_rows if (e.get('timestamp') or '')[:10] < start_date)

        for day in sorted(daily.keys()):
            cumulative_users += daily[day]['new_users']
            cumulative_evals += daily[day]['evaluations']
            daily[day]['cumulative_users'] = cumulative_users
            daily[day]['cumulative_evaluations'] = cumulative_evals
            daily[day]['avg_grade'] = sum(daily[day]['grades']) / len(daily[day]['grades']) if daily[day]['grades'] else 0
            daily[day]['retention_rate'] = (daily[day]['evaluations'] / max(daily[day]['new_users'], 1)) * 100

        # Hourly distribution analysis
        hourly_dist = defaultdict(lambda: {'count': 0, 'grades': []})
        for e in evals_rows:
            if e.get('timestamp'):
                try:
                    hour = datetime.fromisoformat(e['timestamp'].replace('Z', '+00:00')).hour
                    hourly_dist[hour]['count'] += 1
                    grade = parse_grade_value(e.get('grade'))
                    if grade > 0:
                        hourly_dist[hour]['grades'].append(grade)
                except:
                    pass

        hourly_distribution = [
            {
                'hour': h,
                'count': hourly_dist[h]['count'],
                'avg_grade': sum(hourly_dist[h]['grades']) / len(hourly_dist[h]['grades']) if hourly_dist[h]['grades'] else 0
            }
            for h in range(24)
        ]

        # Weekly distribution analysis
        weekly_dist = defaultdict(lambda: {'count': 0, 'grades': []})
        for e in evals_rows:
            if e.get('timestamp'):
                try:
                    weekday = datetime.fromisoformat(e['timestamp'].replace('Z', '+00:00')).weekday()
                    weekly_dist[weekday]['count'] += 1
                    grade = parse_grade_value(e.get('grade'))
                    if grade > 0:
                        weekly_dist[weekday]['grades'].append(grade)
                except:
                    pass

        weekly_distribution = [
            {
                'day_of_week': d,
                'count': weekly_dist[d]['count'],
                'avg_grade': sum(weekly_dist[d]['grades']) / len(weekly_dist[d]['grades']) if weekly_dist[d]['grades'] else 0
            }
            for d in range(7)
        ]

        # Enhanced question type analysis
        qtype = defaultdict(lambda: {'count': 0, 'grades': [], 'users': set(), 'recent': 0})
        qt_recent = defaultdict(int)
        
        for e in evals_rows:
            qt = e.get('question_type') or 'Unknown'
            qtype[qt]['count'] += 1
            qtype[qt]['users'].add(e.get('user_id'))
            
            if (e.get('timestamp') or '')[:10] >= start_date:
                qt_recent[qt] += 1
                qtype[qt]['recent'] += 1
            
            grade = parse_grade_value(e.get('grade'))
            if grade > 0:
                qtype[qt]['grades'].append(grade)

        # Convert to final format with additional metrics
        for qt in qtype:
            grades = qtype[qt]['grades']
            qtype[qt]['avg_grade'] = sum(grades) / len(grades) if grades else 0
            qtype[qt]['unique_users'] = len(qtype[qt]['users'])
            qtype[qt]['completion_rate'] = (qtype[qt]['count'] / qtype[qt]['unique_users']) if qtype[qt]['unique_users'] else 0
            qtype[qt]['avg_time_spent'] = 0  # Placeholder for future time tracking
            del qtype[qt]['users']  # Remove set for JSON serialization
            del qtype[qt]['grades']  # Remove list for cleaner output

        # Grade distribution analysis
        all_grades = [parse_grade_value(e.get('grade')) for e in evals_rows if parse_grade_value(e.get('grade')) > 0]
        
        grade_ranges = [
            ('0-20', 0, 20), ('21-40', 21, 40), ('41-60', 41, 60),
            ('61-80', 61, 80), ('81-100', 81, 100)
        ]
        
        grade_distribution = []
        for range_name, min_grade, max_grade in grade_ranges:
            count = sum(1 for g in all_grades if min_grade <= g <= max_grade)
            percentage = (count / len(all_grades) * 100) if all_grades else 0
            grade_distribution.append({
                'range': range_name,
                'count': count,
                'percentage': percentage
            })

        # Enhanced grade statistics
        grade_stats = {}
        if all_grades:
            grade_stats = {
                'avg': round(sum(all_grades) / len(all_grades), 2),
                'p25': round(statistics.quantiles(all_grades, n=4)[0], 2),
                'p50': round(statistics.median(all_grades), 2),
                'p75': round(statistics.quantiles(all_grades, n=4)[2], 2),
                'p90': round(statistics.quantiles(all_grades, n=10)[8], 2),
                'std_dev': round(statistics.stdev(all_grades), 2),
                'total_graded': len(all_grades),
                'min': round(min(all_grades), 2),
                'max': round(max(all_grades), 2)
            }

        # Plan distribution with enhanced metrics
        plan_counts = Counter(u.get('current_plan', 'free') for u in users_rows)
        plan_data = []
        for plan, count in plan_counts.items():
            plan_users = [u for u in users_rows if u.get('current_plan') == plan]
            plan_evals = [e for e in evals_rows if e.get('user_id') in {u.get('uid') for u in plan_users}]
            
            plan_data.append({
                'plan': plan,
                'count': count,
                'revenue': count * plan_revenue.get(plan, 0),
                'avg_evaluations': len(plan_evals) / count if count else 0,
                'churn_rate': 0  # Placeholder for churn calculation
            })

        # Enhanced user distribution
        user_eval_counts = Counter()
        for e in evals_rows:
            if e.get('user_id'):
                user_eval_counts[e['user_id']] += 1

        eval_buckets = ['0', '1', '2-5', '6-10', '11-20', '21+']
        distribution = []
        for bucket in eval_buckets:
            if bucket == '0':
                count = total_users - len(user_eval_counts)
            elif bucket == '1':
                count = sum(1 for c in user_eval_counts.values() if c == 1)
            elif bucket == '2-5':
                count = sum(1 for c in user_eval_counts.values() if 2 <= c <= 5)
            elif bucket == '6-10':
                count = sum(1 for c in user_eval_counts.values() if 6 <= c <= 10)
            elif bucket == '11-20':
                count = sum(1 for c in user_eval_counts.values() if 11 <= c <= 20)
            elif bucket == '21+':
                count = sum(1 for c in user_eval_counts.values() if c >= 21)
            else:
                count = 0
            
            distribution.append({'bucket': bucket, 'users': count})

        # Enhanced top users with more metrics
        user_stats = defaultdict(lambda: {'count': 0, 'grades': [], 'days': set(), 'streak': 0})
        
        for e in evals_rows:
            if (e.get('timestamp') or '')[:10] >= start_date and e.get('user_id'):
                user_id = e['user_id']
                user_stats[user_id]['count'] += 1
                user_stats[user_id]['days'].add((e.get('timestamp') or '')[:10])
                grade = parse_grade_value(e.get('grade'))
                if grade > 0:
                    user_stats[user_id]['grades'].append(grade)

        # Get user display names
        user_names = {u.get('uid'): u.get('display_name') or u.get('email', '').split('@')[0] for u in users_rows}
        
        top_users_last_n = []
        for user_id, stats in sorted(user_stats.items(), key=lambda x: x[1]['count'], reverse=True)[:20]:
            top_users_last_n.append({
                'user_id': user_id,
                'display_name': user_names.get(user_id, 'Unknown'),
                'count': stats['count'],
                'avg_grade': sum(stats['grades']) / len(stats['grades']) if stats['grades'] else 0,
                'active_days': len(stats['days']),
                'streak': stats['streak'],  # Placeholder for streak calculation
                'total_time': 0  # Placeholder for time tracking
            })

        # Time to first evaluation analysis
        user_first_eval = {}
        for e in evals_rows:
            user_id = e.get('user_id')
            if user_id:
                eval_date = e.get('timestamp', '')[:10]
                if user_id not in user_first_eval or eval_date < user_first_eval[user_id]:
                    user_first_eval[user_id] = eval_date

        time_to_first = []
        for u in users_rows:
            user_id = u.get('uid')
            created = u.get('created_at', '')[:10]
            if user_id in user_first_eval and created:
                try:
                    created_date = datetime.fromisoformat(created).date()
                    first_eval_date = datetime.fromisoformat(user_first_eval[user_id]).date()
                    days_diff = (first_eval_date - created_date).days
                    if days_diff >= 0:
                        time_to_first.append(days_diff)
                except:
                    pass

        tffe = {}
        if time_to_first:
            tffe = {
                'avg_days': round(sum(time_to_first) / len(time_to_first), 2),
                'median_days': round(statistics.median(time_to_first), 2),
                'count': len(time_to_first)
            }

        # Top question types analysis
        top_qtypes_recent = sorted([
            {"question_type": k, "count": v} 
            for k, v in qt_recent.items()
        ], key=lambda x: x['count'], reverse=True)[:15]

        qt_grade_sum = defaultdict(float)
        qt_grade_count = defaultdict(int)
        for e in evals_rows:
            qt = e.get('question_type') or 'Unknown'
            val = parse_grade_value(e.get('grade'))
            qt_grade_sum[qt] += val
            qt_grade_count[qt] += 1

        top_qtypes_by_avg = sorted([
            {
                "question_type": k, 
                "avg_grade": round((qt_grade_sum[k]/qt_grade_count[k]), 2) if qt_grade_count[k] else 0.0
            }
            for k in qt_grade_sum
        ], key=lambda x: x['avg_grade'], reverse=True)[:15]

        return {
            "totals": {
                "total_users": total_users,
                "total_evaluations": total_evaluations,
                "unique_users_with_evaluations": unique_users_with_evals,
                "new_users_last_n_days": new_users,
                "evaluations_last_n_days": evals_last_n,
                "avg_evaluations_per_user": round(avg_evals_per_user, 2),
                "active_users_1d": active_1d,
                "active_users_7d": active_7d,
                "active_users_30d": active_30d,
                "retention_rate": round(retention_rate, 2),
                "retention_7d": round(retention_7d, 2),
                "retention_30d": round(retention_30d, 2),
                "conversion_overall_pct": round(conversion_overall, 2),
                "conversion_last_n_days_pct": round(conversion_last_n, 2),
                "estimated_revenue": round(estimated_revenue, 2),
                "user_growth_trend": user_growth_trend,
                "user_growth_rate": user_growth_rate,
                "evaluation_growth_trend": eval_growth_trend,
                "evaluation_growth_rate": eval_growth_rate,
            },
            "daily": [daily[day] for day in sorted(daily.keys())],
            "hourly_distribution": hourly_distribution,
            "weekly_distribution": weekly_distribution,
            "by_question_type": [{"question_type": k, **v} for k, v in qtype.items()],
            "by_plan": plan_data,
            "evaluations_per_user_distribution": distribution,
            "grade_stats": grade_stats,
            "grade_distribution": grade_distribution,
            "time_to_first_evaluation": tffe,
            "top_users_last_n_days": top_users_last_n,
            "top_question_types_recent": top_qtypes_recent,
            "top_question_types_by_avg": top_qtypes_by_avg,
        }
    except Exception as e:
        logger.error(f"Admin analytics error: {str(e)}")
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=f"Analytics error: {str(e)}")

@router.get("/dashboard/users/{user_id}")
async def get_user_detail_admin(request: Request, user_id: str):
    """Get comprehensive user details for admin view including evaluations, activity, and subscription history."""
    try:
        logger.info("=== USER DETAIL ENDPOINT DEBUG START ===")
        logger.info(f"User ID: {user_id}")
        
        require_admin_access(request)
        logger.info("Admin access verified for user detail")
        
        supabase = get_supabase_client()
        logger.info("Supabase client obtained for user detail")
        from datetime import datetime, timedelta
        
        logger.info(f"Fetching user details for user_id: {user_id}")
        
        # Get user basic info
        user_response = supabase.table('assessment_users').select('*').eq('uid', user_id).execute()
        if not user_response.data:
            logger.warning(f"User not found: {user_id}")
            raise HTTPException(status_code=404, detail="User not found")
        
        user = user_response.data[0]
        logger.info(f"Found user: {user.get('email', 'unknown')} with {user.get('questions_marked', 0)} marked questions")
        
        # Get user's evaluations with detailed info (limit to recent 100 for performance)
        logger.info(f"Fetching evaluations for user: {user_id}")
        evaluations_response = supabase.table('assessment_evaluations').select(
            'id, short_id, user_id, question_type, grade, reading_marks, writing_marks, ao1_marks, ao2_marks, ao3_marks, '
            'content_structure_marks, style_accuracy_marks, student_response, improvement_suggestions, strengths, '
            'next_steps, feedback, timestamp'
        ).eq('user_id', user_id).order('timestamp', desc=True).limit(100).execute()
        
        evaluations = evaluations_response.data or []
        logger.info(f"Fetched {len(evaluations)} evaluations")
        
        # Get total count of evaluations for this user (for stats)
        total_evaluations_response = supabase.table('assessment_evaluations').select(
            'id', count='exact'
        ).eq('user_id', user_id).execute()
        
        total_evaluations = total_evaluations_response.count or len(evaluations)
        logger.info(f"Total evaluations count: {total_evaluations}")
        # Parse grades safely
        grades = []
        for e in evaluations:
            grade = e.get('grade')
            if grade is not None:
                try:
                    # Handle different grade formats
                    if isinstance(grade, (int, float)):
                        grades.append(float(grade))
                    elif isinstance(grade, str):
                        # Handle string grades like "85/100" or "85%"
                        if '/' in grade:
                            num, den = grade.split('/')[:2]
                            num = float(num.strip() or 0)
                            den = float(den.strip() or 1)
                            grades.append((num / den) * 100.0 if den else num)
                        elif grade.endswith('%'):
                            grades.append(float(grade[:-1]))
                        else:
                            grades.append(float(grade))
                except (ValueError, TypeError):
                    logger.warning(f"Could not parse grade: {grade}")
                    continue
        
        avg_grade = sum(grades) / len(grades) if grades else 0
        best_grade = max(grades) if grades else 0
        worst_grade = min(grades) if grades else 0
        
        # Create activity timeline (last 30 days) - only from the limited evaluations
        activity_timeline = []
        cutoff_date = (datetime.now() - timedelta(days=30)).isoformat()
        
        # Add evaluation activities (limited to prevent performance issues)
        for eval in evaluations[:50]:  # Further limit activity timeline to 50 most recent
            if eval.get('timestamp'):
                try:
                    # Ensure timestamp is in the right format for comparison
                    eval_timestamp = eval['timestamp']
                    if eval_timestamp >= cutoff_date:
                        # Format grade safely for display
                        grade_display = eval.get("grade", 0)
                        if isinstance(grade_display, str) and '/' in grade_display:
                            # Keep fraction format for display
                            grade_display = grade_display
                        elif isinstance(grade_display, (int, float)):
                            grade_display = f"{grade_display}%"
                        
                        activity_timeline.append({
                            'type': 'evaluation',
                            'action': f'Completed {eval.get("question_type", "Unknown")} evaluation',
                            'details': f'Grade: {grade_display} • ID: {eval.get("short_id", eval.get("id", "")[:8])}',
                            'timestamp': eval_timestamp
                        })
                except Exception as e:
                    logger.warning(f"Could not process evaluation timestamp: {e}")
                    continue
        
        # Add user registration as activity
        if user.get('created_at'):
            activity_timeline.append({
                'type': 'registration',
                'action': 'Account created',
                'details': f'Joined with {user.get("current_plan", "free")} plan',
                'timestamp': user['created_at']
            })
        
        # Sort activity timeline by timestamp (most recent first)
        activity_timeline.sort(key=lambda x: x['timestamp'], reverse=True)
        
        # Create subscription history (mock data for now - can be expanded)
        subscription_history = []
        if user.get('current_plan') and user.get('current_plan') != 'free':
            try:
                subscription_history.append({
                    'plan': user['current_plan'],
                    'status': 'active',
                    'start_date': user.get('created_at', datetime.now().isoformat()),
                    'end_date': None,
                    'price': {
                        'unlimited': 4.99,  # Updated to match actual pricing
                        'basic': 9.99,
                        'premium': 19.99,
                        'pro': 39.99
                    }.get(user['current_plan'], 0),
                    'duration_months': 1
                })
            except Exception as e:
                logger.warning(f"Could not create subscription history: {e}")
                subscription_history = []
        
        # Calculate account age
        account_age_days = 0
        if user.get('created_at'):
            try:
                created_at = user['created_at']
                # Handle different timestamp formats
                if created_at.endswith('Z'):
                    created_date = datetime.fromisoformat(created_at.replace('Z', '+00:00'))
                else:
                    created_date = datetime.fromisoformat(created_at)
                account_age_days = (datetime.now() - created_date.replace(tzinfo=None)).days
            except Exception as e:
                logger.warning(f"Could not calculate account age: {e}")
                account_age_days = 0
        
        # Enhance user object with calculated fields
        enhanced_user = {
            **user,
            'evaluations': evaluations,
            'total_evaluations': total_evaluations,
            'avg_grade': avg_grade,
            'best_grade': best_grade,
            'worst_grade': worst_grade,
            'activity_timeline': activity_timeline,
            'subscription_history': subscription_history,
            'account_age_days': account_age_days,
            'last_login': user.get('updated_at'),  # Use updated_at as proxy for last activity
            'account_status': 'active' if total_evaluations > 0 else 'inactive'
        }
        
        logger.info(f"Successfully prepared user details for {user_id}")
        return {"user": enhanced_user}
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error getting user detail for {user_id}: {str(e)}")
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=f"User detail error: {str(e)}")

@router.get("/dashboard/feedback")
async def get_feedback_admin(
    request: Request,
    limit: int = 25,
    offset: int = 0,
    search: str = "",
    category: str = "",
    accurate: str = "",
    user_id: str = "",
    evaluation_id: str = "",
    date_from: str = "",
    date_to: str = "",
    sort_by: str = "created_at",
    sort_dir: str = "desc"
):
    """Get feedback data for admin dashboard with filtering, sorting, and pagination."""
    try:
        logger.info("=== FEEDBACK ENDPOINT DEBUG START ===")
        logger.info(f"Request parameters: limit={limit}, offset={offset}, search='{search}', category='{category}', accurate='{accurate}', user_id='{user_id}', evaluation_id='{evaluation_id}', date_from='{date_from}', date_to='{date_to}', sort_by='{sort_by}', sort_dir='{sort_dir}'")
        
        require_admin_access(request)
        logger.info("Admin access verified")
        
        supabase = get_supabase_client()
        logger.info("Supabase client obtained")
        
        logger.info(f"Fetching feedback with filters: search='{search}', category='{category}', accurate='{accurate}'")
        
        # Build the query - only join with users for now
        logger.info("Building feedback query with assessment_users join only")
        query = supabase.table('assessment_feedback').select(
            'id, evaluation_id, user_id, category, accurate, comments, created_at, '
            'assessment_users!inner(uid, display_name, email)',
            count='exact'
        )
        logger.info(f"Query built: {query}")
        
        # Apply filters
        if search:
            query = query.ilike('comments', f'%{search}%')
        if category:
            query = query.eq('category', category)
        if accurate:
            query = query.eq('accurate', accurate.lower() == 'true')
        if user_id:
            query = query.eq('user_id', user_id)
        if evaluation_id:
            query = query.eq('evaluation_id', evaluation_id)
        if date_from:
            query = query.gte('created_at', date_from)
        if date_to:
            query = query.lte('created_at', date_to)
        
        # Apply sorting and pagination
        logger.info(f"Applying sort: {sort_by} {sort_dir}")
        query = query.order(sort_by, desc=(sort_dir == 'desc'))
        logger.info(f"Applying pagination: offset={offset}, limit={limit}")
        query = query.range(offset, offset + limit - 1)
        
        logger.info("Executing feedback query...")
        response = query.execute()
        logger.info(f"Query executed. Response type: {type(response)}")
        logger.info(f"Query executed. Response: {response}")
        
        # Check for errors in the response
        if hasattr(response, 'error') and response.error:
            logger.error(f"Supabase error fetching feedback: {response.error}")
            logger.error(f"Error details: {response.error}")
            raise HTTPException(status_code=500, detail=f"Feedback error: {response.error}")
        
        # Check if response.data exists
        if not hasattr(response, 'data') or not response.data:
            logger.warning("No data in response or response.data is None")
            return {"data": [], "count": 0}
        
        # Transform the data to match expected format
        feedback_data = []
        for item in response.data:
            feedback_data.append({
                'id': item['id'],
                'evaluation_id': item['evaluation_id'],
                'user_id': item['user_id'],
                'category': item['category'],
                'accurate': item['accurate'],
                'comments': item['comments'],
                'created_at': item['created_at'],
                'user': {
                    'uid': item['assessment_users']['uid'],
                    'display_name': item['assessment_users']['display_name'],
                    'email': item['assessment_users']['email']
                },
                'evaluation': {
                    'id': item['evaluation_id'],
                    'short_id': item['evaluation_id'][:8] if item['evaluation_id'] else None,
                    'question_type': 'Unknown',
                    'grade': None
                }
            })
        
        count = getattr(response, 'count', len(feedback_data))
        logger.info(f"Retrieved {len(feedback_data)} feedback items, total count: {count}")
        
        return {
            "data": feedback_data,
            "count": count
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error getting feedback: {str(e)}")
        logger.error(f"Error type: {type(e)}")
        import traceback
        logger.error(f"Traceback: {traceback.format_exc()}")
        raise HTTPException(status_code=500, detail=f"Feedback error: {str(e)}")
