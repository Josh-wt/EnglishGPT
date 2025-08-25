#!/usr/bin/env python3
import re

# Read the file
with open('/workspace/frontend/src/App.js', 'r') as f:
    content = f.read()

# Fix 1: Update loading state initialization to check sessionStorage
old_loading = "  const [loading, setLoading] = useState(true); // Only for authentication loading"
new_loading = """  const [loading, setLoading] = useState(() => {
    // Check if we have a cached session to avoid showing loading on tab switches
    const cachedAuth = sessionStorage.getItem('auth_checked');
    return !cachedAuth;
  }); // Only for initial authentication loading"""

content = content.replace(old_loading, new_loading)

# Fix 2: Add caching logic to initializeSession
old_init = """    const initializeSession = async () => {
      // Debug logging removed for production
    // console.log('DEBUG: Getting session...');
      try {"""

new_init = """    const initializeSession = async () => {
      // Skip if we already have user data cached
      const cachedUser = sessionStorage.getItem('cached_user');
      if (cachedUser && !loading) {
        try {
          const userData = JSON.parse(cachedUser);
          setUser(userData.user);
          setUserStats(userData.userStats);
          setEvaluations(userData.evaluations || []);
          return;
        } catch (e) {
          // If cache is invalid, continue with normal flow
        }
      }

      // Debug logging removed for production
    // console.log('DEBUG: Getting session...');
      try {"""

content = content.replace(old_init, new_init)

# Fix 3: Only load user data if not cached
old_load = """        if (session?.user?.id) {
          setUser(session.user);
          loadUserData(session.user);"""

new_load = """        if (session?.user?.id) {
          setUser(session.user);
          // Only load user data if not cached
          if (!cachedUser) {
            loadUserData(session.user);
          }"""

content = content.replace(old_load, new_load, 1)  # Only replace first occurrence

# Fix 4: Add sessionStorage cleanup and setting
old_finally = """      } finally {
        setLoading(false);
      }"""

new_finally = """      } finally {
        setLoading(false);
        sessionStorage.setItem('auth_checked', 'true');
      }"""

content = content.replace(old_finally, new_finally)

# Fix 5: Handle auth state changes properly
old_auth_change = """      switch (event) {
        case 'SIGNED_IN':
        case 'INITIAL_SESSION':
        case 'TOKEN_REFRESHED':
          if (session?.user?.id) {
            setUser(session.user);
            loadUserData(session.user);"""

new_auth_change = """      switch (event) {
        case 'SIGNED_IN':
          if (session?.user?.id) {
            setUser(session.user);
            loadUserData(session.user);"""

content = content.replace(old_auth_change, new_auth_change)

# Fix 6: Add TOKEN_REFRESHED case separately
old_break = """          }
          break;
        case 'SIGNED_OUT':
        default:"""

new_break = """          }
          break;
        case 'TOKEN_REFRESHED':
          // Don't reload data on token refresh, just update the user
          if (session?.user?.id) {
            setUser(session.user);
          }
          break;
        case 'SIGNED_OUT':"""

content = content.replace(old_break, new_break)

# Fix 7: Remove default case and add sessionStorage cleanup
old_signout = """        case 'SIGNED_OUT':
        default:
          setUser(null);
          setUserStats({ questionsMarked: 0, credits: 3, currentPlan: 'free' });
          setEvaluations([]);
          // Go back to landing on sign out
          navigate('/', { replace: true });
          break;"""

new_signout = """        case 'SIGNED_OUT':
          setUser(null);
          setUserStats({ questionsMarked: 0, credits: 3, currentPlan: 'free' });
          setEvaluations([]);
          sessionStorage.removeItem('cached_user');
          sessionStorage.removeItem('auth_checked');
          // Go back to landing on sign out
          navigate('/', { replace: true });
          break;
        default:
          break;"""

content = content.replace(old_signout, new_signout)

# Fix 8: Add caching after loading user data
old_history = """      const historyResponse = await axios.get(`${API}/history/${supabaseUser.id}`);
      setEvaluations(historyResponse.data.evaluations || []);
      setLoadingState('historyLoad', false);
      
      // Debug logging removed for production"""

new_history = """      const historyResponse = await axios.get(`${API}/history/${supabaseUser.id}`);
      setEvaluations(historyResponse.data.evaluations || []);
      setLoadingState('historyLoad', false);
      
      // Cache user data to avoid reloading on tab switches
      sessionStorage.setItem('cached_user', JSON.stringify({
        user: userInfo,
        userStats: {
          questionsMarked: userInfo.questions_marked || 0,
          credits: userInfo.credits || 3,
          currentPlan: userInfo.current_plan || 'free'
        },
        evaluations: historyResponse.data.evaluations || []
      }));
      
      // Debug logging removed for production"""

content = content.replace(old_history, new_history)

# Fix 9: Clear cache on error in else block
old_else = """        } else {
          setUser(null);
          setUserStats({ questionsMarked: 0, credits: 3, currentPlan: 'free' });
          setEvaluations([]);
        }"""

new_else = """        } else {
          setUser(null);
          setUserStats({ questionsMarked: 0, credits: 3, currentPlan: 'free' });
          setEvaluations([]);
          sessionStorage.removeItem('cached_user');
        }"""

content = content.replace(old_else, new_else)

# Fix 10: Clear cache on error in catch block
old_catch = """        setUser(null);
        setUserStats({ questionsMarked: 0, credits: 3, currentPlan: 'free' });
        setEvaluations([]);
      } finally {"""

new_catch = """        setUser(null);
        setUserStats({ questionsMarked: 0, credits: 3, currentPlan: 'free' });
        setEvaluations([]);
        sessionStorage.removeItem('cached_user');
      } finally {"""

content = content.replace(old_catch, new_catch)

# Write the modified content back
with open('/workspace/frontend/src/App.js', 'w') as f:
    f.write(content)

print("Successfully applied all loading optimization fixes!")