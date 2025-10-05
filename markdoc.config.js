const { defineConfig } = require('@markdoc/markdoc');

module.exports = defineConfig({
  // Markdoc configuration for documentation generation
  tags: {
    // Custom tags can be defined here
  },
  nodes: {
    // Custom nodes can be defined here
  },
  functions: {
    // Custom functions can be defined here
  },
  variables: {
    // Global variables available in all documents
    site: {
      name: 'EnglishGPT',
      url: 'https://englishgpt.com',
      description: 'AI-powered English essay marking platform'
    }
  }
});
