import { useState, useEffect, useRef } from 'react';
import { supabase } from '../supabaseClient';
import { getUserProfile, updateUserProfile, updateAcademicLevel, getUserStats } from '../services/user';
import { applyLaunchPeriodBenefits } from '../utils/launchPeriod';
import { getApiUrl } from '../utils/backendUrl';
import axios from 'axios';

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
      // Add timeout to prevent hanging
      const timeoutId = setTimeout(() => {
        console.warn('⚠️ User initialization timeout - forcing loading to false');
        setLoading(false);
      }, 10000); // 10 second timeout
      try {
        initStartTime.current = Date.now();
        console.log('🔄 Initializing user...', {
          startTime: new Date().toISOString(),
          cacheCheck: 'starting'
        });
        setLoading(true);
        console.log('🔄 Loading state set to true');
        
        // Check for cached user data first
        const cacheStartTime = Date.now();
        const cachedUserData = localStorage.getItem('userData');
        const cacheTimestamp = localStorage.getItem('userDataTimestamp');
        const isCacheValid = cacheTimestamp && (Date.now() - parseInt(cacheTimestamp)) < 300000; // 5 minutes cache
        
        // Check for cached academic level separately
        const cachedAcademicLevel = localStorage.getItem('academicLevel');
        
        console.log('📦 Cache check completed in', Date.now() - cacheStartTime, 'ms', {
          hasCachedData: !!cachedUserData,
          isCacheValid,
          cacheAge: cacheTimestamp ? Date.now() - parseInt(cacheTimestamp) : 'N/A',
          cachedData: cachedUserData ? JSON.parse(cachedUserData) : null
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
          
          // Use cached user data if valid and available
          if (isCacheValid && cachedUserData) {
            console.log('📦 Using cached user data');
            const parsedData = JSON.parse(cachedUserData);
            
            // Apply the same field mapping to cached data
            const mappedCachedData = {
              ...parsedData,
              // Map backend field names to frontend field names
              currentPlan: parsedData.current_plan || parsedData.currentPlan || 'free',
              questionsMarked: parsedData.questions_marked || parsedData.questionsMarked || 0,
              credits: parsedData.credits || 3,
              // Include academic level from separate cache if available
              academicLevel: cachedAcademicLevel || parsedData.academic_level || parsedData.academicLevel || 'N/A',
            };
            
            setUserStats(mappedCachedData);
            console.log('🔄 Setting loading to false (cached data path)');
            setLoading(false);
            
            const totalInitTime = Date.now() - initStartTime.current;
            console.log('✅ User initialization completed with cache in', totalInitTime, 'ms');
            
            // Instant redirect to dashboard if authenticated and on main domain
            if (typeof window !== 'undefined' && window.location.pathname === '/') {
              console.log('🔄 Redirecting authenticated user to dashboard');
              console.log('🔄 User data before redirect:', {
                hasUser: !!user,
                hasUserStats: !!userStats,
                userStats: userStats
              });
              // Use setTimeout to ensure state is updated before redirect
              setTimeout(() => {
                window.location.href = '/dashboard';
              }, 100);
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
              console.log('🆕 Attempting to create/ensure user exists...');
              const createStartTime = Date.now();
              const finalUrl = `${getApiUrl()}/users`;
              
              const createResponse = await axios.post(finalUrl, {
                user_id: session.user.id,
                email: session.user.email,
                name: session.user.user_metadata?.full_name || session.user.user_metadata?.name || ''
              });
              
              if (createResponse.status >= 200 && createResponse.status < 300) {
                const createData = createResponse.data;
                console.log('✅ User created/ensured in', Date.now() - createStartTime, 'ms:', createData);
                
                // Set user to unlimited immediately like the backup file
                try {
                  console.log('🚀 Setting user to unlimited plan...');
                  const unlimitedResponse = await axios.put(`${getApiUrl()}/users/${session.user.id}`, {
                    current_plan: 'unlimited',
                    updated_at: new Date().toISOString()
                  });
                  console.log('✅ User set to unlimited plan:', unlimitedResponse.data);
                } catch (unlimitedError) {
                  console.error('❌ Failed to set unlimited plan:', unlimitedError);
                }
              } else {
                console.log('ℹ️ User creation response:', createResponse.status, createResponse.statusText);
              }
            } catch (createError) {
              console.log('ℹ️ User creation attempt result:', createError.message);
              // Continue with normal flow even if creation fails
            }
            
            // Add timeout to prevent hanging API calls
            const apiTimeout = 15000; // 15 seconds timeout
            console.log('🔄 Starting user data fetch with timeout:', apiTimeout, 'ms');
            
            let profileData, statsData;
            try {
              [profileData, statsData] = await Promise.all([
                Promise.race([
                  getUserProfile(session.user.id),
                  new Promise((_, reject) => 
                    setTimeout(() => reject(new Error('getUserProfile timeout')), apiTimeout)
                  )
                ]),
                Promise.race([
                  getUserStats(session.user.id),
                  new Promise((_, reject) => 
                    setTimeout(() => reject(new Error('getUserStats timeout')), apiTimeout)
                  )
                ])
              ]);
            } catch (apiError) {
              console.error('❌ API calls failed or timed out:', apiError);
              console.log('🔄 Using fallback user data...');
              
              // Use fallback data when API calls fail - since user was just created and set to unlimited, use unlimited plan
              console.log('🔄 Using unlimited plan fallback data since user was just created');
              profileData = {
                id: session.user.id,
                email: session.user.email,
                name: session.user.user_metadata?.full_name || session.user.user_metadata?.name || '',
                current_plan: 'unlimited',
                credits: 999999,
                questions_marked: 0,
                academic_level: 'N/A'
              };
              statsData = {
                id: session.user.id,
                email: session.user.email,
                name: session.user.user_metadata?.full_name || session.user.user_metadata?.name || '',
                current_plan: 'unlimited',
                credits: 999999,
                questions_marked: 0,
                academic_level: 'N/A'
              };
            }
            
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
            
            // Use the actual user data from backend, properly map field names
            const userStats = {
              ...finalStats,
              // Map backend field names to frontend field names
              currentPlan: finalStats.current_plan || finalStats.currentPlan || 'free',
              questionsMarked: finalStats.questions_marked || finalStats.questionsMarked || 0,
              credits: finalStats.credits || 3,
              academicLevel: finalStats.academic_level || finalStats.academicLevel || cachedAcademicLevel || 'N/A',
              showWelcomeMessage: false
            };
            
            console.log('🔄 Setting user stats from backend:', userStats);
            setUserStats(userStats);
            
            // Cache the user data
            const cacheWriteStartTime = Date.now();
            localStorage.setItem('userData', JSON.stringify(userStats));
            localStorage.setItem('userDataTimestamp', Date.now().toString());
            console.log('💾 User data cached to localStorage:', userStats);
            const cacheWriteTime = Date.now() - cacheWriteStartTime;
            
            console.log('💾 Cache written in', cacheWriteTime, 'ms');
            
            // Fetch academic level from backend like the backup file
            try {
              console.log('📥 Fetching academic level after user data load...');
              await fetchAcademicLevel();
            } catch (levelError) {
              console.error('❌ Failed to fetch academic level:', levelError);
            }
            
            // Ensure user has unlimited access
            try {
              console.log('🚀 Ensuring unlimited access after user data load...');
              await ensureUnlimitedAccess();
            } catch (unlimitedError) {
              console.error('❌ Failed to ensure unlimited access:', unlimitedError);
            }
            
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
            
            // Check if this is a "missing email" error (400) - means user needs to be created
            if (profileError.response?.status === 400 && 
                profileError.response?.data?.error?.includes('missing email information')) {
              console.log('🔄 Detected missing user error, attempting user creation...');
              console.log('🔧 Error details:', {
                status: profileError.response?.status,
                error: profileError.response?.data?.error,
                userId: session.user.id,
                userEmail: session.user.email
              });
              
              try {
                const createStartTime = Date.now();
                const finalUrl = `${getApiUrl()}/users`;
                console.log('🆕 Creating user with URL:', finalUrl);
                
                // Use axios like the backup file for consistency
                const createResponse = await axios.post(finalUrl, {
                  user_id: session.user.id,
                  email: session.user.email,
                  name: session.user.user_metadata?.full_name || session.user.user_metadata?.name || ''
                });
                
                console.log('📡 User creation recovery response:', {
                  status: createResponse.status,
                  statusText: createResponse.statusText,
                  ok: createResponse.status >= 200 && createResponse.status < 300,
                  url: createResponse.config?.url,
                  data: createResponse.data
                });
                
                if (createResponse.status >= 200 && createResponse.status < 300) {
                  console.log('✅ User created after error detection in', Date.now() - createStartTime, 'ms:', createResponse.data);
                  
                  // Set user to unlimited immediately like the backup file
                  try {
                    console.log('🚀 Setting user to unlimited plan after error recovery...');
                    const unlimitedResponse = await axios.put(`${getApiUrl()}/users/${session.user.id}`, {
                      current_plan: 'unlimited',
                      updated_at: new Date().toISOString()
                    });
                    console.log('✅ User set to unlimited plan after error recovery:', unlimitedResponse.data);
                  } catch (unlimitedError) {
                    console.error('❌ Failed to set unlimited plan after error recovery:', unlimitedError);
                  }
                  
                  // Now try to fetch the user data again
                  try {
                    console.log('🔄 Retrying user data fetch after successful creation...');
                    const [profileData, statsData] = await Promise.all([
                      getUserProfile(session.user.id),
                      getUserStats(session.user.id),
                    ]);
                    
                    const finalStats = applyLaunchPeriodBenefits({
                      ...statsData,
                      profile: profileData,
                    });
                    
                    // Set to unlimited by default like the backup file
                    const unlimitedStats = {
                      ...finalStats,
                      currentPlan: 'unlimited',
                      credits: 999999, // Unlimited credits
                      showWelcomeMessage: false
                    };
                    
                    setUserStats(unlimitedStats);
                    localStorage.setItem('userData', JSON.stringify(unlimitedStats));
                    localStorage.setItem('userDataTimestamp', Date.now().toString());
                    
                    // Fetch academic level from backend like the backup file
                    try {
                      console.log('📥 Fetching academic level after user creation...');
                      await fetchAcademicLevel();
                    } catch (levelError) {
                      console.error('❌ Failed to fetch academic level:', levelError);
                    }
                    
                    const totalInitTime = Date.now() - initStartTime.current;
                    console.log('✅ User initialization completed after recovery in', totalInitTime, 'ms');
                    
                    if (typeof window !== 'undefined' && window.location.pathname === '/') {
                      window.location.href = '/dashboard';
                    }
                    return; // Success, exit early
                  } catch (retryError) {
                    console.error('❌ Failed to fetch user data after creation:', retryError);
                  }
                } else {
                  console.log('❌ User creation failed after error detection:', {
                    status: createResponse.status,
                    statusText: createResponse.statusText,
                    data: createResponse.data,
                    duration: Date.now() - createStartTime,
                    responseUrl: createResponse.config?.url,
                    requestUrl: finalUrl
                  });
                }
              } catch (createError) {
                console.error('❌ Failed to create user after error detection:', createError);
                console.log('🔧 Create error details:', {
                  message: createError.message,
                  stack: createError.stack,
                  name: createError.name,
                  response: createError.response?.data,
                  status: createError.response?.status
                });
              }
            }
            
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
        clearTimeout(timeoutId);
        console.log('✅ User initialization complete - setting loading to false');
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
              const finalUrl = `${getApiUrl()}/users`;
              
              const createResponse = await axios.post(finalUrl, {
                user_id: session.user.id,
                email: session.user.email,
                name: session.user.user_metadata?.full_name || session.user.user_metadata?.name || ''
              });
              
              if (createResponse.status >= 200 && createResponse.status < 300) {
                const createData = createResponse.data;
                console.log('✅ User created/ensured in', Date.now() - createStartTime, 'ms:', createData);
                
                // Set user to unlimited immediately like the backup file
                try {
                  console.log('🚀 Setting user to unlimited plan...');
                  const unlimitedResponse = await axios.put(`${getApiUrl()}/users/${session.user.id}`, {
                    current_plan: 'unlimited',
                    updated_at: new Date().toISOString()
                  });
                  console.log('✅ User set to unlimited plan:', unlimitedResponse.data);
                } catch (unlimitedError) {
                  console.error('❌ Failed to set unlimited plan:', unlimitedError);
                }
              } else {
                console.log('ℹ️ User creation response:', createResponse.status, createResponse.statusText);
              }
            } catch (createError) {
              console.log('ℹ️ User creation attempt result:', createError.message);
              // Continue with normal flow even if creation fails
            }
            
            // Add timeout to prevent hanging API calls
            const apiTimeout = 15000; // 15 seconds timeout
            console.log('🔄 Starting user data fetch with timeout:', apiTimeout, 'ms');
            
            let profileData, statsData;
            try {
              [profileData, statsData] = await Promise.all([
                Promise.race([
                  getUserProfile(session.user.id),
                  new Promise((_, reject) => 
                    setTimeout(() => reject(new Error('getUserProfile timeout')), apiTimeout)
                  )
                ]),
                Promise.race([
                  getUserStats(session.user.id),
                  new Promise((_, reject) => 
                    setTimeout(() => reject(new Error('getUserStats timeout')), apiTimeout)
                  )
                ])
              ]);
            } catch (apiError) {
              console.error('❌ API calls failed or timed out:', apiError);
              console.log('🔄 Using fallback user data...');
              
              // Use fallback data when API calls fail - since user was just created and set to unlimited, use unlimited plan
              console.log('🔄 Using unlimited plan fallback data since user was just created');
              profileData = {
                id: session.user.id,
                email: session.user.email,
                name: session.user.user_metadata?.full_name || session.user.user_metadata?.name || '',
                current_plan: 'unlimited',
                credits: 999999,
                questions_marked: 0,
                academic_level: 'N/A'
              };
              statsData = {
                id: session.user.id,
                email: session.user.email,
                name: session.user.user_metadata?.full_name || session.user.user_metadata?.name || '',
                current_plan: 'unlimited',
                credits: 999999,
                questions_marked: 0,
                academic_level: 'N/A'
              };
            }
            
            const apiTime = Date.now() - apiStartTime;
            console.log('📊 User data received on sign in in', apiTime, 'ms');
            
            // Apply launch period benefits
            const finalStats = applyLaunchPeriodBenefits({
              ...statsData,
              profile: profileData,
            });
            
            // Set to unlimited by default like the backup file
            const unlimitedStats = {
              ...finalStats,
              currentPlan: 'unlimited',
              credits: 999999, // Unlimited credits
              showWelcomeMessage: false
            };
            
            setUserStats(unlimitedStats);
            
            // Cache the user data
            localStorage.setItem('userData', JSON.stringify(unlimitedStats));
            localStorage.setItem('userDataTimestamp', Date.now().toString());
            
            // Fetch academic level from backend like the backup file
            try {
              console.log('📥 Fetching academic level after user data load...');
              await fetchAcademicLevel();
            } catch (levelError) {
              console.error('❌ Failed to fetch academic level:', levelError);
            }
            
            // Ensure user has unlimited access
            try {
              console.log('🚀 Ensuring unlimited access after user data load...');
              await ensureUnlimitedAccess();
            } catch (unlimitedError) {
              console.error('❌ Failed to ensure unlimited access:', unlimitedError);
            }
            
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
            
            // Check if this is a "missing email" error (400) - means user needs to be created
            if (profileError.response?.status === 400 && 
                profileError.response?.data?.error?.includes('missing email information')) {
              console.log('🔄 Detected missing user error during sign in, attempting user creation...');
              console.log('🔧 Error details during sign in:', {
                status: profileError.response?.status,
                error: profileError.response?.data?.error,
                userId: session.user.id,
                userEmail: session.user.email
              });
              
              try {
                const createStartTime = Date.now();
                const finalUrl = `${getApiUrl()}/users`;
                console.log('🆕 Creating user during sign in with URL:', finalUrl);
                
                // Use axios like the backup file for consistency
                const createResponse = await axios.post(finalUrl, {
                  user_id: session.user.id,
                  email: session.user.email,
                  name: session.user.user_metadata?.full_name || session.user.user_metadata?.name || ''
                });
                
                console.log('📡 User creation during sign in response:', {
                  status: createResponse.status,
                  statusText: createResponse.statusText,
                  ok: createResponse.status >= 200 && createResponse.status < 300,
                  url: createResponse.config?.url,
                  data: createResponse.data
                });
                
                if (createResponse.status >= 200 && createResponse.status < 300) {
                  console.log('✅ User created after error detection during sign in in', Date.now() - createStartTime, 'ms:', createResponse.data);
                  
                  // Set user to unlimited immediately like the backup file
                  try {
                    console.log('🚀 Setting user to unlimited plan after error recovery...');
                    const unlimitedResponse = await axios.put(`${getApiUrl()}/users/${session.user.id}`, {
                      current_plan: 'unlimited',
                      updated_at: new Date().toISOString()
                    });
                    console.log('✅ User set to unlimited plan after error recovery:', unlimitedResponse.data);
                  } catch (unlimitedError) {
                    console.error('❌ Failed to set unlimited plan after error recovery:', unlimitedError);
                  }
                  
                  // Now try to fetch the user data again
                  try {
                    console.log('🔄 Retrying user data fetch after creation during sign in...');
                    const [profileData, statsData] = await Promise.all([
                      getUserProfile(session.user.id),
                      getUserStats(session.user.id),
                    ]);
                    
                    const finalStats = applyLaunchPeriodBenefits({
                      ...statsData,
                      profile: profileData,
                    });
                    
                    // Set to unlimited by default like the backup file
                    const unlimitedStats = {
                      ...finalStats,
                      currentPlan: 'unlimited',
                      credits: 999999, // Unlimited credits
                      showWelcomeMessage: false
                    };
                    
                    setUserStats(unlimitedStats);
                    localStorage.setItem('userData', JSON.stringify(unlimitedStats));
                    localStorage.setItem('userDataTimestamp', Date.now().toString());
                    
                    // Fetch academic level from backend like the backup file
                    try {
                      console.log('📥 Fetching academic level after user creation...');
                      await fetchAcademicLevel();
                    } catch (levelError) {
                      console.error('❌ Failed to fetch academic level:', levelError);
                    }
                    
                    const totalAuthChangeTime = Date.now() - authChangeStartTime;
                    console.log('✅ Auth change (SIGNED_IN) completed after recovery in', totalAuthChangeTime, 'ms');
                    
                    if (typeof window !== 'undefined' && window.location.pathname === '/') {
                      window.location.href = '/dashboard';
                    }
                    return; // Success, exit early
                  } catch (retryError) {
                    console.error('❌ Failed to fetch user data after creation during sign in:', retryError);
                  }
                } else {
                  console.log('❌ User creation failed after error detection during sign in:', {
                    status: createResponse.status,
                    statusText: createResponse.statusText,
                    data: createResponse.data,
                    duration: Date.now() - createStartTime,
                    responseUrl: createResponse.config?.url,
                    requestUrl: finalUrl
                  });
                }
              } catch (createError) {
                console.error('❌ Failed to create user after error detection during sign in:', createError);
                console.log('🔧 Create error details during sign in:', {
                  message: createError.message,
                  stack: createError.stack,
                  name: createError.name,
                  response: createError.response?.data,
                  status: createError.response?.status
                });
              }
            }
            
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
        academicLevel: academicLevel,
      }));
      
      // Update localStorage - both in userData and separate academicLevel key
      const currentData = JSON.parse(localStorage.getItem('userData') || '{}');
      const updatedData = {
        ...currentData,
        academicLevel: academicLevel
      };
      localStorage.setItem('userData', JSON.stringify(updatedData));
      localStorage.setItem('academicLevel', academicLevel);
      
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

  // Ensure user has unlimited access
  const ensureUnlimitedAccess = async () => {
    if (!user?.id) {
      console.error('Cannot ensure unlimited access: user not ready');
      return false;
    }
    
    try {
      console.log('🚀 Ensuring user has unlimited access...');
      
      // Check current plan in backend
      const response = await axios.get(`${getApiUrl()}/users/${user.id}`);
      const currentPlan = response.data.user?.current_plan;
      
      if (currentPlan !== 'unlimited') {
        console.log('🔄 Setting user to unlimited plan...');
        const unlimitedResponse = await axios.put(`${getApiUrl()}/users/${user.id}`, {
          current_plan: 'unlimited',
          updated_at: new Date().toISOString()
        });
        console.log('✅ User set to unlimited plan:', unlimitedResponse.data);
      } else {
        console.log('✅ User already has unlimited plan');
      }
      
      // Update local state
      setUserStats(prev => {
        if (prev) {
          return {
            ...prev,
            currentPlan: 'unlimited',
            credits: 999999
          };
        }
        return prev;
      });
      
      // Update localStorage
      const currentData = JSON.parse(localStorage.getItem('userData') || '{}');
      const updatedData = {
        ...currentData,
        currentPlan: 'unlimited',
        credits: 999999
      };
      localStorage.setItem('userData', JSON.stringify(updatedData));
      
      console.log('✅ Unlimited access ensured');
      return true;
    } catch (error) {
      console.error('❌ Failed to ensure unlimited access:', error);
      return false;
    }
  };

  // Force refresh user data from backend
  const forceRefreshUserData = async () => {
    if (!user?.id) {
      console.error('Cannot refresh user data: user not ready');
      return false;
    }
    
    try {
      console.log('🔄 Force refreshing user data from backend...');
      
      // Fetch fresh data
      const [profileData, statsData] = await Promise.all([
        getUserProfile(user.id),
        getUserStats(user.id),
      ]);
      
      // Apply launch period benefits
      const finalStats = applyLaunchPeriodBenefits({
        ...statsData,
        profile: profileData,
      });
      
      // Set to unlimited by default like the backup file
      const unlimitedStats = {
        ...finalStats,
        currentPlan: 'unlimited',
        credits: 999999, // Unlimited credits
        showWelcomeMessage: false
      };
      
      setUserStats(unlimitedStats);
      
      // Update localStorage
      localStorage.setItem('userData', JSON.stringify(unlimitedStats));
      localStorage.setItem('userDataTimestamp', Date.now().toString());
      
      // Fetch academic level
      await fetchAcademicLevel();
      
      console.log('✅ User data force refreshed successfully');
      return true;
    } catch (error) {
      console.error('❌ Failed to force refresh user data:', error);
      return false;
    }
  };

  // Fetch academic level from backend like the backup file
  const fetchAcademicLevel = async () => {
    if (!user?.id) {
      console.error('Cannot fetch academic level: user not ready');
      return;
    }
    
    try {
      console.log('📥 Fetching academic level from backend...');
      const response = await axios.get(`${getApiUrl()}/users/${user.id}`);
      const backendLevel = response.data.user?.academic_level;
      
      console.log('📥 Backend academic level:', backendLevel);
      
      if (backendLevel && backendLevel !== 'N/A') {
        const normalizedLevel = backendLevel.toLowerCase().replace(/[^a-z]/g, '');
        console.log('✅ Normalized academic level:', normalizedLevel);
        
        // Update local state if userStats exists
        setUserStats(prev => {
          if (prev) {
            return {
              ...prev,
              academicLevel: normalizedLevel
            };
          }
          return prev;
        });
        
        // Update localStorage - both in userData and separate academicLevel key
        const currentData = JSON.parse(localStorage.getItem('userData') || '{}');
        const updatedData = {
          ...currentData,
          academicLevel: normalizedLevel
        };
        localStorage.setItem('userData', JSON.stringify(updatedData));
        localStorage.setItem('academicLevel', normalizedLevel);
        
        return normalizedLevel;
      } else {
        console.log('ℹ️ No academic level set in backend');
        return null;
      }
    } catch (error) {
      console.error('❌ Failed to fetch academic level:', error);
      return null;
    }
  };

  // Check if user has unlimited access
  const hasUnlimitedAccess = () => {
    return userStats?.currentPlan === 'unlimited';
  };

  // Set academic level (called from components)
  const setAcademicLevel = async (level) => {
    if (!user?.id) {
      console.error('Cannot set academic level: user not ready');
      return false;
    }
    
    try {
      console.log('💾 Setting academic level:', level);
      
      // Save to backend first
      await saveAcademicLevel(level);
      
      // Update local state immediately
      setUserStats(prev => {
        if (prev) {
          return {
            ...prev,
            academicLevel: level
          };
        }
        return prev;
      });
      
      // Update localStorage - both in userData and separate academicLevel key
      const currentData = JSON.parse(localStorage.getItem('userData') || '{}');
      const updatedData = {
        ...currentData,
        academicLevel: level
      };
      localStorage.setItem('userData', JSON.stringify(updatedData));
      localStorage.setItem('academicLevel', level);
      
      console.log('✅ Academic level set successfully:', level);
      return true;
    } catch (error) {
      console.error('❌ Failed to set academic level:', error);
      return false;
    }
  };

  // Save academic level to backend like the backup file
  const saveAcademicLevel = async (level) => {
    if (!user?.id) {
      console.error('Cannot save academic level: user not ready');
      return;
    }
    
    try {
      console.log('💾 Saving academic level to backend:', level);
      const response = await axios.put(`${getApiUrl()}/users/${user.id}`, { 
        academic_level: level 
      });
      console.log('✅ Academic level saved successfully:', response.data);
      
      // Update local state
      setUserStats(prev => ({
        ...prev,
        profile: {
          ...prev.profile,
          academic_level: level
        }
      }));
      
      // Update localStorage
      const currentData = JSON.parse(localStorage.getItem('userData') || '{}');
      const updatedData = {
        ...currentData,
        profile: {
          ...currentData.profile,
          academic_level: level
        }
      };
      localStorage.setItem('userData', JSON.stringify(updatedData));
      
    } catch (error) {
      console.error('❌ Failed to save academic level:', error);
    }
  };

  // Toggle dark mode

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
    forceRefreshUserData,
    saveAcademicLevel,
    fetchAcademicLevel,
    setAcademicLevel,
    hasUnlimitedAccess,
    ensureUnlimitedAccess,
  };
};
