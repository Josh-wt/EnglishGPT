# Analytics - Dynamic AI Insights Button Logic

## Overview

The AI Insights button now appears **dynamically** based on when the user last fetched insights, not on fixed intervals. This ensures insights are always fresh and relevant.

## How It Works

### Core Logic

The button appears **5 assessments after the last time the user fetched insights**.

```javascript
const shouldShowInsightsButton = useMemo(() => {
  const currentCount = evaluations?.length || 0;
  
  // Always require minimum of 5 assessments for first insights
  if (currentCount < 5) return false;
  
  // Show button if we haven't fetched yet
  if (!aiRecommendations || lastFetchedCount === 0) return true;
  
  // Show button if 5+ new assessments since last fetch
  const assessmentsSinceLastFetch = currentCount - lastFetchedCount;
  return assessmentsSinceLastFetch >= 5;
}, [evaluations?.length, lastFetchedCount, aiRecommendations]);
```

### Dynamic Behavior Examples

#### Example 1: Standard Usage
```
User completes 5 assessments → Button appears
User clicks at 5 → Insights generated, lastFetchedCount = 5
User completes 5 more (total: 10) → Button appears again
User clicks at 10 → Insights generated, lastFetchedCount = 10
User completes 5 more (total: 15) → Button appears again
```

#### Example 2: Late First Fetch (User's Scenario)
```
User completes 5 assessments → Button appears
User ignores, continues to 8 assessments → Button still shows
User clicks at 8 → Insights generated, lastFetchedCount = 8
Next button appears at: 8 + 5 = 13 ✓
```

#### Example 3: Skipping Multiple Opportunities
```
User fetches at 8 → lastFetchedCount = 8
Button appears at 13 → User ignores
Button still showing at 14, 15, 16, 17...
User finally clicks at 17 → lastFetchedCount = 17
Next button appears at: 17 + 5 = 22 ✓
```

#### Example 4: Power User
```
User fetches at 5 → lastFetchedCount = 5
User fetches at 10 → lastFetchedCount = 10
User fetches at 15 → lastFetchedCount = 15
User fetches at 20 → lastFetchedCount = 20
Pattern continues every 5 assessments from their last fetch
```

## Visual Indicators

### When Button is Available
Users see:
```
New Insights Available!

You've completed 5 new assessments since your last analysis (at 8). 
Generate fresh insights now!

[Total: 13 assessments | Last analyzed: 8]

[✨ Refresh AI Insights ✨]
```

### When Viewing Existing Insights
Users see:
```
✓ Your Personalized Study Plan
Based on 8 assessments • Next update at 13 (5 more needed)

[Insights content here...]
```

### When Button Becomes Available Again
The "Next update at X" message disappears and is replaced with the Refresh button:
```
✓ Your Personalized Study Plan
Based on 8 assessments

[🔄 Refresh Insights]

[Insights content here...]
```

## State Management

### Key State Variables

1. **`lastFetchedCount`**: Number of assessments when user last clicked fetch
   - Initialized to `0`
   - Updated to `evaluations.length` when user clicks button
   - Persists across sessions (stored in component state)

2. **`aiRecommendations`**: The actual AI-generated insights text
   - `null` when never fetched
   - Contains string when fetched
   - Updates on each fetch

3. **`shouldShowInsightsButton`**: Computed boolean
   - `true` when button should be visible
   - Based on comparison of current count vs. last fetch count

4. **`nextInsightCount`**: Computed number
   - Shows when next insights will be available
   - Always `lastFetchedCount + 5`
   - Used for "Next update at X" messaging

## Implementation Details

### Fetch Function

When user clicks the button:
```javascript
const fetchAIInsights = async () => {
  setLoadingRecommendations(true);
  const data = await getUserAnalytics(user.id);
  setAiRecommendations(data?.analytics?.recommendations);
  setLastFetchedCount(evaluations?.length || 0);  // ← Key: Save current count
  setLoadingRecommendations(false);
};
```

### Progress Indicator (< 5 Assessments)

For users with fewer than 5 assessments:
```jsx
<ChartBarIcon className="w-16 h-16 text-purple-500 mx-auto mb-6" />
<h4>Complete More Assessments</h4>
<p>AI insights become available after your 5th submission</p>

Progress: 3 / 5 assessments

[████████░░░░] 60%
```

## Benefits

### 1. **Truly Dynamic**
- Not tied to fixed milestones (5, 10, 15, 20...)
- Adapts to user's actual usage pattern
- Works no matter when they first fetch

### 2. **Always Fresh**
- Insights based on 5+ new assessments
- Meaningful updates, not arbitrary refreshes
- User decides when to update

### 3. **Clear Communication**
- Shows exact count of new assessments
- Displays when last analyzed
- Indicates when next update available

### 4. **Flexible**
- User can skip updates if they want
- No penalty for late fetching
- Button always available once threshold met

## Edge Cases Handled

### User Never Fetches
- Button appears at 5 assessments
- Stays visible at 6, 7, 8, 9, 10...
- Only disappears once they click it

### User Fetches Immediately at Each Milestone
- Works perfectly
- Follows regular 5-assessment intervals
- lastFetchedCount tracks actual fetches

### User Has Existing Insights from Different Session
- Component tracks lastFetchedCount
- Shows "Next update at X" correctly
- Button appears when threshold met

### User Has 100+ Assessments
- Logic scales perfectly
- If last fetch at 97, next at 102
- No maximum limit

## User Experience Flow

```
State 1: No Assessments (0-4)
├─ Show: Progress bar
└─ Action: Complete more assessments

State 2: Eligible for First Insights (≥5, never fetched)
├─ Show: "Get Your AI-Powered Insights" button
└─ Action: Click to generate

State 3: Insights Generated (< 5 new since last)
├─ Show: Insights with "Next update at X (Y more needed)"
└─ Action: Read insights, complete more assessments

State 4: New Insights Available (≥5 new since last)
├─ Show: Insights with "Refresh Insights" button
├─ Message: "X new assessments since last analysis (at Y)"
└─ Action: Click refresh button

[Cycle repeats between State 3 and State 4]
```

## Testing Scenarios

### Test Case 1: First Time User
1. Start with 0 assessments
2. Complete 5 → Button should appear
3. Click button → Insights generated, lastFetchedCount = 5
4. Complete 5 more (total 10) → Button should appear
5. ✓ Verify: "5 new assessments since last analysis (at 5)"

### Test Case 2: Late First Fetch
1. Complete 8 assessments → Button should appear
2. Click button → Insights generated, lastFetchedCount = 8
3. At 12 assessments → Button should NOT appear (need 1 more)
4. At 13 assessments → Button SHOULD appear
5. ✓ Verify: Next update shows "at 13"

### Test Case 3: Skipping Updates
1. Fetch at 8 → lastFetchedCount = 8
2. Skip button at 13
3. Skip button at 14, 15, 16
4. Fetch at 17 → lastFetchedCount = 17
5. Next button should appear at 22
6. ✓ Verify: "9 new assessments since last analysis (at 8)" before fetch
7. ✓ Verify: After fetch, "Next update at 22"

### Test Case 4: Power User
1. Fetch every time button appears
2. Verify regular intervals: 5, 10, 15, 20, 25...
3. ✓ Verify: lastFetchedCount always matches fetch point

## Technical Notes

- Uses `useMemo` for performance optimization
- State persists within session (not localStorage)
- Backend caches recommendations per user
- No hardcoded milestone arrays
- Fully reactive to state changes

## Future Enhancements

Potential improvements:
- Persist lastFetchedCount in localStorage
- Show total insights fetched over time
- Badge notification when new insights available
- Option to auto-refresh after X new assessments

