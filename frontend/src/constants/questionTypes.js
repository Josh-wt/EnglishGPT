export const QUESTION_TYPES = [
  {
    id: 'igcse_summary',
    name: 'Summary',
    category: 'IGCSE',
    description: 'Summarize the key points from a given text'
  },
  {
    id: 'igcse_narrative',
    name: 'Narrative',
    category: 'IGCSE',
    description: 'Create an engaging narrative story'
  },
  {
    id: 'igcse_descriptive',
    name: 'Descriptive',
    category: 'IGCSE',
    description: 'Write a vivid descriptive piece'
  },
  {
    id: 'igcse_writers_effect',
    name: "Writer's Effect",
    category: 'IGCSE',
    description: 'Analyze the writer\'s use of language and its effects'
  },
  {
    id: 'igcse_directed',
    name: 'Directed Writing',
    category: 'IGCSE',
    description: 'Transform text into specific formats for different audiences'
  },
  {
    id: 'igcse_extended_q3',
    name: 'Extended Writing Q3',
    category: 'IGCSE',
    description: 'Extended writing task with specific text type requirements'
  },
  {
    id: 'alevel_comparative',
    name: 'Comparative Analysis 1(b) (P1)',  
    category: 'A-Level English (9093)',
    description: 'Compare and analyze different texts'
  },
  {
    id: 'alevel_directed',
    name: 'Directed Writing 1(a) (P2)',
    category: 'A-Level English (9093)',
    description: 'Transform text into a specific format for audience'
  },
  {
    id: 'alevel_text_analysis',
    name: 'Text Analysis Q2 (P1)',
    category: 'A-Level English (9093)',
    description: 'Analyze form, structure, and language in texts'
  },
  {
    id: 'alevel_language_change',
    name: 'Language Change Analysis (P3, Section A)',
    category: 'A-Level English (9093)',
    description: 'Analyze historical prose extract demonstrating English language change using quantitative data'
  },
  {
    id: 'gp_essay',
    name: 'Essay (Paper 1)',
    category: 'English General Paper (8021)',
    description: 'Write a well-structured essay on a given topic with clear argumentation and evidence'
  },
  {
    id: 'gp_comprehension',
    name: 'Comprehension (Paper 2) Q1(a)',
    category: 'English General Paper (8021)',
    description: 'Answer comprehension questions based on given texts with analysis and evaluation'
  }
];

export const QUESTION_CATEGORIES = {
  IGCSE: 'IGCSE',
  A_LEVEL: 'A-Level',
  GP: 'English General Paper (8021)',
};

export default QUESTION_TYPES;
