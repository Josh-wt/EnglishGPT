import { marked } from 'marked';
import DOMPurify from 'dompurify';

class DocumentationService {
  constructor() {
    this.cache = new Map();
    // In development, files are served from public directory
    // In production, they're served from the root
    this.baseUrl = process.env.NODE_ENV === 'development' ? '' : (process.env.PUBLIC_URL || '');
    
    // Configure marked options
    marked.setOptions({
      breaks: true,
      gfm: true,
      headerIds: true,
      mangle: false,
    });
  }

  /**
   * Fetch markdown content from the docs directory
   * @param {string} pageName - The documentation page name
   * @returns {Promise<string>} - The parsed HTML content
   */
  async getDocumentationContent(pageName) {
    // Check cache first
    if (this.cache.has(pageName)) {
      return this.cache.get(pageName);
    }

    try {
      // Fetch the markdown file
      const url = `${this.baseUrl}/docs/${pageName}.md`;
      
      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: Documentation not found at ${url}`);
      }

      const markdownContent = await response.text();
      
      if (!markdownContent || markdownContent.trim().length === 0) {
        throw new Error(`Empty content received for ${pageName}`);
      }
      
      // Parse markdown to HTML
      const htmlContent = marked.parse(markdownContent);
      
      // Sanitize HTML to prevent XSS
      const sanitizedContent = DOMPurify.sanitize(htmlContent, {
        ALLOWED_TAGS: [
          'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
          'p', 'br', 'strong', 'em', 'u', 's', 'del',
          'ul', 'ol', 'li', 'blockquote', 'pre', 'code',
          'a', 'img', 'table', 'thead', 'tbody', 'tr', 'th', 'td',
          'div', 'span', 'hr'
        ],
        ALLOWED_ATTR: [
          'href', 'src', 'alt', 'title', 'class', 'id',
          'target', 'rel', 'data-*'
        ],
        ALLOW_DATA_ATTR: true
      });

      // Cache the result
      this.cache.set(pageName, sanitizedContent);
      
      return sanitizedContent;
    } catch (error) {
      console.error('Error loading documentation:', error);
      throw error; // Re-throw the error instead of returning fallback
    }
  }


  /**
   * Clear the documentation cache
   */
  clearCache() {
    this.cache.clear();
  }

  /**
   * Get all available documentation pages
   * @returns {Array} - Array of available documentation pages
   */
  getAvailablePages() {
    return [
      'getting-started',
      'question-types', 
      'analytics-guide',
      'pricing-plans',
      'tutorials',
      'community',
      'support'
    ];
  }

  /**
   * Check if a documentation page exists
   * @param {string} pageName - The documentation page name
   * @returns {Promise<boolean>} - Whether the page exists
   */
  async pageExists(pageName) {
    try {
      const response = await fetch(`${this.baseUrl}/docs/${pageName}.md`, { method: 'HEAD' });
      return response.ok;
    } catch (error) {
      return false;
    }
  }
}

// Create and export a singleton instance
const documentationService = new DocumentationService();
export default documentationService;
