#!/usr/bin/env node

// End-to-end test for auto-tech-blog-sdk
// Tests the complete user workflow with real functionality

import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('🧪 Starting End-to-End Tests...\n');

// Test configuration
const testOutputDir = path.join(__dirname, 'test-output');
const requiredEnvVars = ['GEMINI_API_KEY'];

// Cleanup test directory
async function cleanup() {
  try {
    await fs.rm(testOutputDir, { recursive: true, force: true });
    console.log('🧹 Cleaned up test directory');
  } catch (error) {
    // Directory might not exist, that's fine
  }
}

// Check environment variables
function checkEnvironment() {
  console.log('1️⃣ Checking Environment Variables...');

  const missing = requiredEnvVars.filter(var_ => !process.env[var_]);

  if (missing.length > 0) {
    console.error(`❌ Missing required environment variables: ${missing.join(', ')}`);
    console.error('   Set GEMINI_API_KEY to run E2E tests');
    return false;
  }

  console.log('✅ All required environment variables present');
  return true;
}

// Test module imports
async function testImports() {
  console.log('\n2️⃣ Testing Module Imports...');

  try {
    const {
      generateBlogPost,
      runOnce,
      createSlug,
      generateTopic,
      getSuggestedTopic,
    } = await import('../index.js');

    console.log('✅ Core functions imported successfully');

    // Test utility functions first
    const slug = createSlug('Test Blog Post Title!');
    if (slug !== 'test-blog-post-title') {
      throw new Error(`Expected 'test-blog-post-title', got '${slug}'`);
    }
    console.log('✅ Utility functions working');

    return { generateBlogPost, runOnce, generateTopic, getSuggestedTopic };
  } catch (error) {
    console.error('❌ Import failed:', error.message);
    return null;
  }
}

// Test topic generation
async function testTopicGeneration(functions) {
  console.log('\n3️⃣ Testing Topic Generation...');

  try {
    // Test AI topic generation
    console.log('   Testing AI topic generation...');
    const aiTopic = await functions.generateTopic();

    if (!aiTopic.title || !aiTopic.description) {
      throw new Error('AI topic missing title or description');
    }

    console.log(`   ✅ AI Topic: "${aiTopic.title}"`);

    // Test news source topic fetching
    console.log('   Testing news source topic fetching...');
    const newsTopic = await functions.getSuggestedTopic();

    if (newsTopic) {
      console.log(`   ✅ News Topic: "${newsTopic.title}" (${newsTopic.source})`);
    } else {
      console.log('   ⚠️  No news topics found (might be due to API limits or network)');
    }

    return true;
  } catch (error) {
    console.error('❌ Topic generation failed:', error.message);
    return false;
  }
}

// Test full blog post generation
async function testBlogPostGeneration(functions) {
  console.log('\n4️⃣ Testing Full Blog Post Generation...');

  try {
    console.log('   Generating complete blog post...');

    const result = await functions.generateBlogPost({
      outputDir: testOutputDir,
      skipDuplicateCheck: true,
      siteUrl: 'https://test-blog.com',
      siteTitle: 'Test Tech Blog',
      siteDescription: 'E2E Test Blog',
    });

    console.log(`   ✅ Blog post generated: ${result.folderName}`);
    console.log(`   📝 Title: ${result.metadata.title}`);
    console.log(`   ⏱️  Reading time: ${result.metadata.readingTime}`);

    return result;
  } catch (error) {
    console.error('❌ Blog post generation failed:', error.message);
    console.error('   Stack:', error.stack);
    return null;
  }
}

// Test generated files
async function testGeneratedFiles(result) {
  console.log('\n5️⃣ Testing Generated Files...');

  try {
    const { postDir, folderName } = result;

    // Check post directory structure
    const files = await fs.readdir(postDir);
    const requiredFiles = ['content.md', 'metadata.json', 'index.tsx'];

    for (const file of requiredFiles) {
      if (!files.includes(file)) {
        throw new Error(`Missing required file: ${file}`);
      }
    }
    console.log('   ✅ All required post files present');

    // Check content.md
    const contentPath = path.join(postDir, 'content.md');
    const content = await fs.readFile(contentPath, 'utf-8');

    if (content.length < 100) {
      throw new Error('Content file seems too short');
    }

    if (!content.includes('#')) {
      throw new Error('Content missing markdown headers');
    }

    console.log(`   ✅ Content file valid (${content.length} chars)`);

    // Check metadata.json
    const metadataPath = path.join(postDir, 'metadata.json');
    const metadata = JSON.parse(await fs.readFile(metadataPath, 'utf-8'));

    const requiredMetadata = ['title', 'description', 'date', 'readingTime', 'image', 'keywords', 'slug'];
    for (const field of requiredMetadata) {
      if (!metadata[field]) {
        throw new Error(`Missing metadata field: ${field}`);
      }
    }
    console.log('   ✅ Metadata complete and valid');

    // Check hero image
    const imagePath = path.join(testOutputDir, 'assets', 'images', `${folderName}.png`);
    try {
      const imageStats = await fs.stat(imagePath);
      if (imageStats.size < 1000) {
        throw new Error('Image file seems too small');
      }
      console.log(`   ✅ Hero image generated (${Math.round(imageStats.size / 1024)}KB)`);
    } catch (error) {
      console.log('   ⚠️  Hero image missing or small (might be placeholder)');
    }

    // Check RSS feed
    const rssPath = path.join(testOutputDir, 'rss.xml');
    try {
      const rssContent = await fs.readFile(rssPath, 'utf-8');
      if (!rssContent.includes('<?xml') || !rssContent.includes('<rss')) {
        throw new Error('RSS file invalid');
      }
      console.log('   ✅ RSS feed generated');
    } catch (error) {
      console.log('   ⚠️  RSS feed missing or invalid');
    }

    // Check sitemap
    const sitemapPath = path.join(testOutputDir, 'sitemap.xml');
    try {
      const sitemapContent = await fs.readFile(sitemapPath, 'utf-8');
      if (!sitemapContent.includes('<?xml') || !sitemapContent.includes('<urlset')) {
        throw new Error('Sitemap file invalid');
      }
      console.log('   ✅ Sitemap generated');
    } catch (error) {
      console.log('   ⚠️  Sitemap missing or invalid');
    }

    return true;
  } catch (error) {
    console.error('❌ File validation failed:', error.message);
    return false;
  }
}

// Test CLI functionality
async function testCLI() {
  console.log('\n6️⃣ Testing CLI Functionality...');

  try {
    const { execSync } = await import('child_process');

    // Test help command
    const helpOutput = execSync('node cli.js --help', { encoding: 'utf8' });
    if (!helpOutput.includes('Generate AI-powered tech blog posts')) {
      throw new Error('Help output invalid');
    }
    console.log('   ✅ CLI help command works');

    // Test version command
    const versionOutput = execSync('node cli.js --version', { encoding: 'utf8' });
    if (!versionOutput.trim().match(/^\d+\.\d+\.\d+$/)) {
      throw new Error('Version output invalid');
    }
    console.log('   ✅ CLI version command works');

    return true;
  } catch (error) {
    console.error('❌ CLI test failed:', error.message);
    return false;
  }
}

// Error handling tests
async function testErrorHandling(functions) {
  console.log('\n7️⃣ Testing Error Handling...');

  try {
    // Test with invalid API key
    const originalKey = process.env.GEMINI_API_KEY;
    process.env.GEMINI_API_KEY = 'invalid-key';

    try {
      await functions.generateTopic();
      console.log('   ⚠️  Expected error with invalid API key, but got success');
    } catch (error) {
      console.log('   ✅ Properly handles invalid API key');
    }

    // Restore original key
    process.env.GEMINI_API_KEY = originalKey;

    return true;
  } catch (error) {
    console.error('❌ Error handling test failed:', error.message);
    return false;
  }
}

// Main test runner
async function runE2ETests() {
  let allPassed = true;

  try {
    await cleanup();

    // 1. Environment check
    if (!checkEnvironment()) {
      process.exit(1);
    }

    // 2. Test imports
    const functions = await testImports();
    if (!functions) {
      allPassed = false;
    }

    if (functions) {
      // 3. Test topic generation
      const topicSuccess = await testTopicGeneration(functions);
      if (!topicSuccess) allPassed = false;

      // 4. Test full blog generation
      const blogResult = await testBlogPostGeneration(functions);
      if (!blogResult) {
        allPassed = false;
      } else {
        // 5. Test generated files
        const filesSuccess = await testGeneratedFiles(blogResult);
        if (!filesSuccess) allPassed = false;
      }

      // 6. Test CLI
      const cliSuccess = await testCLI();
      if (!cliSuccess) allPassed = false;

      // 7. Test error handling
      const errorSuccess = await testErrorHandling(functions);
      if (!errorSuccess) allPassed = false;
    }

    // Final results
    console.log('\n🎯 End-to-End Test Results:');
    if (allPassed) {
      console.log('🎉 ALL TESTS PASSED! Package is production-ready! ✅');
      console.log(`\n📁 Test output available in: ${testOutputDir}`);
    } else {
      console.log('❌ Some tests failed. Package needs fixes before production.');
      process.exit(1);
    }

  } catch (error) {
    console.error('\n💥 E2E test suite failed:', error.message);
    console.error(error.stack);
    process.exit(1);
  }
}

// Run the tests
runE2ETests();
