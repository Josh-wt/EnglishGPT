import { useState, useEffect, useRef } from 'react';
import { supabase } from '../supabaseClient';
import { getUserProfile, updateUserProfile, updateAcademicLevel, getUserStats } from '../services/user';
import { applyLaunchPeriodBenefits } from '../utils/launchPeriod';
import { getApiUrl } from '../utils/backendUrl';

/**
 * Custom hook for user state management
 * @returns {Object} - User state and functions
 */
export const useUser = () => {
  const [user, setUser] = useState(null);
  const [userStats, setUserStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Debug tracking
  const initStartTime = useRef(null);
  const apiCallTimes = useRef({});
  const renderCount = useRef(0);

  // Track hook renders
  useEffect(() => {
    renderCount.current += 1;
    console.log('🔄 useUser Hook Debug:', {
      renderCount: renderCount.current,
      loading,
      hasUser: !!user,
      hasUserStats: !!userStats,
      hasError: !!error,
      timestamp: new Date().toISOString()
    });
  });

  // Initialize user state with caching
  useEffect(() => {
    const initializeUser = async () => {
      try {
        initStartTime.current = Date.now();
        console.log('🔄 Initializing user...', {
          startTime: new Date().toISOString(),
          cacheCheck: 'starting'
        });
        setLoading(true);
        
        // Check for cached user data first
        const cacheStartTime = Date.now();
        const cachedUserData = localStorage.getItem('userData');
        const cacheTimestamp = localStorage.getItem('userDataTimestamp');
        const isCacheValid = cacheTimestamp && (Date.now() - parseInt(cacheTimestamp)) < 300000; // 5 minutes cache
        
        console.log('📦 Cache check completed in', Date.now() - cacheStartTime, 'ms', {
          hasCachedData: !!cachedUserData,
          isCacheValid,
          cacheAge: cacheTimestamp ? Date.now() - parseInt(cacheTimestamp) : 'N/A'
        });
        
        // Get current session
        const sessionStartTime = Date.now();
        const { data: { session } } = await supabase.auth.getSession();
        const sessionTime = Date.now() - sessionStartTime;
        
        console.log('🔍 Session check completed in', sessionTime, 'ms:', { 
          hasSession: !!session, 
          hasUser: !!session?.user,
          userId: session?.user?.id 
        });
        
        if (session?.user) {
          console.log('✅ User found:', session.user.id);
          setUser(session.user);
          
          // Use cached data if valid and available
          if (isCacheValid && cachedUserData) {
            console.log('📦 Using cached user data');
            const parsedData = JSON.parse(cachedUserData);
            setUserStats(parsedData);
            setLoading(false);
            
            const totalInitTime = Date.now() - initStartTime.current;
            console.log('✅ User initialization completed with cache in', totalInitTime, 'ms');
            
            // Instant redirect to dashboard if authenticated and on main domain
            if (typeof window !== 'undefined' && window.location.pathname === '/') {
              console.log('🔄 Redirecting authenticated user to dashboard');
              window.location.href = '/dashboard';
            }
            return;
          }
          
          // Fetch user profile and stats
          try {
            console.log('📡 Fetching user data...');
            const apiStartTime = Date.now();
            
            // First, try to create the user if they don't exist
            // This ensures new users get launch period benefits immediately
            try {
              console.log('🆕 Attempting to create/ensure user exists during initialization...');
              const createStartTime = Date.now();
              const createResponse = await fetch(`${getApiUrl()}/api/users`, {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                  'Authorization': `Bearer ${(await supabase.auth.getSession()).data.session?.access_token}`
                },
                body: JSON.stringify({
                  user_id: session.user.id,
                  email: session.user.email,
                  name: session.user.user_metadata?.full_name || session.user.user_metadata?.name || '',
                  academic_level: 'N/A'
                })
              });
              
              if (createResponse.ok) {
                const createData = await createResponse.json();
                console.log('✅ User created/ensured during initialization in', Date.now() - createStartTime, 'ms:', createData);
              } else {
                console.log('ℹ️ User creation response during initialization:', createResponse.status, createResponse.statusText);
              }
            } catch (createError) {
              console.log('ℹ️ User creation attempt during initialization result:', createError.message);
              // Continue with normal flow even if creation fails
            }
            
            const [profileData, statsData] = await Promise.all([
              getUserProfile(session.user.id),
              getUserStats(session.user.id),
            ]);
            
            const apiTime = Date.now() - apiStartTime;
            console.log('�� User data received in', apiTime, 'ms:', { 
              profile: profileData, 
              stats: statsData 
            });
            
            // Apply launch period benefits
            const benefitsStartTime = Date.now();
            const finalStats = applyLaunchPeriodBenefits({
              ...statsData,
              profile: profileData,
            });
            const benefitsTime = Date.now() - benefitsStartTime;
            
            console.log('🎉 Final stats processed in', benefitsTime, 'ms:', finalStats);
            setUserStats(finalStats);
            
            // Cache the user data
            const cacheWriteStartTime = Date.now();
            localStorage.setItem('userData', JSON.stringify(finalStats));
            localStorage.setItem('userDataTimestamp', Date.now().toString());
            const cacheWriteTime = Date.now() - cacheWriteStartTime;
            
            console.log('💾 Cache written in', cacheWriteTime, 'ms');
            
            const totalInitTime = Date.now() - initStartTime.current;
            console.log('✅ User initialization completed in', totalInitTime, 'ms');
            
            // Instant redirect to dashboard if authenticated and on main domain
            if (typeof window !== 'undefined' && window.location.pathname === '/') {
              console.log('🔄 Redirecting authenticated user to dashboard');
              window.location.href = '/dashboard';
            }
          } catch (profileError) {
            console.error('❌ Error fetching user data:', profileError);
            const errorTime = Date.now() - initStartTime.current;
            console.log('❌ User initialization failed after', errorTime, 'ms');
            
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
            
            // Cache the default stats
            localStorage.setItem('userData', JSON.stringify(finalStats));
            localStorage.setItem('userDataTimestamp', Date.now().toString());
            
            const totalInitTime = Date.now() - initStartTime.current;
            console.log('✅ User initialization completed with fallback in', totalInitTime, 'ms');
            
            // Instant redirect to dashboard if authenticated and on main domain
            if (typeof window !== 'undefined' && window.location.pathname === '/') {
              console.log('🔄 Redirecting authenticated user to dashboard');
              window.location.href = '/dashboard';
            }
          }
        } else {
          console.log('👤 No user session found');
          // Clear cached data if no session
          localStorage.removeItem('userData');
          localStorage.removeItem('userDataTimestamp');
          
          const totalInitTime = Date.now() - initStartTime.current;
          console.log('✅ User initialization completed (no session) in', totalInitTime, 'ms');
        }
      } catch (err) {
        console.error('❌ Error initializing user:', err);
        const errorTime = Date.now() - initStartTime.current;
        console.log('❌ User initialization failed after', errorTime, 'ms');
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
        const authChangeStartTime = Date.now();
        console.log('🔐 Auth state change:', event, { 
          hasSession: !!session, 
          hasUser: !!session?.user,
          timestamp: new Date().toISOString()
        });
        
        if (event === 'SIGNED_IN' && session?.user) {
          setUser(session.user);
          setError(null);
          
          try {
            console.log('📡 Fetching user data on sign in...');
            const apiStartTime = Date.now();
            
            // First, try to create the user if they don't exist
            // This ensures new users get launch period benefits immediately
            try {
              console.log('🆕 Attempting to create/ensure user exists...');
              const createStartTime = Date.now();
              const createResponse = await fetch(`${getApiUrl()}/api/users`, {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                  'Authorization': `Bearer ${session.access_token}`
                },
                body: JSON.stringify({
                  user_id: session.user.id,
                  email: session.user.email,
                  name: session.user.user_metadata?.full_name || session.user.user_metadata?.name || '',
                  academic_level: 'N/A'
                })
              });
              
              if (createResponse.ok) {
                const createData = await createResponse.json();
                console.log('✅ User created/ensured in', Date.now() - createStartTime, 'ms:', createData);
              } else {
                console.log('ℹ️ User creation response:', createResponse.status, createResponse.statusText);
              }
            } catch (createError) {
              console.log('ℹ️ User creation attempt result:', createError.message);
              // Continue with normal flow even if creation fails
            }
            
            const [profileData, statsData] = await Promise.all([
              getUserProfile(session.user.id),
              getUserStats(session.user.id),
            ]);
            
            const apiTime = Date.now() - apiStartTime;
            console.log('📊 User data received on sign in in', apiTime, 'ms');
            
            // Apply launch period benefits
            const finalStats = applyLaunchPeriodBenefits({
              ...statsData,
              profile: profileData,
            });
            
            setUserStats(finalStats);
            
            // Cache the user data
            localStorage.setItem('userData', JSON.stringify(finalStats));
            localStorage.setItem('userDataTimestamp', Date.now().toString());
            
            const totalAuthChangeTime = Date.now() - authChangeStartTime;
            console.log('✅ Auth change (SIGNED_IN) completed in', totalAuthChangeTime, 'ms');
            
            // Instant redirect to dashboard if on main domain
            if (typeof window !== 'undefined' && window.location.pathname === '/') {
              console.log('🔄 Redirecting authenticated user to dashboard');
              window.location.href = '/dashboard';
            }
          } catch (profileError) {
            console.error('❌ Error fetching user data on sign in:', profileError);
            const errorTime = Date.now() - authChangeStartTime;
            console.log('❌ Auth change (SIGNED_IN) failed after', errorTime, 'ms');
            
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
            
            // Cache the default stats
            localStorage.setItem('userData', JSON.stringify(finalStats));
            localStorage.setItem('userDataTimestamp', Date.now().toString());
            
            const totalAuthChangeTime = Date.now() - authChangeStartTime;
            console.log('✅ Auth change (SIGNED_IN) completed with fallback in', totalAuthChangeTime, 'ms');
            
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
          // Clear cached data on sign out
          localStorage.removeItem('userData');
          localStorage.removeItem('userDataTimestamp');
          
          const totalAuthChangeTime = Date.now() - authChangeStartTime;
          console.log('✅ Auth change (SIGNED_OUT) completed in', totalAuthChangeTime, 'ms');
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
      const signInStartTime = Date.now();
      console.log('🔐 Starting Google sign in...');
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
      
      const signInTime = Date.now() - signInStartTime;
      console.log('✅ Google sign in completed in', signInTime, 'ms');
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
      const signInStartTime = Date.now();
      console.log('🔐 Starting Discord sign in...');
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
      
      const signInTime = Date.now() - signInStartTime;
      console.log('✅ Discord sign in completed in', signInTime, 'ms');
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
      const signOutStartTime = Date.now();
      console.log('🔐 Starting sign out...');
      setLoading(true);
      setError(null);
      
      const { error } = await supabase.auth.signOut();
      
      if (error) throw error;
      
      setUser(null);
      setUserStats(null);
      
      const signOutTime = Date.now() - signOutStartTime;
      console.log('✅ Sign out completed in', signOutTime, 'ms');
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
      
      const updateStartTime = Date.now();
      console.log('📝 Updating user profile...');
      
      const updatedProfile = await updateUserProfile(user.id, profileData);
      
      setUserStats(prev => ({
        ...prev,
        profile: updatedProfile,
      }));
      
      const updateTime = Date.now() - updateStartTime;
      console.log('✅ Profile update completed in', updateTime, 'ms');
      
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
      
      const updateStartTime = Date.now();
      console.log('📝 Updating academic level...');
      
      await updateAcademicLevel(user.id, academicLevel);
      
      setUserStats(prev => ({
        ...prev,
        profile: {
          ...prev.profile,
          academic_level: academicLevel,
        },
      }));
      
      const updateTime = Date.now() - updateStartTime;
      console.log('✅ Academic level update completed in', updateTime, 'ms');
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
      
      const refreshStartTime = Date.now();
      console.log('🔄 Refreshing user data...');
      
      // Clear cache to force fresh data
      localStorage.removeItem('userData');
      localStorage.removeItem('userDataTimestamp');
      
      const [profileData, statsData] = await Promise.all([
        getUserProfile(user.id),
        getUserStats(user.id),
      ]);
      
      const finalStats = applyLaunchPeriodBenefits({
        ...statsData,
        profile: profileData,
      });
      
      setUserStats(finalStats);
      
      // Cache the fresh data
      localStorage.setItem('userData', JSON.stringify(finalStats));
      localStorage.setItem('userDataTimestamp', Date.now().toString());
      
      const refreshTime = Date.now() - refreshStartTime;
      console.log('✅ User data refresh completed in', refreshTime, 'ms');
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
