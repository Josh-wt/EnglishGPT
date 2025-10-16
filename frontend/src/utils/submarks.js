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
    alevel_directed_writing: ['AO2'],  // Only AO2 out of 15
    alevel_comparative: ['AO1', 'AO3'],  // AO1 and AO3
    alevel_text_analysis: ['AO1', 'AO3'],  // AO1 and AO2
    alevel_reflective_commentary: ['AO3'],  // Only AO3 marks out of 10
    alevel_language_change: ['AO2', 'AO4', 'AO5'],  // AO2, AO4, AO5
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
      // AO3 is stored in ao3_marks field
      value = evaluation.ao3_marks || 'N/A';
    } else if (metric === 'AO4') {
      // AO4 is stored in ao4_marks field
      value = evaluation.ao4_marks || 'N/A';
    } else if (metric === 'AO5') {
      // AO5 is stored in ao5_marks field
      value = evaluation.ao5_marks || 'N/A';
    }
    
    // Clean the value to remove any malformed content
    if (value !== 'N/A') {
      value = value.replace(/\|/g, '').trim();
      
      // Fix for AO1 field containing AO3 data - extract only the AO1 part
      if (metric === 'AO1' && value.includes('AO3_MARKS:')) {
        value = value.split('AO3_MARKS:')[0].trim();
      }
      
      // Fix for AO3 field - extract AO3 marks if they're embedded in AO1 field
      if (metric === 'AO3' && evaluation.ao1_marks && evaluation.ao1_marks.includes('AO3_MARKS:')) {
        const ao3Match = evaluation.ao1_marks.match(/AO3_MARKS:\s*([^|]+)/);
        if (ao3Match) {
          value = ao3Match[1].trim();
          console.log('🔍 DEBUG UTILS - Extracted AO3 from AO1 field:', value);
        }
      }
      
      // Additional debug for AO3
      if (metric === 'AO3') {
        console.log('🔍 DEBUG UTILS - AO3 processing - metric:', metric, 'value:', value, 'ao3_marks:', evaluation.ao3_marks, 'ao1_marks:', evaluation.ao1_marks);
      }
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