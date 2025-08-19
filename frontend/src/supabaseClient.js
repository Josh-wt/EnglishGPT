import { createClient } from '@supabase/supabase-js'

// Hard-coded values as fallback since env vars aren't loading
const supabaseUrl = process.env.REACT_APP_SUPABASE_URL || 'https://zwrwtqspeyajttnuzwkl.supabase.co'
const supabaseKey = process.env.REACT_APP_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imt2dXpyeWh3c3puZ2NkZGV0YWxhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTUxNjM0MTYsImV4cCI6MjA3MDczOTQxNn0._VVBtKk89uUyZEE3OKy9ZberPetp37dVbEoxOigN1lU'

export const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  }
})

// Manual OAuth callback handler for when detectSessionInUrl doesn't work
export const handleAuthCallback = async () => {
  // Check if we have OAuth tokens in the URL
  const hashParams = new URLSearchParams(window.location.hash.substring(1));
  const accessToken = hashParams.get('access_token');
  const refreshToken = hashParams.get('refresh_token');
  const expiresAt = hashParams.get('expires_at');

  if (accessToken && refreshToken) {
    console.log('🔄 Processing OAuth callback...');
    try {
      // Set the session manually
      const { data, error } = await supabase.auth.setSession({
        access_token: accessToken,
        refresh_token: refreshToken,
      });

      if (error) {
        console.error('❌ Error setting session:', error);
        return null;
      }

      console.log('✅ Session set successfully:', data.session?.user?.email);
      
      // Clear the URL
      window.history.replaceState({}, document.title, window.location.pathname);
      
      return data.session;
    } catch (err) {
      console.error('❌ Exception setting session:', err);
      return null;
    }
  }

  return null;
};

// Debug Supabase configuration
console.log('DEBUG: Supabase URL:', supabaseUrl);
console.log('DEBUG: Supabase Key (first 20 chars):', supabaseKey.substring(0, 20) + '...');
console.log('DEBUG: Key length:', supabaseKey.length);
console.log('DEBUG: Environment variables loaded:', {
  hasUrl: !!process.env.REACT_APP_SUPABASE_URL,
  hasKey: !!process.env.REACT_APP_SUPABASE_ANON_KEY
});