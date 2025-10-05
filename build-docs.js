#!/usr/bin/env node

/**
 * Build script for documentation
 * This script ensures all documentation files are properly copied to the public directory
 * and validates that the documentation system is ready for production.
 */

const fs = require('fs');
const path = require('path');

const DOCS_SOURCE_DIR = path.join(__dirname, 'docs');
const DOCS_PUBLIC_DIR = path.join(__dirname, 'frontend', 'public', 'docs');

// Required documentation pages
const REQUIRED_PAGES = [
  'getting-started',
  'question-types',
  'analytics-guide',
  'pricing-plans',
  'tutorials',
  'community',
  'support',
  'index'
];

function ensureDirectoryExists(dirPath) {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
    console.log(`✅ Created directory: ${dirPath}`);
  }
}

function copyDocumentationFiles() {
  console.log('📚 Copying documentation files...');
  
  // Ensure public docs directory exists
  ensureDirectoryExists(DOCS_PUBLIC_DIR);
  
  // Copy all markdown files
  const files = fs.readdirSync(DOCS_SOURCE_DIR);
  const markdownFiles = files.filter(file => file.endsWith('.md'));
  
  let copiedCount = 0;
  markdownFiles.forEach(file => {
    const sourcePath = path.join(DOCS_SOURCE_DIR, file);
    const destPath = path.join(DOCS_PUBLIC_DIR, file);
    
    fs.copyFileSync(sourcePath, destPath);
    console.log(`✅ Copied: ${file}`);
    copiedCount++;
  });
  
  console.log(`📄 Copied ${copiedCount} documentation files`);
}

function validateDocumentationFiles() {
  console.log('🔍 Validating documentation files...');
  
  const missingFiles = [];
  const invalidFiles = [];
  
  REQUIRED_PAGES.forEach(page => {
    const filePath = path.join(DOCS_PUBLIC_DIR, `${page}.md`);
    
    if (!fs.existsSync(filePath)) {
      missingFiles.push(`${page}.md`);
    } else {
      // Check if file has content
      const content = fs.readFileSync(filePath, 'utf8');
      if (content.trim().length === 0) {
        invalidFiles.push(`${page}.md (empty file)`);
      }
    }
  });
  
  if (missingFiles.length > 0) {
    console.error('❌ Missing documentation files:');
    missingFiles.forEach(file => console.error(`   - ${file}`));
    process.exit(1);
  }
  
  if (invalidFiles.length > 0) {
    console.error('❌ Invalid documentation files:');
    invalidFiles.forEach(file => console.error(`   - ${file}`));
    process.exit(1);
  }
  
  console.log('✅ All documentation files are valid');
}

function generateDocumentationIndex() {
  console.log('📋 Generating documentation index...');
  
  const indexContent = {
    pages: REQUIRED_PAGES.map(page => ({
      id: page,
      title: page.split('-').map(word => 
        word.charAt(0).toUpperCase() + word.slice(1)
      ).join(' '),
      path: `/docs/${page}.md`
    })),
    lastUpdated: new Date().toISOString(),
    version: '1.0.0'
  };
  
  const indexPath = path.join(DOCS_PUBLIC_DIR, 'index.json');
  fs.writeFileSync(indexPath, JSON.stringify(indexContent, null, 2));
  console.log('✅ Generated documentation index');
}

function checkDependencies() {
  console.log('🔧 Checking dependencies...');
  
  const packageJsonPath = path.join(__dirname, 'frontend', 'package.json');
  const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
  
  const requiredDeps = ['marked', 'dompurify'];
  const missingDeps = requiredDeps.filter(dep => 
    !packageJson.dependencies[dep] && !packageJson.devDependencies[dep]
  );
  
  if (missingDeps.length > 0) {
    console.error('❌ Missing required dependencies:');
    missingDeps.forEach(dep => console.error(`   - ${dep}`));
    console.log('💡 Run: npm install marked dompurify');
    process.exit(1);
  }
  
  console.log('✅ All dependencies are installed');
}

function main() {
  console.log('🚀 Building documentation system...\n');
  
  try {
    checkDependencies();
    copyDocumentationFiles();
    validateDocumentationFiles();
    generateDocumentationIndex();
    
    console.log('\n🎉 Documentation build completed successfully!');
    console.log('\n📖 Documentation is now available at:');
    console.log('   - /docs (index)');
    REQUIRED_PAGES.forEach(page => {
      console.log(`   - /docs/${page}`);
    });
    
  } catch (error) {
    console.error('\n❌ Documentation build failed:', error.message);
    process.exit(1);
  }
}

// Run the build script
if (require.main === module) {
  main();
}

module.exports = {
  copyDocumentationFiles,
  validateDocumentationFiles,
  generateDocumentationIndex,
  checkDependencies
};
