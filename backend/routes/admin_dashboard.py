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
    """Comprehensive analytics for admin: totals, new users, unique users with evaluations, totals, averages, per-day counts, and rich breakdowns."""
    try:
        require_admin_access(request)
        supabase = get_supabase_client()
        from datetime import datetime, timedelta, date
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

        # Base datasets
        users_rows = supabase.table('assessment_users').select('uid, email, display_name, current_plan, credits, created_at').execute().data or []
        evals_rows = supabase.table('assessment_evaluations').select('id, user_id, question_type, grade, timestamp, short_id').execute().data or []

        # Totals
        total_users = len(users_rows)
        total_evaluations = len(evals_rows)
        users_with_evals = {e.get('user_id') for e in evals_rows if e.get('user_id')}
        unique_users_with_evals = len(users_with_evals)

        # New users (last N days)
        new_users = sum(1 for u in users_rows if (u.get('created_at') or '')[:10] >= start_date)

        # Evaluations last N days
        evals_last_n = sum(1 for e in evals_rows if (e.get('timestamp') or '')[:10] >= start_date)

        # Avg evaluations per user (overall)
        avg_evals_per_user = (total_evaluations / total_users) if total_users else 0

        # Active users 1d/7d/30d based on evaluations
        def count_active_unique(days_window: int) -> int:
            cutoff = (datetime.utcnow() - timedelta(days=days_window)).date().isoformat()
            return len({e.get('user_id') for e in evals_rows if (e.get('timestamp') or '')[:10] >= cutoff})
        active_1d = count_active_unique(1)
        active_7d = count_active_unique(7)
        active_30d = count_active_unique(30)

        # Daily counts for users and evaluations
        daily_evals = defaultdict(int)
        for e in evals_rows:
            d = (e.get('timestamp') or '')[:10]
            if d and d >= start_date:
                daily_evals[d] += 1
        daily_users = defaultdict(int)
        for u in users_rows:
            d = (u.get('created_at') or '')[:10]
            if d and d >= start_date:
                daily_users[d] += 1
        daily = []
        sdate = date.fromisoformat(start_date)
        for i in range(days):
            d = (sdate + timedelta(days=i)).isoformat()
            daily.append({"date": d, "evaluations": daily_evals.get(d, 0), "new_users": daily_users.get(d, 0)})

        # Breakdown by question type
        qtype = defaultdict(lambda: {"count": 0, "avg_grade": 0.0, "sum": 0.0})
        for r in evals_rows:
            qt = r.get('question_type') or 'Unknown'
            qtype[qt]["count"] += 1
            qtype[qt]["sum"] += parse_grade_value(r.get('grade'))
        for qt in qtype:
            c = qtype[qt]["count"] or 1
            qtype[qt]["avg_grade"] = round(qtype[qt]["sum"] / c, 2)
            qtype[qt].pop('sum', None)

        # Plan stats
        plan_counts = defaultdict(int)
        for u in users_rows:
            plan_counts[u.get('current_plan') or 'free'] += 1
        by_plan = [{"plan": k, "count": v} for k, v in plan_counts.items()]

        # Evaluations per user distribution
        evals_per_user = defaultdict(int)
        for e in evals_rows:
            uid = e.get('user_id')
            if uid:
                evals_per_user[uid] += 1
        bins = {"0": 0, "1": 0, "2-4": 0, "5-9": 0, "10+": 0}
        for u in users_rows:
            c = evals_per_user.get(u.get('uid'), 0)
            if c == 0: bins["0"] += 1
            elif c == 1: bins["1"] += 1
            elif 2 <= c <= 4: bins["2-4"] += 1
            elif 5 <= c <= 9: bins["5-9"] += 1
            else: bins["10+"] += 1
        distribution = [{"bucket": k, "users": v} for k, v in bins.items()]

        # Top users by evaluations (last N days)
        recent_counts = defaultdict(int)
        for e in evals_rows:
            if (e.get('timestamp') or '')[:10] >= start_date:
                recent_counts[e.get('user_id')] += 1
        user_map = {u.get('uid'): u for u in users_rows}
        top_users_last_n = sorted(
            [
                {
                    "user_id": uid,
                    "display_name": (user_map.get(uid) or {}).get('display_name'),
                    "email": (user_map.get(uid) or {}).get('email'),
                    "count": cnt,
                }
                for uid, cnt in recent_counts.items() if uid
            ], key=lambda x: x["count"], reverse=True
        )[:10]

        # Grade stats (overall)
        grades = [parse_grade_value(e.get('grade')) for e in evals_rows if e.get('grade') is not None]
        grades_sorted = sorted(grades)
        def pct(p):
            if not grades_sorted:
                return 0.0
            k = int((len(grades_sorted)-1) * p)
            return round(grades_sorted[k], 2)
        grade_stats = {
            "avg": round(sum(grades_sorted)/len(grades_sorted), 2) if grades_sorted else 0.0,
            "p50": pct(0.5),
            "p75": pct(0.75),
            "p90": pct(0.9),
        }

        # Conversion: users with >=1 evaluation overall and among those created in last N days
        conversion_overall = round((unique_users_with_evals / total_users) * 100.0, 2) if total_users else 0.0
        new_user_ids = {u.get('uid') for u in users_rows if (u.get('created_at') or '')[:10] >= start_date}
        new_with_eval = len({uid for uid in new_user_ids if evals_per_user.get(uid, 0) > 0})
        conversion_last_n = round((new_with_eval / len(new_user_ids)) * 100.0, 2) if new_user_ids else 0.0

        # Time to first evaluation stats (days)
        first_eval_ts = {}
        for e in sorted(evals_rows, key=lambda x: x.get('timestamp') or ''):
            uid = e.get('user_id')
            if uid and uid not in first_eval_ts and e.get('timestamp'):
                first_eval_ts[uid] = e.get('timestamp')
        deltas = []
        for u in users_rows:
            uid = u.get('uid')
            created = u.get('created_at')
            first_ts = first_eval_ts.get(uid)
            if created and first_ts:
                try:
                    c = datetime.fromisoformat(created.replace('Z',''))
                    f = datetime.fromisoformat(first_ts.replace('Z',''))
                    delta_days = max(0.0, (f - c).total_seconds() / 86400.0)
                    deltas.append(delta_days)
                except Exception:
                    pass
        deltas_sorted = sorted(deltas)
        def median(vals):
            if not vals:
                return 0.0
            n = len(vals)
            m = n // 2
            return round((vals[m] if n % 2 else (vals[m-1] + vals[m]) / 2), 2)
        tffe = {
            "avg_days": round(sum(deltas_sorted)/len(deltas_sorted), 2) if deltas_sorted else 0.0,
            "median_days": median(deltas_sorted),
            "count": len(deltas_sorted)
        }

        # Top question types by last N days and by avg grade
        qt_recent = defaultdict(int)
        qt_grade_sum = defaultdict(float)
        qt_grade_count = defaultdict(int)
        for e in evals_rows:
            qt = e.get('question_type') or 'Unknown'
            if (e.get('timestamp') or '')[:10] >= start_date:
                qt_recent[qt] += 1
            val = parse_grade_value(e.get('grade'))
            qt_grade_sum[qt] += val
            qt_grade_count[qt] += 1
        top_qtypes_recent = sorted([{ "question_type": k, "count": v } for k, v in qt_recent.items()], key=lambda x: x['count'], reverse=True)[:10]
        top_qtypes_by_avg = sorted([
            {"question_type": k, "avg_grade": round((qt_grade_sum[k]/qt_grade_count[k]), 2) if qt_grade_count[k] else 0.0}
            for k in qt_grade_sum
        ], key=lambda x: x['avg_grade'], reverse=True)[:10]

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
                "conversion_overall_pct": conversion_overall,
                "conversion_last_n_days_pct": conversion_last_n,
            },
            "daily": daily,
            "by_question_type": [{"question_type": k, **v} for k, v in qtype.items()],
            "by_plan": [{"plan": k, "count": v} for k, v in plan_counts.items()],
            "evaluations_per_user_distribution": distribution,
            "grade_stats": grade_stats,
            "time_to_first_evaluation": tffe,
            "top_users_last_n_days": top_users_last_n,
            "top_question_types_recent": top_qtypes_recent,
            "top_question_types_by_avg": top_qtypes_by_avg,
        }
    except Exception as e:
        logger.error(f"Admin analytics error: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Analytics error: {str(e)}")
