export const VALIDATION_RULES = {
  WORD_LIMITS: {
    IGCSE: 700,
    A_LEVEL: 1400,
  },
  MIN_WORD_COUNT: 50,
  MAX_WORD_COUNT: 2000,
  PROFANITY_THRESHOLD: 1,
  SPAM_THRESHOLD: 2,
  FILLER_WORD_THRESHOLD: 0,
  REPETITIVE_PATTERN_THRESHOLD: 0.3,
  UNIQUE_WORD_RATIO_THRESHOLD: 0.3,
};

export const TEST_WORDS = [
  'test', 'testing', 'sample', 'example', 'dummy', 'placeholder',
  'lorem', 'ipsum', 'dolor', 'sit', 'amet', 'consectetur',
  'adipiscing', 'elit', 'sed', 'do', 'eiusmod', 'tempor',
  'incididunt', 'ut', 'labore', 'et', 'dolore', 'magna',
  'aliqua', 'ut', 'enim', 'ad', 'minim', 'veniam',
  'quis', 'nostrud', 'exercitation', 'ullamco', 'laboris',
  'nisi', 'ut', 'aliquip', 'ex', 'ea', 'commodo',
  'consequat', 'duis', 'aute', 'irure', 'dolor', 'in',
  'reprehenderit', 'voluptate', 'velit', 'esse', 'cillum',
  'dolore', 'eu', 'fugiat', 'nulla', 'pariatur', 'excepteur',
  'sint', 'occaecat', 'cupidatat', 'non', 'proident', 'sunt',
  'culpa', 'qui', 'officia', 'deserunt', 'mollit', 'anim',
  'id', 'est', 'laborum'
];

export const FILLER_WORDS = [
  'um', 'uh', 'er', 'ah', 'like', 'you know', 'basically',
  'actually', 'literally', 'honestly', 'frankly', 'clearly',
  'obviously', 'simply', 'just', 'very', 'really', 'quite',
  'rather', 'somewhat', 'kind of', 'sort of', 'type of',
  'thing', 'stuff', 'things', 'stuff like that', 'and stuff',
  'or whatever', 'or something', 'or anything', 'or everything'
];

export default VALIDATION_RULES;
