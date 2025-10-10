"""
Admin Dashboard API Routes
Provides comprehensive admin dashboard data
"""

import logging
from typing import Dict, List, Any, Optional
from fastapi import APIRouter, HTTPException, Request
from pydantic import BaseModel
from datetime import datetime, timedelta

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
        users_result = supabase.table('users').select('id', count='exact').execute()
        total_users = users_result.count or 0
        
        # Get total evaluations
        evaluations_result = supabase.table('evaluations').select('id', count='exact').execute()
        total_evaluations = evaluations_result.count or 0
        
        # Get average grade
        grade_result = supabase.table('evaluations').select('total_score').execute()
        if grade_result.data:
            total_score = sum(eval.get('total_score', 0) for eval in grade_result.data)
            average_grade = total_score / len(grade_result.data) if grade_result.data else 0
        else:
            average_grade = 0
        
        # Get total credits used
        credits_result = supabase.table('users').select('credits_used').execute()
        total_credits_used = sum(user.get('credits_used', 0) for user in credits_result.data) if credits_result.data else 0
        
        # Get active users today
        today = datetime.now().date()
        active_users_result = supabase.table('users').select('id').gte('last_active', today.isoformat()).execute()
        active_users_today = len(active_users_result.data) if active_users_result.data else 0
        
        # Calculate completion rate (users who have completed at least one evaluation)
        completed_users_result = supabase.table('evaluations').select('user_id').execute()
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
        result = supabase.table('evaluations').select('created_at').gte('created_at', start_date.isoformat()).execute()
        
        # Group by date
        trends = {}
        for eval in result.data or []:
            date = eval.get('created_at', '')[:10]  # Get YYYY-MM-DD
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
        
        result = supabase.table('evaluations').select('total_score').execute()
        
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
                       if min_score <= eval.get('total_score', 0) <= max_score)
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
        
        result = supabase.table('evaluations').select('question_type', 'total_score').execute()
        
        # Group by question type
        type_stats = {}
        for eval in result.data or []:
            q_type = eval.get('question_type', 'Unknown')
            score = eval.get('total_score', 0)
            
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
        
        result = supabase.table('users').select('current_plan').execute()
        
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
        evaluations_result = supabase.table('evaluations').select('id', 'user_id', 'question_type', 'created_at').order('created_at', desc=True).limit(limit).execute()
        
        activities = []
        for eval in evaluations_result.data or []:
            activities.append(RecentActivity(
                id=eval.get('id', ''),
                type='evaluation',
                description=f"New evaluation: {eval.get('question_type', 'Unknown')}",
                timestamp=eval.get('created_at', ''),
                user_id=eval.get('user_id')
            ))
        
        # Get recent user registrations
        users_result = supabase.table('users').select('id', 'email', 'created_at').order('created_at', desc=True).limit(limit).execute()
        
        for user in users_result.data or []:
            activities.append(RecentActivity(
                id=user.get('id', ''),
                type='user_registration',
                description=f"New user: {user.get('email', 'Unknown')}",
                timestamp=user.get('created_at', ''),
                user_id=user.get('id')
            ))
        
        # Sort by timestamp and limit
        activities.sort(key=lambda x: x.timestamp, reverse=True)
        return activities[:limit]
        
    except Exception as e:
        logger.error(f"Error getting recent activity: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Recent activity error: {str(e)}")

@router.get("/dashboard/users", response_model=List[Dict[str, Any]])
async def get_all_users_admin(request: Request, limit: int = 100, offset: int = 0):
    """Get all users for admin view"""
    try:
        require_admin_access(request)
        supabase = get_supabase_client()
        
        result = supabase.table('users').select('*').order('created_at', desc=True).range(offset, offset + limit - 1).execute()
        
        return result.data or []
        
    except Exception as e:
        logger.error(f"Error getting users: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Users error: {str(e)}")

@router.get("/dashboard/evaluations", response_model=List[Dict[str, Any]])
async def get_all_evaluations_admin(request: Request, limit: int = 100, offset: int = 0):
    """Get all evaluations for admin view"""
    try:
        require_admin_access(request)
        supabase = get_supabase_client()
        
        result = supabase.table('evaluations').select('*').order('created_at', desc=True).range(offset, offset + limit - 1).execute()
        
        return result.data or []
        
    except Exception as e:
        logger.error(f"Error getting evaluations: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Evaluations error: {str(e)}")
