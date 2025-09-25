"""
User Management Service for Assessment Platform
Handles user creation, restoration, and sync operations with soft delete support
"""

import logging
from typing import Dict, Any, Optional, List
from datetime import datetime
from supabase import Client

logger = logging.getLogger(__name__)

class UserManagementService:
    """Service for managing assessment users with soft delete support"""
    
    def __init__(self, supabase_client: Client):
        self.supabase = supabase_client
        
    async def create_or_restore_user(
        self,
        user_id: str,
        email: str,
        display_name: Optional[str] = None,
        academic_level: str = 'igcse',
        current_plan: str = 'free',
        credits: int = 3,
        is_launch_user: bool = False,
        photo_url: Optional[str] = None,
        dark_mode: bool = False
    ) -> Dict[str, Any]:
        """
        Create a new user or restore a deleted user using the SQL function
        
        Args:
            user_id: Supabase Auth user ID
            email: User's email address
            display_name: User's display name
            academic_level: Academic level (default: 'igcse')
            current_plan: Subscription plan (default: 'free')
            credits: Available credits (default: 3)
            is_launch_user: Whether user is from launch period
            photo_url: User's profile photo URL
            dark_mode: User's dark mode preference
            
        Returns:
            Dict containing user data and operation result
        """
        try:
            logger.info(f"Creating or restoring user: {user_id} ({email})")
            logger.info(f"Parameters: display_name={display_name}, academic_level={academic_level}, current_plan={current_plan}, credits={credits}, is_launch_user={is_launch_user}, photo_url={photo_url}, dark_mode={dark_mode}")
            
            # Check if user already exists to determine if we should preserve their plan
            existing_user_check = self.supabase.table('assessment_users').select('current_plan, credits').eq('uid', user_id).execute()
            
            # If user exists, preserve their current plan and credits
            if existing_user_check.data:
                existing_user_data = existing_user_check.data[0]
                preserved_plan = existing_user_data.get('current_plan', 'free')
                preserved_credits = existing_user_data.get('credits', 3)
                
                # If user had unlimited access, preserve it
                if preserved_plan == 'unlimited' or preserved_credits >= 99999:
                    logger.info(f"Preserving unlimited access for existing user: {user_id}")
                    plan_to_use = 'unlimited'
                    credits_to_use = 99999
                else:
                    # Keep existing plan and credits
                    plan_to_use = preserved_plan
                    credits_to_use = preserved_credits
            else:
                # New user, use the provided plan and credits
                plan_to_use = current_plan
                credits_to_use = credits
            
            # Call the SQL function to create or restore user
            result = self.supabase.rpc(
                'create_or_restore_assessment_user',
                {
                    'p_uid': user_id,
                    'p_email': email,
                    'p_display_name': display_name,
                    'p_academic_level': academic_level,
                    'p_current_plan': plan_to_use,
                    'p_credits': credits_to_use,
                    'p_is_launch_user': is_launch_user,
                    'p_photo_url': photo_url,
                    'p_dark_mode': dark_mode
                }
            ).execute()
            
            logger.info(f"SQL function result: {result}")
            logger.info(f"Result data: {result.data}")
            logger.info(f"Result error: {getattr(result, 'error', None)}")
            
            if result.data:
                user_uid = result.data
                logger.info(f"Successfully created/restored user: {user_uid}")
                
                # Fetch the complete user data
                user_data = await self.get_user_by_id(user_uid)
                if user_data:
                    return {
                        'success': True,
                        'user': user_data,
                        'operation': 'created' if user_data.get('created_at') == user_data.get('updated_at') else 'restored',
                        'message': f"User {'created' if user_data.get('created_at') == user_data.get('updated_at') else 'restored'} successfully"
                    }
                else:
                    logger.error(f"User created but failed to retrieve data for: {user_uid}")
                    return {
                        'success': False,
                        'error': 'User created but failed to retrieve data',
                        'user_id': user_uid
                    }
            else:
                logger.error(f"Failed to create/restore user: {user_id} - No data returned from SQL function")
                logger.error(f"Full result object: {result}")
                return {
                    'success': False,
                    'error': 'Failed to create or restore user - no data returned from SQL function',
                    'user_id': user_id
                }
                
        except Exception as e:
            logger.error(f"Error creating/restoring user {user_id}: {str(e)}")
            logger.error(f"Exception type: {type(e)}")
            import traceback
            logger.error(f"Traceback: {traceback.format_exc()}")
            
            # Try direct table insertion as fallback
            try:
                logger.info(f"Attempting direct table insertion as fallback for user: {user_id}")
                
                # Check if user already exists (including soft-deleted)
                existing_user = self.supabase.table('assessment_users').select('*').eq('uid', user_id).execute()
                
                if existing_user.data:
                    # User exists, update them
                    logger.info(f"User exists, updating: {user_id}")
                    
                    # Preserve unlimited access for existing users
                    existing_user_data = existing_user.data[0]
                    preserved_plan = existing_user_data.get('current_plan', 'free')
                    preserved_credits = existing_user_data.get('credits', 3)
                    
                    # If user had unlimited access, preserve it
                    if preserved_plan == 'unlimited' or preserved_credits >= 99999:
                        logger.info(f"Preserving unlimited access for user: {user_id}")
                        final_plan = 'unlimited'
                        final_credits = 99999
                    else:
                        # For existing users without unlimited access, keep their current plan and credits
                        # Don't override with the new parameters
                        final_plan = preserved_plan
                        final_credits = preserved_credits
                    
                    update_data = {
                        'email': email,
                        'display_name': display_name,
                        'academic_level': academic_level,
                        'current_plan': final_plan,
                        'credits': final_credits,
                        'is_launch_user': is_launch_user,
                        'photo_url': photo_url,
                        'dark_mode': dark_mode,
                        'deleted_at': None,  # Restore if soft-deleted
                        'deleted_by': None,
                        'updated_at': datetime.utcnow().isoformat()
                    }
                    
                    result = self.supabase.table('assessment_users').update(update_data).eq('uid', user_id).execute()
                    
                    if result.data:
                        logger.info(f"Successfully updated existing user: {user_id}")
                        user_data = await self.get_user_by_id(user_id)
                        if user_data:
                            return {
                                'success': True,
                                'user': user_data,
                                'operation': 'updated',
                                'message': 'User updated successfully'
                            }
                else:
                    # User doesn't exist, create new one
                    logger.info(f"User doesn't exist, creating new: {user_id}")
                    insert_data = {
                        'uid': user_id,
                        'email': email,
                        'display_name': display_name,
                        'academic_level': academic_level,
                        'questions_marked': 0,
                        'credits': credits,
                        'current_plan': current_plan,
                        'dark_mode': dark_mode,
                        'is_launch_user': is_launch_user,
                        'photo_url': photo_url,
                        'created_at': datetime.utcnow().isoformat(),
                        'updated_at': datetime.utcnow().isoformat()
                    }
                    
                    result = self.supabase.table('assessment_users').insert(insert_data).execute()
                    
                    if result.data:
                        logger.info(f"Successfully created new user: {user_id}")
                        user_data = await self.get_user_by_id(user_id)
                        if user_data:
                            return {
                                'success': True,
                                'user': user_data,
                                'operation': 'created',
                                'message': 'User created successfully'
                            }
                
                return {
                    'success': False,
                    'error': 'Direct table insertion also failed',
                    'user_id': user_id
                }
                
            except Exception as fallback_error:
                logger.error(f"Fallback direct insertion also failed: {str(fallback_error)}")
                return {
                    'success': False,
                    'error': f"User creation/restoration error: {str(e)}. Fallback also failed: {str(fallback_error)}",
                    'user_id': user_id
                }
    
    async def get_user_by_id(self, user_id: str) -> Optional[Dict[str, Any]]:
        """
        Get user by ID from the active users view
        
        Args:
            user_id: User ID to retrieve
            
        Returns:
            User data dict or None if not found
        """
        try:
            if not user_id or user_id == "undefined":
                return None
                
            # Use the active_assessment_users view to only get non-deleted users
            response = self.supabase.table('active_assessment_users').select('*').eq('uid', user_id).execute()
            
            if response.data:
                user_data = response.data[0]
                # Add compatibility field
                user_data['id'] = user_data['uid']
                return user_data
            else:
                return None
                
        except Exception as e:
            logger.error(f"Error retrieving user {user_id}: {str(e)}")
            return None
    
    async def get_user_by_email(self, email: str, include_deleted: bool = False) -> Optional[Dict[str, Any]]:
        """
        Get user by email from the active users view or main table
        
        Args:
            email: Email address to search for
            include_deleted: Whether to include soft-deleted users
            
        Returns:
            User data dict or None if not found
        """
        try:
            if not email:
                return None
                
            if include_deleted:
                # Search in the main table to include soft-deleted users
                response = self.supabase.table('assessment_users').select('*').eq('email', email).execute()
            else:
                # Use the active_assessment_users view to only get non-deleted users
                response = self.supabase.table('active_assessment_users').select('*').eq('email', email).execute()
            
            if response.data:
                user_data = response.data[0]
                # Add compatibility field
                user_data['id'] = user_data['uid']
                return user_data
            else:
                return None
                
        except Exception as e:
            logger.error(f"Error retrieving user by email {email}: {str(e)}")
            return None
    
    async def update_user(self, user_id: str, updates: Dict[str, Any]) -> Optional[Dict[str, Any]]:
        """
        Update user information
        
        Args:
            user_id: User ID to update
            updates: Dictionary of fields to update
            
        Returns:
            Updated user data or None if failed
        """
        try:
            if not user_id or user_id == "undefined":
                return None
                
            # Add update timestamp
            updates['updated_at'] = datetime.utcnow().isoformat()
            
            # Update in the main table (not the view)
            response = self.supabase.table('assessment_users').update(updates).eq('uid', user_id).execute()
            
            if response.data:
                updated_user = response.data[0]
                updated_user['id'] = updated_user['uid']  # For compatibility
                return updated_user
            else:
                return None
                
        except Exception as e:
            logger.error(f"Error updating user {user_id}: {str(e)}")
            return None
    
    async def soft_delete_user(self, user_id: str, deleted_by: Optional[str] = None) -> bool:
        """
        Soft delete a user (mark as deleted without removing data)
        
        Args:
            user_id: User ID to soft delete
            deleted_by: ID of user performing the deletion
            
        Returns:
            True if successful, False otherwise
        """
        try:
            logger.info(f"Soft deleting user: {user_id}")
            
            result = self.supabase.rpc(
                'soft_delete_assessment_user',
                {
                    'p_uid': user_id,
                    'p_deleted_by': deleted_by
                }
            ).execute()
            
            if result.data:
                logger.info(f"Successfully soft deleted user: {user_id}")
                return True
            else:
                logger.warning(f"Failed to soft delete user: {user_id}")
                return False
                
        except Exception as e:
            logger.error(f"Error soft deleting user {user_id}: {str(e)}")
            return False
    
    async def restore_user(self, user_id: str) -> bool:
        """
        Restore a soft-deleted user
        
        Args:
            user_id: User ID to restore
            
        Returns:
            True if successful, False otherwise
        """
        try:
            logger.info(f"Restoring user: {user_id}")
            
            # Update the user to remove deleted_at timestamp
            result = self.supabase.table('assessment_users').update({
                'deleted_at': None,
                'deleted_by': None,
                'updated_at': datetime.utcnow().isoformat()
            }).eq('uid', user_id).execute()
            
            if result.data:
                logger.info(f"Successfully restored user: {user_id}")
                return True
            else:
                logger.warning(f"Failed to restore user: {user_id}")
                return False
                
        except Exception as e:
            logger.error(f"Error restoring user {user_id}: {str(e)}")
            return False
    
    async def sync_user_from_auth(
        self,
        user_id: str,
        email: str,
        metadata: Optional[Dict[str, Any]] = None
    ) -> Dict[str, Any]:
        """
        Sync user data from Supabase Auth using the SQL function
        
        Args:
            user_id: Supabase Auth user ID
            email: User's email address
            metadata: Additional user metadata from auth
            
        Returns:
            Dict containing sync result
        """
        try:
            logger.info(f"Syncing user from auth: {user_id} ({email})")
            
            if not metadata:
                metadata = {}
            
            result = self.supabase.rpc(
                'sync_user_from_auth',
                {
                    'p_uid': user_id,
                    'p_email': email,
                    'p_metadata': metadata
                }
            ).execute()
            
            if result.data:
                user_uid = result.data
                logger.info(f"Successfully synced user: {user_uid}")
                
                # Fetch the complete user data
                user_data = await self.get_user_by_id(user_uid)
                if user_data:
                    return {
                        'success': True,
                        'user': user_data,
                        'message': 'User synced successfully'
                    }
                else:
                    return {
                        'success': False,
                        'error': 'User synced but failed to retrieve data',
                        'user_id': user_uid
                    }
            else:
                logger.error(f"Failed to sync user: {user_id}")
                return {
                    'success': False,
                    'error': 'Failed to sync user',
                    'user_id': user_id
                }
                
        except Exception as e:
            logger.error(f"Error syncing user {user_id}: {str(e)}")
            return {
                'success': False,
                'error': f"User sync error: {str(e)}",
                'user_id': user_id
            }
    
    async def get_user_audit_log(self, user_id: str, limit: int = 50) -> List[Dict[str, Any]]:
        """
        Get audit log for a specific user
        
        Args:
            user_id: User ID to get audit log for
            limit: Maximum number of audit entries to return
            
        Returns:
            List of audit log entries
        """
        try:
            response = self.supabase.table('assessment_user_audit_log')\
                .select('*')\
                .eq('user_uid', user_id)\
                .order('performed_at', desc=True)\
                .limit(limit)\
                .execute()
            
            return response.data if response.data else []
            
        except Exception as e:
            logger.error(f"Error retrieving audit log for user {user_id}: {str(e)}")
            return []
    
    async def get_user_management_stats(self) -> Dict[str, Any]:
        """
        Get user management statistics
        
        Returns:
            Dict containing user statistics
        """
        try:
            result = self.supabase.rpc('get_user_management_stats').execute()
            return result.data if result.data else {}
            
        except Exception as e:
            logger.error(f"Error retrieving user management stats: {str(e)}")
            return {}
    
    async def find_orphaned_users(self) -> List[Dict[str, Any]]:
        """
        Find users that might be orphaned (deleted but still have auth sessions)
        This is a helper method for manual investigation
        
        Returns:
            List of potentially orphaned users
        """
        try:
            # Get all deleted users
            response = self.supabase.table('assessment_users')\
                .select('uid, email, deleted_at, deleted_by')\
                .not_.is_('deleted_at', 'null')\
                .order('deleted_at', desc=True)\
                .execute()
            
            return response.data if response.data else []
            
        except Exception as e:
            logger.error(f"Error finding orphaned users: {str(e)}")
            return []
    
    async def merge_user_accounts(self, auth_user_id: str, existing_user_id: str) -> Dict[str, Any]:
        """
        Merge two user accounts when the same email exists with different user IDs
        
        Args:
            auth_user_id: The current auth user ID
            existing_user_id: The existing user ID in the database
            
        Returns:
            Dict containing merge result
        """
        try:
            logger.info(f"Merging user accounts: auth_user_id={auth_user_id}, existing_user_id={existing_user_id}")
            
            # Get both user records
            auth_user = await self.get_user_by_id(auth_user_id)
            existing_user = await self.get_user_by_id(existing_user_id)
            
            if not existing_user:
                logger.error(f"Existing user {existing_user_id} not found")
                return {
                    'success': False,
                    'error': 'Existing user not found'
                }
            
            # Merge strategy: keep the newer/more complete data
            merged_data = {}
            
            # Prefer existing user's data for most fields, but update with auth user's data
            if auth_user:
                merged_data.update(auth_user)
            
            merged_data.update(existing_user)
            merged_data['uid'] = auth_user_id  # Always use the auth user ID
            merged_data['updated_at'] = datetime.utcnow().isoformat()
            
            # Two-phase account merge to handle foreign key constraints
            try:
                logger.info(f"Starting two-phase account merge: {existing_user_id} -> {auth_user_id}")
                
                # Phase 1: Create the new user record first (if it doesn't exist)
                existing_new_user = await self.get_user_by_id(auth_user_id)
                if not existing_new_user:
                    logger.info(f"Creating new user record for {auth_user_id}")
                    try:
                        # Create a minimal user record with a TEMPORARY email to avoid conflicts
                        # We'll update it to the correct email in Phase 3
                        temp_email = f"temp_{auth_user_id}@merge.temp"
                        
                        create_result = self.supabase.table('assessment_users').insert({
                            'uid': auth_user_id,
                            'email': temp_email,  # Use temporary email to avoid constraint violation
                            'display_name': existing_user.get('display_name', 'Merged User'),
                            'photo_url': existing_user.get('photo_url'),
                            'academic_level': existing_user.get('academic_level', 'igcse'),
                            'questions_marked': existing_user.get('questions_marked', 0),
                            'credits': existing_user.get('credits', 3),
                            'current_plan': existing_user.get('current_plan', 'free'),
                            'dark_mode': existing_user.get('dark_mode', False),
                            'created_at': existing_user.get('created_at'),
                            'updated_at': datetime.utcnow().isoformat(),
                            'is_launch_user': existing_user.get('is_launch_user', False)
                        }).execute()
                        
                        if not create_result.data:
                            logger.error(f"Failed to create new user record for {auth_user_id}")
                            return {
                                'success': False,
                                'error': 'Failed to create new user record'
                            }
                        
                        logger.info(f"Successfully created temporary user record for {auth_user_id}")
                    except Exception as create_error:
                        logger.error(f"Error creating new user record: {str(create_error)}")
                        return {
                            'success': False,
                            'error': f'Create error: {str(create_error)}'
                        }
                else:
                    logger.info(f"New user record already exists for {auth_user_id}")
                
                # Phase 2: Update foreign key references now that both users exist
                logger.info(f"Updating foreign key references from {existing_user_id} to {auth_user_id}")
                
                # Update evaluations table
                try:
                    eval_update = self.supabase.table('assessment_evaluations').update({
                        'user_id': auth_user_id
                    }).eq('user_id', existing_user_id).execute()
                    logger.info(f"Updated {len(eval_update.data) if eval_update.data else 0} evaluations")
                except Exception as eval_error:
                    logger.warning(f"Could not update evaluations: {str(eval_error)}")
                
                # Update badges table
                try:
                    badge_update = self.supabase.table('assessment_badges').update({
                        'user_id': auth_user_id
                    }).eq('user_id', existing_user_id).execute()
                    logger.info(f"Updated {len(badge_update.data) if badge_update.data else 0} badges")
                except Exception as badge_error:
                    logger.warning(f"Could not update badges: {str(badge_error)}")
                
                # Update feedback table
                try:
                    feedback_update = self.supabase.table('assessment_feedback').update({
                        'user_id': auth_user_id
                    }).eq('user_id', existing_user_id).execute()
                    logger.info(f"Updated {len(feedback_update.data) if feedback_update.data else 0} feedback records")
                except Exception as feedback_error:
                    logger.warning(f"Could not update feedback: {str(feedback_error)}")
                
                # Update meta table
                try:
                    meta_update = self.supabase.table('assessment_meta').update({
                        'user_id': auth_user_id
                    }).eq('user_id', existing_user_id).execute()
                    logger.info(f"Updated {len(meta_update.data) if meta_update.data else 0} meta records")
                except Exception as meta_error:
                    logger.warning(f"Could not update meta: {str(meta_error)}")
                
                # Phase 3: Update the email and delete the old user record
                logger.info(f"Updating email for {auth_user_id} from temporary to correct email")
                try:
                    # Update the new user with the correct email
                    update_result = self.supabase.table('assessment_users').update({
                        'email': existing_user.get('email'),  # Use the original email
                        'updated_at': datetime.utcnow().isoformat()
                    }).eq('uid', auth_user_id).execute()
                    
                    if not update_result.data:
                        logger.warning(f"Could not update email for {auth_user_id}")
                    else:
                        logger.info(f"Successfully updated email for {auth_user_id}")
                        
                except Exception as update_error:
                    logger.warning(f"Could not update email: {str(update_error)}")
                
                # Now delete the old user record
                logger.info(f"Deleting old user record: {existing_user_id}")
                try:
                    delete_result = self.supabase.table('assessment_users').delete().eq('uid', existing_user_id).execute()
                    if delete_result.data:
                        logger.info(f"Successfully deleted old user record: {existing_user_id}")
                    else:
                        logger.warning(f"Could not delete old user record: {existing_user_id}")
                except Exception as delete_error:
                    logger.warning(f"Could not delete old user record: {str(delete_error)}")
                
                # Get the merged user data
                merged_user = await self.get_user_by_id(auth_user_id)
                if merged_user:
                    logger.info(f"Successfully completed two-phase account merge: {existing_user_id} -> {auth_user_id}")
                    return {
                        'success': True,
                        'user': merged_user,
                        'message': f'User accounts merged via two-phase process: {existing_user_id} -> {auth_user_id}'
                    }
                
                return {
                    'success': False,
                    'error': 'Failed to retrieve merged user data'
                }
                
            except Exception as merge_error:
                logger.error(f"Error in two-phase account merge: {str(merge_error)}")
                return {
                    'success': False,
                    'error': f'Two-phase merge error: {str(merge_error)}'
                }
                
        except Exception as e:
            logger.error(f"Error merging user accounts: {str(e)}")
            return {
                'success': False,
                'error': f'Merge error: {str(e)}'
            }
    
    async def handle_auth_database_mismatch(
        self,
        auth_user_id: str,
        email: str,
        metadata: Optional[Dict[str, Any]] = None
    ) -> Dict[str, Any]:
        """
        Handle cases where a user is authenticated but their database record is missing
        This is the main recovery function for the auth/database sync issue
        
        Args:
            auth_user_id: Supabase Auth user ID
            email: User's email address
            metadata: Additional user metadata from auth
            
        Returns:
            Dict containing recovery result
        """
        try:
            logger.info(f"Handling auth/database mismatch for user: {auth_user_id} ({email})")
            
            # First, check if there's already a user with this email but different ID (including soft-deleted)
            existing_user = await self.get_user_by_email(email, include_deleted=True)
            if existing_user and existing_user.get('uid') != auth_user_id:
                logger.warning(f"Email {email} already exists with different user ID: {existing_user.get('uid')}")
                
                # Merge the user accounts
                logger.info(f"Merging user accounts: {existing_user.get('uid')} -> {auth_user_id}")
                merge_result = await self.merge_user_accounts(auth_user_id, existing_user.get('uid'))
                
                if merge_result['success']:
                    logger.info(f"Successfully merged user accounts: {existing_user.get('uid')} -> {auth_user_id}")
                    return {
                        'success': True,
                        'recovery_method': 'account_merge',
                        'user': merge_result['user'],
                        'message': merge_result['message']
                    }
                else:
                    logger.error(f"Failed to merge user accounts: {merge_result.get('error')}")
                    # Continue with other recovery methods
            
            # Check if there's a user with the auth_user_id but different email
            # This handles the case where the user exists but with a different email
            user_by_id = await self.get_user_by_id(auth_user_id)
            if user_by_id and user_by_id.get('email') != email:
                logger.warning(f"User {auth_user_id} exists but with different email: {user_by_id.get('email')} vs {email}")
                
                # Update the user's email to match the auth email
                try:
                    update_result = self.supabase.table('assessment_users').update({
                        'email': email,
                        'updated_at': datetime.utcnow().isoformat()
                    }).eq('uid', auth_user_id).execute()
                    
                    if update_result.data:
                        logger.info(f"Successfully updated user email from {user_by_id.get('email')} to {email}")
                        
                        # Get the updated user data
                        updated_user = await self.get_user_by_id(auth_user_id)
                        if updated_user:
                            return {
                                'success': True,
                                'recovery_method': 'email_update',
                                'user': updated_user,
                                'message': f'User email updated from {user_by_id.get("email")} to {email}'
                            }
                    
                except Exception as update_error:
                    logger.error(f"Failed to update user email: {str(update_error)}")
                    # Continue with other recovery methods
            
            # Try to sync the user from auth
            sync_result = await self.sync_user_from_auth(auth_user_id, email, metadata)
            
            if sync_result['success']:
                logger.info(f"Successfully recovered user from auth sync: {auth_user_id}")
                return {
                    'success': True,
                    'recovery_method': 'auth_sync',
                    'user': sync_result['user'],
                    'message': 'User recovered successfully from auth sync'
                }
            
            # If auth sync fails due to duplicate email, try to find and merge the existing user
            if 'duplicate key value violates unique constraint "assessment_users_email_key"' in str(sync_result.get('error', '')):
                logger.info(f"Auth sync failed due to duplicate email, searching for existing user: {email}")
                
                # Search for any user with this email (including soft-deleted ones)
                try:
                    search_result = self.supabase.table('assessment_users').select('*').eq('email', email).execute()
                    if search_result.data:
                        existing_user = search_result.data[0]
                        existing_user_id = existing_user.get('uid')
                        
                        if existing_user_id != auth_user_id:
                            logger.info(f"Found existing user with email {email}: {existing_user_id}")
                            
                            # Try to merge the accounts
                            merge_result = await self.merge_user_accounts(auth_user_id, existing_user_id)
                            
                            if merge_result['success']:
                                logger.info(f"Successfully merged user accounts after duplicate email error: {existing_user_id} -> {auth_user_id}")
                                return {
                                    'success': True,
                                    'recovery_method': 'duplicate_email_merge',
                                    'user': merge_result['user'],
                                    'message': merge_result['message']
                                }
                            else:
                                logger.error(f"Failed to merge user accounts after duplicate email error: {merge_result.get('error')}")
                        else:
                            logger.info(f"User {auth_user_id} already exists with email {email}")
                            # User exists but sync failed - try to get the existing user
                            existing_user_data = await self.get_user_by_id(auth_user_id)
                            if existing_user_data:
                                return {
                                    'success': True,
                                    'recovery_method': 'existing_user_found',
                                    'user': existing_user_data,
                                    'message': 'User already exists in database'
                                }
                except Exception as search_error:
                    logger.error(f"Error searching for existing user with email {email}: {str(search_error)}")
            
            # If all else fails, try to create/restore the user
            logger.info(f"All recovery methods failed, attempting user creation/restoration: {auth_user_id}")
            create_result = await self.create_or_restore_user(
                user_id=auth_user_id,
                email=email,
                display_name=metadata.get('name') if metadata else None,
    async def fix_unlimited_plan_status(self, user_id: str) -> Dict[str, Any]:
        """
        Fix users who should have unlimited plan based on their usage but are showing as free
        
        Args:
            user_id: User ID to fix
            
        Returns:
            Dict containing fix result
        """
        try:
            logger.info(f"Fixing unlimited plan status for user: {user_id}")
            
            # Get user data including usage statistics
            user_data = await self.get_user_by_id(user_id)
            if not user_data:
                return {
                    'success': False,
                    'error': 'User not found'
                }
            
            current_plan = user_data.get('current_plan', 'free')
            questions_marked = user_data.get('questions_marked', 0)
            credits = user_data.get('credits', 3)
            
            logger.info(f"User {user_id} current status: plan={current_plan}, questions_marked={questions_marked}, credits={credits}")
            
            # If user has marked more than 10 questions but is on free plan, fix it
            if questions_marked > 10 and current_plan != 'unlimited':
                logger.info(f"User {user_id} should have unlimited access based on {questions_marked} questions marked")
                
                # Update user to unlimited plan
                update_result = self.supabase.table('assessment_users').update({
                    'current_plan': 'unlimited',
                    'credits': 99999,
                    'updated_at': datetime.utcnow().isoformat()
                }).eq('uid', user_id).execute()
                
                if update_result.data:
                    logger.info(f"Successfully updated user {user_id} to unlimited plan")
                    return {
                        'success': True,
                        'message': f'Fixed plan status: {current_plan} -> unlimited (based on {questions_marked} questions marked)',
                        'user': update_result.data[0]
                    }
                else:
                    logger.error(f"Failed to update user {user_id} plan status")
                    return {
                        'success': False,
                        'error': 'Database update failed'
                    }
            else:
                return {
                    'success': False,
                    'error': f'User does not need plan fix: plan={current_plan}, questions_marked={questions_marked}'
                }
                
        except Exception as e:
            logger.error(f"Error fixing unlimited plan status for user {user_id}: {str(e)}")
            return {
                'success': False,
                'error': f"Plan fix error: {str(e)}"
            }
                photo_url=metadata.get('avatar_url') if metadata else None,
                academic_level='igcse',
                current_plan='free',
                credits=3,
                is_launch_user=False
            )
            
            if create_result['success']:
                logger.info(f"Successfully recovered user from creation/restoration: {auth_user_id}")
                return {
                    'success': True,
                    'recovery_method': 'creation_restoration',
                    'user': create_result['user'],
                    'message': 'User recovered successfully from creation/restoration'
                }
            
            # If all recovery methods fail
            logger.error(f"All recovery methods failed for user: {auth_user_id}")
            return {
                'success': False,
                'recovery_method': 'none',
                'error': 'All recovery methods failed',
                'auth_sync_error': sync_result.get('error'),
                'creation_error': create_result.get('error')
            }
            
        except Exception as e:
            logger.error(f"Error handling auth/database mismatch for user {auth_user_id}: {str(e)}")
            return {
                'success': False,
                'recovery_method': 'error',
                'error': f"Recovery error: {str(e)}"
            }
