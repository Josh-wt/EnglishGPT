# Analytics Performance Debugging Guide

## Comprehensive Debugging Added

### Frontend Debugging

#### 1. **App.js - Evaluations Loading**
```javascript
// Watch for these logs:
🔄 Loading evaluations for user {user_id}...
✅ Evaluations loaded: {count} items in {duration}ms
✅ Set {count} evaluations in state
⚠️ Slow evaluations fetch: {duration}ms for user {user_id}  // If > 3s
```

#### 2. **AnalyticsDashboard.js - Component State**
```javascript
// Check component state:
🔍 Analytics Dashboard State: {
  evaluations: [...],
  evaluationsType: "object",
  evaluationsIsArray: true,
  evaluationsLength: 92,
  hasEvaluations: true,
  isLoadingEvaluations: false,
  hasUnlimitedAccess: true
}
```

#### 3. **Analytics Service - API Call**
```javascript
// Track API flow:
🔍 [Analytics Service] Starting getUserAnalytics for user: {user_id}
🔍 [Analytics Service] Full URL: /analytics/{user_id}
📡 [Analytics Service] Making API request...
✅ [Analytics Service] API request completed in {duration}ms
📦 [Analytics Service] Response data: {
  status: 200,
  hasData: true,
  dataKeys: ["analytics"]
}
```

#### 4. **AnalyticsDashboard - AI Insights Fetch**
```javascript
// When user clicks "Generate AI Insights":
🚀 [Analytics] Starting AI insights fetch for user: {user_id}
🔍 [Analytics] Calling getUserAnalytics...
✅ [Analytics] getUserAnalytics completed in {duration}ms
📊 [Analytics] Response data: {
  hasData: true,
  hasAnalytics: true,
  hasRecommendations: true,
  recommendationsLength: 1234,
  totalResponses: 92
}
✅ [Analytics] State updated successfully
```

### Backend Debugging

#### 1. **Analytics Endpoint - Overall Flow**
```python
# Watch for these logs in backend/backend.log:
📊 ═══════════════════════════════════════════
📊 Analytics request START for user: {user_id}
📊 Timestamp: 2025-10-01T...
📊 ═══════════════════════════════════════════
```

#### 2. **User Validation**
```python
🔍 Fetching user data for: {user_id}
✅ User found: {user_id}, plan: unlimited
```

#### 3. **Evaluations Fetch**
```python
🔍 Fetching evaluations from Supabase for user: {user_id}
✅ Retrieved 92 evaluations in 0.23s
```

#### 4. **Recommendations Processing**
```python
🧠 Recommendations check: 92 evaluations
✅ User has 92 evaluations, checking for recommendations...
🔄 Refresh needed? true/false (evaluations % 5 == 0)
🔍 Looking for cached recommendations with key: recos_{user_id}
📦 Cache lookup completed in 0.15s, found: true/false
```

#### 5. **AI Generation (if needed)**
```python
🚀 Generating new AI recommendations...
🎯 Calling AI recommendations with {count} question type summaries
🤖 Starting AI recommendations API call...
📡 Calling OpenRouter API with model: openai/gpt-oss-120b
✅ OpenRouter API responded in 3.45s, status: 200
📝 AI response length: 1234 characters
✅ AI recommendations generated in 3.50s
```

#### 6. **Cache Save**
```python
💾 Caching AI recommendations...
🔄 Updating existing cache entry  // OR
➕ Creating new cache entry
✅ Cache saved in 0.12s
✅ Using newly generated recommendations (1234 chars)
```

#### 7. **Or Using Cache**
```python
♻️ Using cached recommendations (1234 chars)
```

#### 8. **Final Response**
```python
📊 ═══════════════════════════════════════════
✅ Analytics request COMPLETE for user: {user_id}
⏱️ Total duration: 4.23s
📦 Returning 92 evaluations + 1234 chars of recommendations
📊 ═══════════════════════════════════════════
```

## How to Debug

### Step 1: Open Browser Console
```
1. Navigate to Analytics page (/analytics)
2. Open Chrome DevTools (F12)
3. Go to Console tab
4. Filter for "[Analytics"
```

### Step 2: Monitor Backend Logs
```bash
cd /home/josh/Downloads/EEnglishGPT-main-main/backend
tail -f backend.log | grep -E "Analytics|Recommendations|evaluations"
```

### Step 3: Click "Generate AI Insights"
Watch both console and backend logs simultaneously.

### Expected Flow (First Time - No Cache)

**Frontend Console:**
```
🚀 [Analytics] Starting AI insights fetch for user: 639cd1d6-...
🔍 [Analytics Service] Starting getUserAnalytics for user: 639cd1d6-...
🔍 [Analytics Service] Full URL: /analytics/639cd1d6-...
📡 [Analytics Service] Making API request...
[... wait 3-5 seconds for AI ...]
✅ [Analytics Service] API request completed in 4523ms
📊 [Analytics] Response data: { hasRecommendations: true, ... }
✅ [Analytics] State updated successfully
```

**Backend Log:**
```
📊 ═══════════════════════════════════════════
📊 Analytics request START for user: 639cd1d6-...
🔍 Fetching user data...
✅ User found: unlimited
🔍 Fetching evaluations from Supabase...
✅ Retrieved 92 evaluations in 0.23s
🧠 Recommendations check: 92 evaluations
🔍 Looking for cached recommendations...
📦 Cache lookup completed in 0.15s, found: false
🚀 Generating new AI recommendations...
🤖 Starting AI recommendations API call...
📡 Calling OpenRouter API...
✅ OpenRouter API responded in 3.45s
✅ AI recommendations generated in 3.50s
💾 Caching AI recommendations...
✅ Cache saved in 0.12s
📊 ═══════════════════════════════════════════
✅ Analytics request COMPLETE
⏱️ Total duration: 4.23s
📊 ═══════════════════════════════════════════
```

### Expected Flow (Cached)

**Frontend Console:**
```
[Same as above but much faster]
✅ [Analytics Service] API request completed in 342ms  // Much faster!
```

**Backend Log:**
```
📊 Analytics request START...
✅ Retrieved 92 evaluations in 0.23s
🔍 Looking for cached recommendations...
📦 Cache lookup completed in 0.08s, found: true
♻️ Using cached recommendations (1234 chars)
⏱️ Total duration: 0.45s  // Much faster!
```

## Performance Benchmarks

### Acceptable Durations

**First Time (No Cache):**
- Evaluations fetch: < 1s
- Cache lookup: < 0.2s
- AI generation: 3-8s (normal for AI)
- Cache save: < 0.5s
- **Total: 4-10s** ✅ Acceptable

**Cached:**
- Evaluations fetch: < 1s
- Cache lookup: < 0.2s
- Cache retrieval: < 0.1s
- **Total: < 1.5s** ✅ Excellent

### Warning Signs

**Slow Evaluations (> 3s):**
- Check Supabase connection
- Check network latency
- Check evaluation count (too many?)

**Slow AI Generation (> 15s):**
- Check OpenRouter API status
- Check API key validity
- Check rate limits

**Slow Cache Operations (> 1s):**
- Check Supabase connection
- Check table indexes
- Check database performance

## Troubleshooting

### Problem: "No Analytics Data Yet"

**Check:**
1. Browser console: `🔍 Analytics Dashboard State`
   - Is `evaluationsLength` > 0?
   - Is `isLoadingEvaluations` false?
2. Backend log: Did evaluations fetch succeed?
3. App.js console: `✅ Evaluations loaded: X items`

**Solution:**
- If evaluations not loading: Check `/api/evaluations/user/{user_id}` endpoint
- If loading stuck: Check frontend `evaluationsLoading` state
- If null: Check App.js useEffect dependency array

### Problem: AI Insights Not Working

**Check:**
1. Click "Generate AI Insights" button
2. Frontend console: Does it say "Starting AI insights fetch"?
3. Frontend console: Any errors?
4. Backend log: Is analytics endpoint being called?
5. Backend log: Any recommendations errors?

**Common Issues:**
```
❌ OPENROUTER_GPT_OSS_120B_KEY not configured
→ Solution: Check backend/.env has OPENROUTER_GPT_OSS_120B_KEY

❌ User has only 4 evaluations, need 5+ for recommendations
→ Solution: Complete more assessments

❌ Cache lookup failed
→ Solution: Check Supabase permissions for assessment_meta table

❌ OpenRouter API timeout
→ Solution: Check API status, increase timeout
```

### Problem: Loading Takes Too Long

**Check Backend Log:**
```bash
tail -f backend/backend.log | grep "⏱️ Total duration"
```

**If > 10s:**
1. Check which step is slow:
   - Evaluations fetch?
   - AI generation?
   - Cache operations?
2. Check network connectivity
3. Check API rate limits
4. Consider increasing timeouts

## Testing Commands

### Test Analytics Endpoint Directly
```bash
# Check if endpoint works
curl -X GET "http://localhost:8000/api/analytics/639cd1d6-4d7e-44e4-aea5-9251c0061900" \
  -H "Authorization: Bearer YOUR_TOKEN" | jq '.'
```

### Test Evaluations Endpoint
```bash
curl -X GET "http://localhost:8000/api/evaluations/user/639cd1d6-4d7e-44e4-aea5-9251c0061900" \
  -H "Authorization: Bearer YOUR_TOKEN" | jq '.evaluations | length'
```

### Monitor Real-Time Logs
```bash
# Terminal 1: Backend logs
tail -f backend/backend.log

# Terminal 2: Filter for analytics only
tail -f backend/backend.log | grep "Analytics\|Recommendations"
```

## Performance Optimization

If analytics is consistently slow:

### 1. Database Optimization
- Add indexes to `assessment_evaluations` table:
  ```sql
  CREATE INDEX idx_user_timestamp ON assessment_evaluations(user_id, timestamp DESC);
  ```

### 2. Reduce AI Calls
- Increase cache validity (currently every 5 evaluations)
- Add manual refresh button only (already done!)

### 3. Lazy Load Evaluations
- Don't fetch all 92 at once
- Fetch summary first, details on demand

### 4. Add Loading Progress
- Show progress bar during AI generation
- Display "Analyzing X of Y question types..."

## Success Criteria

### Analytics Should:
✅ Load in < 2s when cached
✅ Generate AI insights in < 10s when not cached
✅ Show loading state while fetching
✅ Display error messages if something fails
✅ Cache recommendations properly
✅ Show accurate evaluation count

### Logs Should Show:
✅ Clear start/end boundaries
✅ Timing for each major step
✅ Success/error indicators
✅ Data sizes being processed

## Next Steps After Debugging

1. Review console logs for any errors
2. Check backend logs for performance bottlenecks
3. Verify evaluations are loading (count should be > 0)
4. Click "Generate AI Insights" and watch both logs
5. Report any errors found with specific log output

