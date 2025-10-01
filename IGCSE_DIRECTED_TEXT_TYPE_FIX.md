# IGCSE Directed Writing - Text Type Criteria Injection Fix

## Problem

When users selected the IGCSE Directed Writing question type and then chose a specific text type (letter, speech, or article), the AI prompt was only receiving the base `igcse_directed` marking criteria and NOT the text-type-specific criteria.

### Expected Behavior:
- User selects **Letter** → Inject `igcse_directed` + `igcse_directed_letter`
- User selects **Speech** → Inject `igcse_directed` + `igcse_directed_speech`
- User selects **Article** → Inject `igcse_directed` + `igcse_directed_article`

### Actual Behavior (Before Fix):
- User selects any text type → Only `igcse_directed` was injected
- Text-type-specific criteria was ignored

## Root Cause

The frontend was collecting the `text_type` from the user but **not passing it** to the backend evaluation endpoint.

### Where the Data Flow Broke:

1. ✅ **MarkingSchemeModal.js** (Line 99-100):
   ```javascript
   const data = {
     markingScheme: markingScheme.trim(),
     commandWord: questionType?.id === 'gp_essay' ? ... : null,
     textType: questionType?.id === 'igcse_directed' ? textType : null  // ✅ Collected
   };
   await onProceed(data);
   ```

2. ❌ **QuestionTypePage.js** `handleMarkingSchemeProceed` (Line 315-335):
   ```javascript
   // OLD CODE - BROKEN
   const markingScheme = typeof data === 'string' ? data : data.markingScheme;
   const commandWord = typeof data === 'object' ? data.commandWord : null;
   // ❌ textType was NOT extracted!
   
   const evaluationData = {
     question_type: selectedQuestionType.id,
     student_response: studentResponse,
     marking_scheme: markingScheme,
     command_word: commandWord,
     // ❌ text_type was NOT included!
     user_id: user?.id,
   };
   ```

3. ✅ **Backend Model** (Already supports it):
   ```python
   class SubmissionRequest(BaseModel):
       question_type: str
       student_response: str
       user_id: str
       marking_scheme: Optional[str] = None
       command_word: Optional[str] = None
       text_type: Optional[str] = None  # ✅ Already defined
   ```

4. ✅ **Backend Logic** (Already implemented):
   ```python
   if submission.question_type == 'igcse_directed' and submission.text_type:
       text_type_key = f"igcse_directed_{submission.text_type}"
       text_type_criteria = self.marking_criteria.get(text_type_key, "")
       if text_type_criteria:
           marking_criteria = f"{marking_criteria}\n\n{text_type_criteria}"
   ```

5. ✅ **Marking Criteria Dictionary** (All keys exist):
   ```python
   MARKING_CRITERIA = {
       "igcse_directed": "...",
       "igcse_directed_letter": "...",
       "igcse_directed_speech": "...",
       "igcse_directed_article": "..."
   }
   ```

## Solution

### Frontend Fix - `QuestionTypePage.js`

Added extraction and passing of `text_type`:

```javascript
// NEW CODE - FIXED
const markingScheme = typeof data === 'string' ? data : data.markingScheme;
const commandWord = typeof data === 'object' ? data.commandWord : null;
const textType = typeof data === 'object' ? data.textType : null;  // ✅ ADDED

console.log('🔍 DEBUG: handleMarkingSchemeProceed - Extracted values:', {
  markingScheme,
  commandWord,
  textType,  // ✅ ADDED to logging
  markingSchemeType: typeof markingScheme,
  commandWordType: typeof commandWord,
  textTypeType: typeof textType  // ✅ ADDED to logging
});

// Create evaluation data with marking scheme, command word, and text type
const evaluationData = {
  question_type: selectedQuestionType.id,
  student_response: studentResponse,
  marking_scheme: markingScheme,
  command_word: commandWord,
  text_type: textType,  // ✅ ADDED - This is the critical fix!
  user_id: user?.id,
};
```

### Backend Enhancement - `evaluation_service.py`

Added comprehensive logging to track text_type injection:

```python
# For IGCSE directed writing, combine general criteria with text-type-specific criteria
if submission.question_type == 'igcse_directed':
    logger.info(f"🎯 IGCSE Directed detected - text_type: {submission.text_type}")
    if submission.text_type:
        text_type_key = f"igcse_directed_{submission.text_type}"
        logger.info(f"🔍 Looking for text-type criteria with key: {text_type_key}")
        text_type_criteria = self.marking_criteria.get(text_type_key, "")
        if text_type_criteria:
            logger.info(f"✅ Text-type criteria found and added: {text_type_key}")
            logger.info(f"📏 Combined criteria length: {len(marking_criteria)} + {len(text_type_criteria)}")
            marking_criteria = f"{marking_criteria}\n\n{text_type_criteria}"
        else:
            logger.warning(f"⚠️ No text-type criteria found for key: {text_type_key}")
    else:
        logger.warning(f"⚠️ IGCSE Directed but no text_type provided!")
        logger.warning(f"⚠️ This means only base criteria will be used")
```

## Testing

### Test Case 1: Letter
```
User Flow:
1. Select "IGCSE Directed Writing"
2. Write essay response
3. Modal opens → Select "Letter" from dropdown
4. Enter marking scheme
5. Click Proceed

Expected Backend Log:
🎯 IGCSE Directed detected - text_type: letter
🔍 Looking for text-type criteria with key: igcse_directed_letter
✅ Text-type criteria found and added: igcse_directed_letter
📏 Combined criteria length: [base_length] + [letter_length]

Result: AI receives both base + letter criteria ✅
```

### Test Case 2: Speech
```
User Flow:
1. Select "IGCSE Directed Writing"
2. Write essay response
3. Modal opens → Select "Speech" from dropdown
4. Enter marking scheme
5. Click Proceed

Expected Backend Log:
🎯 IGCSE Directed detected - text_type: speech
🔍 Looking for text-type criteria with key: igcse_directed_speech
✅ Text-type criteria found and added: igcse_directed_speech
📏 Combined criteria length: [base_length] + [speech_length]

Result: AI receives both base + speech criteria ✅
```

### Test Case 3: Article
```
User Flow:
1. Select "IGCSE Directed Writing"
2. Write essay response
3. Modal opens → Select "Article" from dropdown
4. Enter marking scheme
5. Click Proceed

Expected Backend Log:
🎯 IGCSE Directed detected - text_type: article
🔍 Looking for text-type criteria with key: igcse_directed_article
✅ Text-type criteria found and added: igcse_directed_article
📏 Combined criteria length: [base_length] + [article_length]

Result: AI receives both base + article criteria ✅
```

### Test Case 4: No Text Type Selected (Edge Case)
```
User Flow:
1. Select "IGCSE Directed Writing"
2. Write essay response
3. Modal opens → DON'T select text type
4. Try to proceed

Result: Modal validation prevents proceeding ✅
Alert: "Please select a text type before proceeding."
```

## Verification

### Check Frontend Console
After submitting an IGCSE Directed essay with "Letter" selected:
```javascript
🔍 DEBUG: handleMarkingSchemeProceed - Extracted values:
{
  markingScheme: "...",
  commandWord: null,
  textType: "letter",  // ✅ Should show the selected type
  ...
}

🔍 DEBUG: handleMarkingSchemeProceed - Final evaluation data:
{
  evaluationData: {
    question_type: "igcse_directed",
    text_type: "letter",  // ✅ Should be included
    ...
  }
}
```

### Check Backend Logs
```bash
tail -f backend/backend.log
```

Should show:
```
🔧 Starting evaluation for submission:
🔧 Question Type: igcse_directed
🔧 Text Type: letter  # ✅ Should show the selected type
🔧 Command Word: None
...
📋 Base marking criteria loaded for: igcse_directed
🎯 IGCSE Directed detected - text_type: letter
🔍 Looking for text-type criteria with key: igcse_directed_letter
✅ Text-type criteria found and added: igcse_directed_letter
📏 Combined criteria length: 3942 + 1523 = 5465  # Example numbers
```

## Files Modified

### Frontend
- **`frontend/src/components/QuestionType/QuestionTypePage.js`**
  - Line 317: Added `textType` extraction
  - Line 334: Added `text_type` to evaluationData
  - Lines 322-326: Added `textType` to debug logging
  - Line 350: Added `textType` to debug output

### Backend
- **`backend/services/evaluation_service.py`**
  - Lines 131-146: Enhanced logging for IGCSE directed text type detection
  - Lines 617-622: Added detailed submission logging including text_type

## Impact

### Before Fix
- ❌ AI only received general IGCSE directed criteria
- ❌ No letter/speech/article-specific guidance
- ❌ Feedback wasn't tailored to format requirements
- ❌ Students didn't get format-specific improvement suggestions

### After Fix
- ✅ AI receives combined criteria (base + text-type-specific)
- ✅ Letter submissions get letter format requirements
- ✅ Speech submissions get speech format requirements
- ✅ Article submissions get article format requirements
- ✅ Feedback is now format-specific and accurate
- ✅ Students get targeted improvement suggestions for their chosen format

## Marking Criteria Details

### Base Criteria: `igcse_directed`
- Reading Assessment: 15 marks (R1, R2, R3, R5)
- Writing Assessment: 25 marks (W1, W2, W3, W4, W5)
- General task requirements
- Common examiner deductions

### Letter-Specific: `igcse_directed_letter`
- Purpose: Communication (formal/informal)
- Opening: Salutation matching relationship
- Tone/Register requirements
- Conventions: Sign-offs, paragraphing
- Example weak vs strong letters
- Common mistakes to avoid

### Speech-Specific: `igcse_directed_speech`
- Purpose: Inform, persuade, motivate
- Audience awareness: Direct address
- Opening: Attention-grabbing hooks
- Rhetorical devices and techniques
- Closing: Call to action
- Example marked speech

### Article-Specific: `igcse_directed_article`
- Purpose: Inform, entertain, persuade
- Title/Headline requirements
- Body structure and topic sentences
- Tone: Semi-formal, approachable
- Layout conventions
- Example high-scoring article

## Benefits

1. **Accurate Marking**: AI now has complete context for each format
2. **Better Feedback**: Format-specific improvement suggestions
3. **Student Learning**: Students understand format requirements better
4. **Fair Assessment**: Each format judged by its own standards
5. **Comprehensive Criteria**: Base + specific = complete evaluation framework

## Monitoring

To verify the fix is working in production:

1. **Check Frontend Console** for debug logs showing text_type
2. **Check Backend Logs** for criteria combination messages
3. **Review AI Feedback** to ensure it mentions format-specific issues
4. **Test Each Format**:
   - Submit a letter → Feedback should mention letter conventions
   - Submit a speech → Feedback should mention rhetorical devices
   - Submit an article → Feedback should mention headline/structure

## Related Files

- `frontend/src/components/modals/MarkingSchemeModal.js` - Collects text type
- `frontend/src/components/QuestionType/QuestionTypePage.js` - Passes text type (FIXED)
- `backend/models/evaluation.py` - Defines text_type field
- `backend/services/evaluation_service.py` - Combines criteria (Enhanced logging)
- `backend/schemas/marking_criteria.py` - Contains all criteria definitions

## Status

✅ **FIXED** - Text type is now properly passed from frontend to backend and the correct marking criteria are injected into the AI prompt for IGCSE directed writing assessments.

