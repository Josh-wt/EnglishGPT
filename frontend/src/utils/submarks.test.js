import { getSubmarks, getSubmarksAsStrings } from './submarks';

describe('getSubmarks', () => {
  it('should extract IGCSE descriptive submarks correctly', () => {
    const evaluation = {
      question_type: 'igcse_descriptive',
      reading_marks: '12/16',
      writing_marks: '18/24'
    };
    
    const result = getSubmarks(evaluation);
    expect(result).toEqual([
      { label: 'CONTENT AND STRUCTURE', value: '12/16' },
      { label: 'STYLE AND ACCURACY', value: '18/24' }
    ]);
  });

  it('should extract IGCSE narrative submarks correctly', () => {
    const evaluation = {
      question_type: 'igcse_narrative',
      reading_marks: '14/16',
      writing_marks: '20/24'
    };
    
    const result = getSubmarks(evaluation);
    expect(result).toEqual([
      { label: 'CONTENT AND STRUCTURE', value: '14/16' },
      { label: 'STYLE AND ACCURACY', value: '20/24' }
    ]);
  });

  it('should extract A-Level directed submarks correctly', () => {
    const evaluation = {
      question_type: 'alevel_directed',
      ao1_marks: '4/5',
      ao2_marks: '3/5'
    };
    
    const result = getSubmarks(evaluation);
    expect(result).toEqual([
      { label: 'AO1', value: '4/5' },
      { label: 'AO2', value: '3/5' }
    ]);
  });

  it('should extract A-Level comparative submarks correctly', () => {
    const evaluation = {
      question_type: 'alevel_comparative',
      ao1_marks: '3/5',
      ao2_marks: '7/10'
    };
    
    const result = getSubmarks(evaluation);
    expect(result).toEqual([
      { label: 'AO1', value: '3/5' },
      { label: 'AO2', value: '7/10' }
    ]);
  });

  it('should extract A-Level text analysis submarks correctly', () => {
    const evaluation = {
      question_type: 'alevel_text_analysis',
      ao1_marks: '4/5',
      ao2_marks: '15/20'
    };
    
    const result = getSubmarks(evaluation);
    expect(result).toEqual([
      { label: 'AO1', value: '4/5' },
      { label: 'AO3', value: '15/20' }  // AO3 is stored in ao2_marks
    ]);
  });

  it('should extract A-Level language change submarks correctly', () => {
    const evaluation = {
      question_type: 'alevel_language_change',
      ao2_marks: '4/5',
      ao1_marks: '3/5',  // AO4 stored here
      reading_marks: '12/15'  // AO5 stored here
    };
    
    const result = getSubmarks(evaluation);
    expect(result).toEqual([
      { label: 'AO2', value: '4/5' },
      { label: 'AO4', value: '3/5' },
      { label: 'AO5', value: '12/15' }
    ]);
  });

  it('should filter out N/A values', () => {
    const evaluation = {
      question_type: 'igcse_writers_effect',
      reading_marks: '12/15'
    };
    
    const result = getSubmarks(evaluation);
    expect(result).toEqual([
      { label: 'READING', value: '12/15' }
    ]);
  });

  it('should return empty array for invalid evaluation', () => {
    expect(getSubmarks(null)).toEqual([]);
    expect(getSubmarks(undefined)).toEqual([]);
  });
});

describe('getSubmarksAsStrings', () => {
  it('should format submarks as strings', () => {
    const evaluation = {
      question_type: 'igcse_summary',
      reading_marks: '8/10',
      writing_marks: '4/5'
    };
    
    const result = getSubmarksAsStrings(evaluation);
    expect(result).toEqual([
      'READING: 8/10',
      'WRITING: 4/5'
    ]);
  });
});