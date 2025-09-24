// Utility function to extract submarks from evaluation data
export const getSubmarks = (evaluation) => {
  if (!evaluation) return [];

  const metricsByType = {
    igcse_writers_effect: ['READING'],
    igcse_descriptive: ['CONTENT AND STRUCTURE', 'STYLE AND ACCURACY'],
    igcse_narrative: ['CONTENT AND STRUCTURE', 'STYLE AND ACCURACY'],
    igcse_summary: ['READING', 'WRITING'],
    igcse_directed: ['READING', 'WRITING'],
    alevel_directed: ['AO1', 'AO2'],
    alevel_directed_writing: ['AO1', 'AO2'],
    alevel_comparative: ['AO1', 'AO2'],  // Backend asks for AO2 in prompt, even though QUESTION_TOTALS says AO3
    alevel_text_analysis: ['AO1', 'AO3'],  // Backend stores AO1 in ao1_marks, AO3 in ao2_marks
    alevel_reflective_commentary: ['AO3'],  // Only AO3 marks out of 10
    alevel_language_change: ['AO2', 'AO4', 'AO5'],  // AO2 in ao2_marks, AO4 in ao1_marks, AO5 in reading_marks
    gp_essay: ['AO1', 'AO2', 'AO3'],  // GP essay has AO1, AO2, AO3
    sat_essay: ['READING', 'WRITING']
  };

  const questionType = evaluation.question_type;
  const metrics = metricsByType[questionType] || [];

  return metrics.map(metric => {
    let value = 'N/A';
    
    // Map metrics to the correct fields based on question type and backend storage
    if (metric === 'READING') {
      value = evaluation.reading_marks || 'N/A';
    } else if (metric === 'WRITING') {
      value = evaluation.writing_marks || 'N/A';
    } else if (metric === 'CONTENT AND STRUCTURE') {
      // For IGCSE descriptive/narrative, content/structure is in reading_marks
      value = evaluation.reading_marks || 'N/A';
    } else if (metric === 'STYLE AND ACCURACY') {
      // For IGCSE descriptive/narrative, style/accuracy is in writing_marks
      value = evaluation.writing_marks || 'N/A';
    } else if (metric === 'AO1') {
      // For most question types, AO1 is in ao1_marks
      // Note: alevel_comparative has a backend bug where AO3 overwrites AO1 in ao1_marks
      value = evaluation.ao1_marks || 'N/A';
    } else if (metric === 'AO2') {
      // AO2 is stored in ao2_marks field for gp_essay and other types
      value = evaluation.ao2_marks || 'N/A';
    } else if (metric === 'AO3') {
      // For gp_essay, AO3 is stored in ao3_marks field; for other types, it's in ao2_marks field
      if (questionType === 'gp_essay') {
        value = evaluation.ao3_marks || 'N/A';
      } else {
        value = evaluation.ao2_marks || 'N/A';
      }
    } else if (metric === 'AO4') {
      // For language_change, AO4 is stored in ao1_marks field
      value = evaluation.ao1_marks || 'N/A';
    } else if (metric === 'AO5') {
      // For language_change, AO5 is stored in reading_marks field
      value = evaluation.reading_marks || 'N/A';
    }
    
    // Clean the value to remove any malformed content
    if (value !== 'N/A') {
      // Remove any extra text like "AO3_MARKS:" that might be concatenated
      value = value.replace(/AO\d+_MARKS:\s*/g, '').replace(/\|/g, '').trim();
    }
    
    return {
      label: metric,
      value: value
    };
  }).filter(submark => submark.value !== 'N/A');
};

// Format submarks as strings for display in history components
export const getSubmarksAsStrings = (evaluation) => {
  const submarks = getSubmarks(evaluation);
  return submarks.map(submark => `${submark.label}: ${submark.value}`);
};