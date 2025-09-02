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
            
            # Call the SQL function to create or restore user
            result = self.supabase.rpc(
                'create_or_restore_assessment_user',
                {
                    'p_uid': user_id,
                    'p_email': email,
                    'p_display_name': display_name,
                    'p_academic_level': academic_level,
                    'p_current_plan': current_plan,
                    'p_credits': credits,
                    'p_is_launch_user': is_launch_user,
                    'p_photo_url': photo_url,
                    'p_dark_mode': dark_mode
                }
            ).execute()
            
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
                    return {
                        'success': False,
                        'error': 'User created but failed to retrieve data',
                        'user_id': user_uid
                    }
            else:
                logger.error(f"Failed to create/restore user: {user_id}")
                return {
                    'success': False,
                    'error': 'Failed to create or restore user',
                    'user_id': user_id
                }
                
        except Exception as e:
            logger.error(f"Error creating/restoring user {user_id}: {str(e)}")
            return {
                'success': False,
                'error': f"User creation/restoration error: {str(e)}",
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
    
    async def get_user_by_email(self, email: str) -> Optional[Dict[str, Any]]:
        """
        Get user by email from the active users view
        
        Args:
            email: Email address to search for
            
        Returns:
            User data dict or None if not found
        """
        try:
            if not email:
                return None
                
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
            
            # First, try to sync the user from auth
            sync_result = await self.sync_user_from_auth(auth_user_id, email, metadata)
            
            if sync_result['success']:
                logger.info(f"Successfully recovered user from auth sync: {auth_user_id}")
                return {
                    'success': True,
                    'recovery_method': 'auth_sync',
                    'user': sync_result['user'],
                    'message': 'User recovered successfully from auth sync'
                }
            
            # If auth sync fails, try to create/restore the user
            logger.info(f"Auth sync failed, attempting user creation/restoration: {auth_user_id}")
            create_result = await self.create_or_restore_user(
                user_id=auth_user_id,
                email=email,
                display_name=metadata.get('name') if metadata else None,
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
