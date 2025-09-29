"""
User management routes.
"""
from fastapi import APIRouter, HTTPException, Request, Depends
import logging
import jwt
from datetime import datetime
from typing import Dict, Any
from config.settings import get_user_management_service, get_supabase_client

router = APIRouter()
logger = logging.getLogger(__name__)

# Get services
supabase = get_supabase_client()
user_management_service = get_user_management_service(supabase)

@router.get("/users")
async def get_all_users():
    """Get all users"""
    try:
        response = supabase.table('assessment_users').select('*').execute()
        return {"users": response.data}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error retrieving users: {str(e)}")

@router.get("/users/{user_id}/preferences")
async def get_user_preferences(user_id: str):
    """Get user preferences"""
    try:
        response = supabase.table('assessment_users').select(
            'email_notifications, marketing_emails, show_progress, use_data_for_training, '
            'auto_save_drafts, show_tips, sound_effects, compact_mode, language_preference, '
            'timezone, notification_frequency, feedback_detail_level, theme_color, font_size, '
            'accessibility_mode, keyboard_shortcuts, auto_advance, show_word_count, '
            'show_character_count, spell_check, grammar_suggestions, writing_style, '
            'focus_mode, distraction_free, auto_backup, cloud_sync, privacy_mode, '
            'data_retention_days, export_format, backup_frequency'
        ).eq('uid', user_id).execute()
        
        if not response.data:
            raise HTTPException(status_code=404, detail="User not found")
        
        return response.data[0]
    except Exception as e:
        logger.error(f"Error getting user preferences: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error retrieving preferences: {str(e)}")

@router.put("/users/{user_id}/preferences")
async def update_user_preferences(user_id: str, preferences: Dict[str, Any]):
    """Update user preferences"""
    try:
        # Validate preference keys
        valid_keys = {
            'email_notifications', 'marketing_emails', 'show_progress', 'use_data_for_training',
            'auto_save_drafts', 'show_tips', 'sound_effects', 'compact_mode', 'language_preference',
            'timezone', 'notification_frequency', 'feedback_detail_level', 'theme_color', 'font_size',
            'accessibility_mode', 'keyboard_shortcuts', 'auto_advance', 'show_word_count',
            'show_character_count', 'spell_check', 'grammar_suggestions', 'writing_style',
            'focus_mode', 'distraction_free', 'auto_backup', 'cloud_sync', 'privacy_mode',
            'data_retention_days', 'export_format', 'backup_frequency'
        }
        
        # Filter to only valid keys
        filtered_preferences = {k: v for k, v in preferences.items() if k in valid_keys}
        
        if not filtered_preferences:
            raise HTTPException(status_code=400, detail="No valid preferences provided")
        
        # Add updated_at timestamp
        filtered_preferences['updated_at'] = datetime.utcnow().isoformat()
        
        response = supabase.table('assessment_users').update(filtered_preferences).eq('uid', user_id).execute()
        
        if not response.data:
            raise HTTPException(status_code=404, detail="User not found")
        
        logger.info(f"Updated preferences for user {user_id}: {list(filtered_preferences.keys())}")
        return {"message": "Preferences updated successfully", "preferences": response.data[0]}
    except Exception as e:
        logger.error(f"Error updating user preferences: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error updating preferences: {str(e)}")

@router.post("/users")
async def create_or_get_user(user_data: dict):
    """Create a new user or get existing user using the user management service"""
    try:
        if not user_management_service:
            raise HTTPException(status_code=500, detail="User management service not available")
        
        user_id = user_data.get('user_id')
        email = user_data.get('email')
        name = user_data.get('name')
        
        if not user_id or user_id == "undefined":
            raise HTTPException(status_code=400, detail="Invalid user ID provided")
        
        if not email:
            raise HTTPException(status_code=400, detail="Email is required")
        
        logger.info(f"Creating or getting user: {user_id} ({email})")
        
        # Use the user management service to create or restore user
        result = await user_management_service.create_or_restore_user(
            user_id=user_id,
            email=email,
            display_name=name,
            academic_level='igcse',
            current_plan='free',  # Start with free plan
            credits=3,  # Free tier credits
            is_launch_user=False,  # Will be set to True only if they accept launch offer
            photo_url=None,
            dark_mode=False
        )
        
        if result['success']:
            logger.info(f"Successfully created/restored user: {user_id}")
            return {
                "user": result['user'],
                "operation": result['operation'],
                "message": result['message']
            }
        else:
            logger.error(f"Failed to create/restore user: {user_id} - {result.get('error')}")
            raise HTTPException(status_code=500, detail=f"User creation/restoration failed: {result.get('error')}")
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Exception in create_or_get_user: {str(e)}")
        raise HTTPException(status_code=500, detail=f"User creation error: {str(e)}")

@router.get("/users/{user_id}")
async def get_user(user_id: str, request: Request):
    """Get user by ID using the user management service with automatic recovery"""
    try:
        print(f"🔍 DEBUG users.py - get_user called with user_id: {user_id}")
        print(f"🔍 DEBUG users.py - user_management_service available: {user_management_service is not None}")
        print(f"🔍 DEBUG users.py - supabase client available: {supabase is not None}")
        
        if not user_management_service:
            print("❌ DEBUG users.py - user_management_service is None!")
            raise HTTPException(status_code=500, detail="User management service not available")
        
        if not user_id or user_id == "undefined":
            print(f"❌ DEBUG users.py - Invalid user_id: {user_id}")
            raise HTTPException(status_code=400, detail="Invalid user ID provided")
        
        logger.info(f"Getting user with ID: {user_id}")
        print(f"🔍 DEBUG users.py - Calling user_management_service.get_user_by_id({user_id})")
        
        # Use the user management service to get user
        user_data = await user_management_service.get_user_by_id(user_id)
        
        print(f"🔍 DEBUG users.py - get_user_by_id result: {user_data}")
        print(f"🔍 DEBUG users.py - user_data type: {type(user_data)}")
        if user_data:
            print(f"🔍 DEBUG users.py - user_data keys: {list(user_data.keys()) if isinstance(user_data, dict) else 'Not a dict'}")
            print(f"🔍 DEBUG users.py - current_plan: {user_data.get('current_plan', 'NOT_FOUND')}")
            print(f"🔍 DEBUG users.py - credits: {user_data.get('credits', 'NOT_FOUND')}")
            print(f"🔍 DEBUG users.py - questions_marked: {user_data.get('questions_marked', 'NOT_FOUND')}")
        
        if user_data:
            logger.info(f"Successfully retrieved user: {user_id}")
            print(f"✅ DEBUG users.py - Returning user data: {user_data}")
            return {"user": user_data}
        else:
            # User not found - try to recover from auth data
            logger.warning(f"User not found for ID: {user_id}, attempting recovery")
            print(f"⚠️ DEBUG users.py - User not found, attempting recovery for: {user_id}")
            
            # Try to extract user info from auth headers
            auth_header = request.headers.get('authorization', '')
            print(f"🔍 DEBUG users.py - Auth header present: {bool(auth_header)}")
            print(f"🔍 DEBUG users.py - Auth header starts with Bearer: {auth_header.startswith('Bearer ') if auth_header else False}")
            
            if auth_header.startswith('Bearer '):
                token = auth_header.split(' ')[1]
                print(f"🔍 DEBUG users.py - JWT token extracted (first 20 chars): {token[:20]}...")
                try:
                    # Decode the JWT token to get user info
                    import jwt
                    # Note: This is a simplified approach - in production you'd verify the token
                    decoded = jwt.decode(token, options={"verify_signature": False})
                    print(f"🔍 DEBUG users.py - JWT decoded successfully: {decoded}")
                    email = decoded.get('email', f"{user_id}@recovered.user")
                    name = decoded.get('name', 'Recovered User')
                    
                    print(f"🔍 DEBUG users.py - Extracted from JWT - email: {email}, name: {name}")
                    logger.info(f"Attempting recovery with email: {email}")
                    
                    # Use the more robust handle_auth_database_mismatch method first
                    print(f"🔍 DEBUG users.py - Calling handle_auth_database_mismatch with user_id: {user_id}, email: {email}")
                    mismatch_result = await user_management_service.handle_auth_database_mismatch(
                        auth_user_id=user_id,
                        email=email,
                        metadata={'name': name}
                    )
                    
                    print(f"🔍 DEBUG users.py - handle_auth_database_mismatch result: {mismatch_result}")
                    
                    if mismatch_result['success']:
                        logger.info(f"Successfully recovered user via mismatch handler: {user_id}")
                        print(f"✅ DEBUG users.py - Recovery successful via mismatch handler: {mismatch_result['user']}")
                        return {"user": mismatch_result['user']}
                    else:
                        logger.warning(f"Mismatch handler failed, trying direct creation: {mismatch_result.get('error')}")
                        print(f"⚠️ DEBUG users.py - Mismatch handler failed: {mismatch_result.get('error')}")
                        
                        # Fallback to direct creation/restoration
                        print(f"🔍 DEBUG users.py - Trying direct create_or_restore_user with user_id: {user_id}, email: {email}")
                        recovery_result = await user_management_service.create_or_restore_user(
                            user_id=user_id,
                            email=email,
                            display_name=name,
                            academic_level='igcse',
                            current_plan='free',
                            credits=3,
                            is_launch_user=False
                        )
                        
                        print(f"🔍 DEBUG users.py - create_or_restore_user result: {recovery_result}")
                        
                        if recovery_result['success']:
                            logger.info(f"Successfully recovered user via direct creation: {user_id}")
                            print(f"✅ DEBUG users.py - Recovery successful via direct creation: {recovery_result['user']}")
                            return {"user": recovery_result['user']}
                        else:
                            logger.error(f"Direct creation also failed: {recovery_result.get('error')}")
                            print(f"❌ DEBUG users.py - Direct creation failed: {recovery_result.get('error')}")
                            raise HTTPException(
                                status_code=400, 
                                detail=f"Cannot recover user - {recovery_result.get('error')}"
                            )
                        
                except Exception as jwt_error:
                    logger.error(f"JWT decode failed for user {user_id}: {str(jwt_error)}")
                    print(f"❌ DEBUG users.py - JWT decode failed: {str(jwt_error)}")
                    # Fallback to basic recovery with better error handling
                    try:
                        print(f"🔍 DEBUG users.py - Trying fallback recovery with generated email: {user_id}@recovered.user")
                        recovery_result = await user_management_service.create_or_restore_user(
                            user_id=user_id,
                            email=f"{user_id}@recovered.user",
                            display_name="Recovered User",
                            academic_level='igcse',
                            current_plan='free',
                            credits=3,
                            is_launch_user=False
                        )
                        
                        print(f"🔍 DEBUG users.py - Fallback recovery result: {recovery_result}")
                        
                        if recovery_result['success']:
                            logger.info(f"Successfully recovered user with fallback: {user_id}")
                            return {"user": recovery_result['user']}
                        else:
                            logger.error(f"Fallback recovery failed for user {user_id}: {recovery_result.get('error')}")
                            # Try one more time with a different approach
                            try:
                                # Use the handle_auth_database_mismatch method which has more robust recovery logic
                                mismatch_result = await user_management_service.handle_auth_database_mismatch(
                                    auth_user_id=user_id,
                                    email=f"{user_id}@recovered.user",
                                    metadata={'name': 'Recovered User'}
                                )
                                
                                if mismatch_result['success']:
                                    logger.info(f"Successfully recovered user via mismatch handler: {user_id}")
                                    return {"user": mismatch_result['user']}
                                else:
                                    raise HTTPException(
                                        status_code=400, 
                                        detail=f"Cannot recover user - all recovery methods failed: {mismatch_result.get('error')}"
                                    )
                            except Exception as mismatch_error:
                                logger.error(f"Mismatch recovery also failed for user {user_id}: {str(mismatch_error)}")
                                raise HTTPException(
                                    status_code=400, 
                                    detail=f"Cannot recover user - recovery failed: {str(mismatch_error)}"
                                )
                    except Exception as fallback_error:
                        logger.error(f"Fallback recovery attempt failed for user {user_id}: {str(fallback_error)}")
                        raise HTTPException(
                            status_code=400, 
                            detail=f"Cannot recover user - fallback failed: {str(fallback_error)}"
                        )
            else:
                # No auth header - return error
                raise HTTPException(
                    status_code=400, 
                    detail="Cannot recover user - missing authentication"
                )
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Exception in get_user: {str(e)}")
        print(f"❌ DEBUG users.py - Exception in get_user: {str(e)}")
        print(f"❌ DEBUG users.py - Exception type: {type(e)}")
        import traceback
        print(f"❌ DEBUG users.py - Traceback: {traceback.format_exc()}")
        raise HTTPException(status_code=500, detail=f"User retrieval error: {str(e)}")

@router.put("/users/{user_id}")
async def update_user(user_id: str, updates: dict):
    """Update user information using the user management service"""
    try:
        print(f"[UPDATE_USER_DEBUG] user_management_service: {user_management_service}")
        print(f"[UPDATE_USER_DEBUG] user_management_service type: {type(user_management_service)}")
        print(f"[UPDATE_USER_DEBUG] user_id: {user_id}")
        print(f"[UPDATE_USER_DEBUG] updates: {updates}")
        
        if not user_management_service:
            print("[UPDATE_USER_DEBUG] user_management_service is None!")
            raise HTTPException(status_code=500, detail="User management service not available")
        
        if not user_id or user_id == "undefined":
            raise HTTPException(status_code=400, detail="Invalid user ID provided")
        
        logger.info(f"Updating user: {user_id}")
        print(f"[UPDATE_USER_DEBUG] Calling user_management_service.update_user...")
        
        # Use the user management service to update user
        updated_user = await user_management_service.update_user(user_id, updates)
        
        print(f"[UPDATE_USER_DEBUG] update_user result: {updated_user}")
        
        if updated_user:
            logger.info(f"Successfully updated user: {user_id}")
            return {"user": updated_user}
        else:
            logger.warning(f"User not found for update, ID: {user_id}")
            raise HTTPException(status_code=404, detail="User not found")
        
    except HTTPException:
        raise
    except Exception as e:
        print(f"[UPDATE_USER_DEBUG] Exception in update_user: {e}")
        logger.error(f"User update error: {str(e)}")
        raise HTTPException(status_code=500, detail=f"User update error: {str(e)}")

@router.post("/users/recover")
async def recover_user(user_data: dict, request: Request):
    """Recover a user with auth/database mismatch"""
    try:
        if not user_management_service:
            raise HTTPException(status_code=500, detail="User management service not available")
        
        user_id = user_data.get('user_id')
        email = user_data.get('email')
        metadata = user_data.get('metadata', {})
        
        if not user_id or user_id == "undefined":
            raise HTTPException(status_code=400, detail="Invalid user ID provided")
        
        # If email is not provided, try to extract from auth token
        if not email:
            auth_header = request.headers.get('authorization', '')
            if auth_header.startswith('Bearer '):
                token = auth_header.split(' ')[1]
                try:
                    decoded = jwt.decode(token, options={"verify_signature": False})
                    email = decoded.get('email')
                    if not metadata.get('name'):
                        metadata['name'] = decoded.get('name', 'Recovered User')
                except Exception as jwt_error:
                    logger.error(f"JWT decode failed: {str(jwt_error)}")
                    raise HTTPException(status_code=400, detail="Cannot extract email from token")
            else:
                raise HTTPException(status_code=400, detail="Email is required and no auth token provided")
        
        logger.info(f"Attempting to recover user: {user_id} ({email})")
        
        # Use the user management service to handle the mismatch
        recovery_result = await user_management_service.handle_auth_database_mismatch(
            auth_user_id=user_id,
            email=email,
            metadata=metadata
        )
        
        if recovery_result['success']:
            logger.info(f"Successfully recovered user: {user_id}")
            return {
                "success": True,
                "user": recovery_result['user'],
                "recovery_method": recovery_result['recovery_method'],
                "message": recovery_result['message']
            }
        else:
            logger.error(f"Failed to recover user: {user_id} - {recovery_result.get('error')}")
            raise HTTPException(
                status_code=500, 
                detail=f"User recovery failed: {recovery_result.get('error')}"
            )
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Exception in recover_user: {str(e)}")
        raise HTTPException(status_code=500, detail=f"User recovery error: {str(e)}")

@router.get("/users/stats")
async def get_user_management_stats():
    """Get user management statistics"""
    try:
        if not user_management_service:
            raise HTTPException(status_code=500, detail="User management service not available")
        
        stats = await user_management_service.get_user_management_stats()
        return {"stats": stats}
        
    except Exception as e:
        logger.error(f"Error getting user management stats: {str(e)}")
        return {"error": str(e)}

@router.get("/users/orphaned")
async def get_orphaned_users():
    """Get list of potentially orphaned users (soft-deleted)"""
    try:
        if not user_management_service:
            raise HTTPException(status_code=500, detail="User management service not available")
        
        orphaned_users = await user_management_service.find_orphaned_users()
        return {"orphaned_users": orphaned_users}
        
    except Exception as e:
        logger.error(f"Error getting orphaned users: {str(e)}")
        return {"error": str(e)}

@router.get("/debug/env-check")
async def debug_env_check():
    """Check environment variables"""
    return {
        "api_key_configured": False,
        "api_key_first_10": '',
        "environment": None,
        "base_url": None
    }

@router.post("/debug/test-user-recovery")
async def test_user_recovery(user_data: dict):
    """Test endpoint for user recovery functionality"""
    try:
        if not user_management_service:
            raise HTTPException(status_code=500, detail="User management service not available")
        
        user_id = user_data.get('user_id')
        email = user_data.get('email', f"{user_id}@test.recovery")
        name = user_data.get('name', 'Test Recovery User')
        
        if not user_id:
            raise HTTPException(status_code=400, detail="user_id is required")
        
        logger.info(f"Testing user recovery for: {user_id} ({email})")
        
        # Test direct creation/restoration
        result = await user_management_service.create_or_restore_user(
            user_id=user_id,
            email=email,
            display_name=name,
            academic_level='igcse',
            current_plan='free',
            credits=3,
            is_launch_user=False
        )
        
        return {
            "test_result": result,
            "user_id": user_id,
            "email": email,
            "timestamp": datetime.utcnow().isoformat()
        }
        
    except Exception as e:
        logger.error(f"Test user recovery failed: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Test failed: {str(e)}")

@router.put("/users/{user_id}/preferences")
async def update_user_preferences(user_id: str, preferences: dict):
    """Update user preferences (dark mode, etc.) using the user management service"""
    try:
        if not user_management_service:
            raise HTTPException(status_code=500, detail="User management service not available")
        
        # Validate preferences
        allowed_preferences = ['dark_mode']
        filtered_preferences = {k: v for k, v in preferences.items() if k in allowed_preferences}
        
        if not filtered_preferences:
            raise HTTPException(status_code=400, detail="No valid preferences provided")
        
        # Use the user management service to update user
        updated_user = await user_management_service.update_user(user_id, filtered_preferences)
        
        if updated_user:
            return {"user": updated_user}
        else:
            raise HTTPException(status_code=404, detail="User not found")
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"User preferences update error: {str(e)}")
        raise HTTPException(status_code=500, detail=f"User preferences update error: {str(e)}")
