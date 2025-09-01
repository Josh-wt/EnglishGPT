import { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import { getUserProfile, updateUserProfile, updateAcademicLevel, getUserStats } from '../services/user';
import { applyLaunchPeriodBenefits } from '../utils/launchPeriod';

/**
 * Custom hook for user state management
 * @returns {Object} - User state and functions
 */
export const useUser = () => {
  const [user, setUser] = useState(null);
  const [userStats, setUserStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Initialize user state
  useEffect(() => {
    const initializeUser = async () => {
      try {
        console.log('🔄 Initializing user...');
        setLoading(true);
        
        // Get current session
        const { data: { session } } = await supabase.auth.getSession();
        console.log('🔍 Session check:', { hasSession: !!session, hasUser: !!session?.user });
        
        if (session?.user) {
          console.log('✅ User found:', session.user.id);
          setUser(session.user);
          
          // Fetch user profile and stats
          try {
            console.log('📡 Fetching user data...');
            const [profileData, statsData] = await Promise.all([
              getUserProfile(session.user.id),
              getUserStats(session.user.id),
            ]);
            
            console.log('📊 User data received:', { profile: profileData, stats: statsData });
            
            // Apply launch period benefits
            const finalStats = applyLaunchPeriodBenefits({
              ...statsData,
              profile: profileData,
            });
            
            console.log('🎉 Final stats:', finalStats);
            setUserStats(finalStats);
            
            // Instant redirect to dashboard if authenticated and on main domain
            if (typeof window !== 'undefined' && window.location.pathname === '/') {
              console.log('🔄 Redirecting authenticated user to dashboard');
              window.location.href = '/dashboard';
            }
          } catch (profileError) {
            console.error('❌ Error fetching user data:', profileError);
            // Don't fail completely if profile fetch fails
            // Set default stats to prevent infinite loading
            const defaultStats = {
              currentPlan: 'free',
              credits: 3,
              questionsMarked: 0,
              evaluationsUsed: 0,
              evaluationsLimit: 3
            };
            
            // Apply launch period benefits to default stats
            const finalStats = applyLaunchPeriodBenefits(defaultStats);
            setUserStats(finalStats);
            
            // Instant redirect to dashboard if authenticated and on main domain
            if (typeof window !== 'undefined' && window.location.pathname === '/') {
              console.log('🔄 Redirecting authenticated user to dashboard');
              window.location.href = '/dashboard';
            }
          }
        } else {
          console.log('👤 No user session found');
        }
      } catch (err) {
        console.error('❌ Error initializing user:', err);
        setError(err.message);
      } finally {
        console.log('✅ User initialization complete');
        setLoading(false);
      }
    };

    initializeUser();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('🔐 Auth state change:', event, { hasSession: !!session, hasUser: !!session?.user });
        
        if (event === 'SIGNED_IN' && session?.user) {
          setUser(session.user);
          setError(null);
          
          try {
            console.log('📡 Fetching user data on sign in...');
            const [profileData, statsData] = await Promise.all([
              getUserProfile(session.user.id),
              getUserStats(session.user.id),
            ]);
            
            // Apply launch period benefits
            const finalStats = applyLaunchPeriodBenefits({
              ...statsData,
              profile: profileData,
            });
            
            setUserStats(finalStats);
            
            // Instant redirect to dashboard if on main domain
            if (typeof window !== 'undefined' && window.location.pathname === '/') {
              console.log('🔄 Redirecting authenticated user to dashboard');
              window.location.href = '/dashboard';
            }
          } catch (profileError) {
            console.error('❌ Error fetching user data on sign in:', profileError);
            // Set default stats to prevent infinite loading
            const defaultStats = {
              currentPlan: 'free',
              credits: 3,
              questionsMarked: 0,
              evaluationsUsed: 0,
              evaluationsLimit: 3
            };
            
            // Apply launch period benefits to default stats
            const finalStats = applyLaunchPeriodBenefits(defaultStats);
            setUserStats(finalStats);
            
            // Instant redirect to dashboard if on main domain
            if (typeof window !== 'undefined' && window.location.pathname === '/') {
              console.log('🔄 Redirecting authenticated user to dashboard');
              window.location.href = '/dashboard';
            }
          }
        } else if (event === 'SIGNED_OUT') {
          console.log('👋 User signed out');
          setUser(null);
          setUserStats(null);
          setError(null);
        }
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  /**
   * Sign in with Google
   */
  const signInWithGoogle = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const redirectUrl = typeof window !== 'undefined' ? `${window.location.origin}/dashboard` : 'http://localhost:3000/dashboard';
      
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: redirectUrl,
        },
      });
      
      if (error) throw error;
      return data;
    } catch (err) {
      console.error('Error signing in with Google:', err);
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  /**
   * Sign in with Discord
   */
  const signInWithDiscord = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const redirectUrl = typeof window !== 'undefined' ? `${window.location.origin}/dashboard` : 'http://localhost:3000/dashboard';
      
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'discord',
        options: {
          redirectTo: redirectUrl,
        },
      });
      
      if (error) throw error;
      return data;
    } catch (err) {
      console.error('Error signing in with Discord:', err);
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  /**
   * Sign out
   */
  const signOut = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const { error } = await supabase.auth.signOut();
      
      if (error) throw error;
      
      setUser(null);
      setUserStats(null);
    } catch (err) {
      console.error('Error signing out:', err);
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  /**
   * Update user profile
   */
  const updateProfile = async (profileData) => {
    try {
      if (!user?.id) throw new Error('No user logged in');
      
      const updatedProfile = await updateUserProfile(user.id, profileData);
      
      setUserStats(prev => ({
        ...prev,
        profile: updatedProfile,
      }));
      
      return updatedProfile;
    } catch (err) {
      console.error('Error updating profile:', err);
      setError(err.message);
      throw err;
    }
  };

  /**
   * Update academic level
   */
  const updateLevel = async (academicLevel) => {
    try {
      if (!user?.id) throw new Error('No user logged in');
      
      await updateAcademicLevel(user.id, academicLevel);
      
      setUserStats(prev => ({
        ...prev,
        profile: {
          ...prev.profile,
          academic_level: academicLevel,
        },
      }));
    } catch (err) {
      console.error('Error updating academic level:', err);
      setError(err.message);
      throw err;
    }
  };

  /**
   * Refresh user data
   */
  const refreshUserData = async () => {
    try {
      if (!user?.id) return;
      
      const [profileData, statsData] = await Promise.all([
        getUserProfile(user.id),
        getUserStats(user.id),
      ]);
      
      setUserStats({
        ...statsData,
        profile: profileData,
      });
    } catch (err) {
      console.error('Error refreshing user data:', err);
      setError(err.message);
    }
  };

  return {
    user,
    userStats,
    loading,
    error,
    signInWithGoogle,
    signInWithDiscord,
    signOut,
    updateProfile,
    updateLevel,
    refreshUserData,
  };
};
