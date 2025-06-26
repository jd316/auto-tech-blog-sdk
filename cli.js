#!/usr/bin/env node
import 'dotenv/config';
import { runOnce } from './index.js';

// Check for help flag
if (process.argv.includes('--help') || process.argv.includes('-h')) {
  console.log(`
auto-tech-blog - Generate AI-powered tech blog posts

Usage:
  auto-tech-blog [options]

Options:
  --help, -h        Show this help message
  --version, -v     Show version number

Environment Variables:
  GEMINI_API_KEY    Required: Google Gemini API key
  GUARDIAN_KEY      Optional: Guardian API key for news sources
  DATE              Optional: Fixed date override (YYYY-MM-DD)
  DEBUG             Optional: Enable verbose error logging

Examples:
  auto-tech-blog
  GEMINI_API_KEY=your-key auto-tech-blog
  GEMINI_API_KEY=key DATE=2025-01-15 auto-tech-blog
`);
  process.exit(0);
}

// Check for version flag
if (process.argv.includes('--version') || process.argv.includes('-v')) {
  const { readFileSync } = await import('fs');
  const { fileURLToPath } = await import('url');
  const { dirname, join } = await import('path');

  const __filename = fileURLToPath(import.meta.url);
  const __dirname = dirname(__filename);
  const packagePath = join(__dirname, 'package.json');

  const pkg = JSON.parse(readFileSync(packagePath, 'utf-8'));
  console.log(pkg.version);
  process.exit(0);
}

// Check for required environment variables
if (!process.env.GEMINI_API_KEY) {
  console.error('❌ Error: GEMINI_API_KEY environment variable is required');
  console.error('Get your API key from: https://aistudio.google.com/');
  console.error('');
  console.error('Usage: GEMINI_API_KEY=your-key auto-tech-blog');
  process.exit(1);
}

console.log('🚀 Starting auto-tech-blog generation...');

runOnce()
  .then(({ folderName, metadata }) => {
    console.log('✅ Blog post generation completed!');
    console.log(`📁 Generated: ${folderName}`);
    console.log(`📝 Title: ${metadata.title}`);
    console.log(`⏱️  Reading time: ${metadata.readingTime}`);
  })
  .catch((err) => {
    console.error('❌ Error:', err.message);
    if (process.env.DEBUG) {
      console.error(err.stack);
    }
    process.exit(1);
  });
