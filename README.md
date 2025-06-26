# auto-tech-blog

[![npm version](https://badge.fury.io/js/auto-tech-blog.svg)](https://badge.fury.io/js/auto-tech-blog)
[![CI Status](https://github.com/jd316/auto-tech-blog/workflows/CI/badge.svg)](https://github.com/jd316/auto-tech-blog/actions)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Node.js Version](https://img.shields.io/node/v/auto-tech-blog.svg)](https://nodejs.org)
[![npm downloads](https://img.shields.io/npm/dm/auto-tech-blog.svg)](https://www.npmjs.com/package/auto-tech-blog)

Generate a fully-formed tech/AI blog post (markdown + hero image) with one command.

## Quick Start

```bash
# Install globally
npm install -g auto-tech-blog

# Or use directly with npx
npx auto-tech-blog
```

### Quick Setup

1. **Copy environment template:**

   ```bash
   cp .env.example .env
   ```

2. **Add your API key:**

   ```bash
   # Edit .env and add your Gemini API key
   GEMINI_API_KEY=your_actual_api_key_here
   ```

3. **Run the generator:**

   ```bash
   auto-tech-blog
   ```

> **Note:** The package automatically loads `.env` files using dotenv. No manual configuration needed!

### Environment Variables

```bash
# Required
export GEMINI_API_KEY="your-google-genai-key"

# Optional
export GUARDIAN_KEY="your-guardian-api-key"
export DATE="2025-01-15"  # Override auto-generated IST date
export DEBUG="1"          # Enable verbose error logging
```

### Environment Variable Details

| Variable | Required | Description | Example |
|----------|----------|-------------|---------|
| `GEMINI_API_KEY` | ✅ Yes | Google Gemini API key for AI generation | `AIza...` |
| `GUARDIAN_KEY` | ❌ Optional | Guardian API key for news sources | `test` |
| `DATE` | ❌ Optional | Fixed date override (YYYY-MM-DD format) | `2025-01-15` |
| `DEBUG` | ❌ Optional | Enable verbose error logging | `1` |

## What it does

The CLI will:

1. **Fetch Topics** - From Guardian API, Hacker News, and curated RSS feeds
2. **AI Generation** - Draft ~700-word posts using Google's Gemini AI
3. **Fact-checking** - Verify content against source articles
4. **Hero Images** - Generate 1920×1080 text-free images with Sharp optimization
5. **File Structure** - Create organized post folders with metadata
6. **RSS Feed** - Generate XML feed from all posts
7. **Sitemap** - Create SEO-optimized XML sitemap
8. **Compression Logging** - Track image optimization statistics

### Output Structure

``` text
posts/
  └── 2025-01-15-ai-breakthrough-in-robotics/
      ├── content.md
      ├── metadata.json
      └── index.tsx
assets/
  └── images/
      ├── 2025-01-15-ai-breakthrough-in-robotics.png
      └── .compression-log.json
rss.xml
sitemap.xml
.blog-history.json
```

## API Usage

### TypeScript Support

This package includes TypeScript definitions for a better development experience.

```ts
import { runOnce, generateBlogPost, BlogPostResult } from 'auto-tech-blog';
```

### JavaScript Usage

```js
import { runOnce, generateBlogPost } from 'auto-tech-blog';

// Simple usage with RSS/sitemap generation
// .env file is automatically loaded
const result = await runOnce({
  outputDir: './blog',
  siteUrl: 'https://myblog.com',
  siteTitle: 'My Tech Blog',
  siteDescription: 'Latest tech insights'
});

console.log(`Generated: ${result.folderName}`);

// Advanced usage with all options
const result = await generateBlogPost({
  outputDir: './my-blog',
  date: '2025-01-15',
  skipDuplicateCheck: false,
  siteUrl: 'https://example.com',
  staticPages: ['/', '/about', '/contact']
});
```

> **Tip:** Environment variables from `.env` files are automatically loaded. You can also set them manually: `process.env.GEMINI_API_KEY = 'your-key'`

### Available Functions

**Core Generation:**

- `runOnce(options)` - Generate a complete blog post with RSS/sitemap
- `generateBlogPost(options)` - Generate post without RSS/sitemap
- `generateTopic()` - Get AI-generated topic ideas
- `draftPost(params)` - Create post content from topic
- `createHeroImage(params)` - Generate and optimize hero images
- `getSuggestedTopic()` - Fetch topics from news sources
- `factCheck(params)` - Verify content accuracy

**Content Management:**

- `generateRSS(options)` - Create RSS feed XML
- `saveRSSFeed(options)` - Save RSS feed to file
- `generateSitemap(options)` - Create XML sitemap
- `saveSitemap(options)` - Save sitemap to file

**Utilities:**

- `createSlug(title)` - URL-friendly slug generation
- `getISTDate()` - IST timezone date handling
- `calculateReadingTime(content)` - Estimate reading time
- `saveAndOptimizeImage(buffer, path)` - Image optimization with logging
- `loadHistory()/saveHistory()` - Duplicate prevention
- `getCompressionStats()` - Image optimization statistics

## Configuration

### API Keys

1. **Gemini API** (Required)
   - Get from [Google AI Studio](https://aistudio.google.com/)
   - Set `GEMINI_API_KEY` environment variable

2. **Guardian API** (Optional)
   - Get from [Guardian Open Platform](https://open-platform.theguardian.com/)
   - Set `GUARDIAN_KEY` environment variable

### Options

```js
{
  outputDir: './blog',              // Output directory
  date: '2025-01-15',              // Fixed date (defaults to today IST)
  skipDuplicateCheck: false,       // Skip title duplication check
  siteUrl: 'https://example.com',  // Base URL for RSS/sitemap
  siteTitle: 'My Blog',            // Site title for RSS
  siteDescription: 'Blog desc',    // Site description for RSS
  staticPages: ['/about']          // Additional pages for sitemap
}
```

## Features

- ✅ Automated content generation with AI
- ✅ Real-time news source integration
- ✅ Fact-checking against source material
- ✅ Hero image generation with Gemini 2.0 Flash
- ✅ Sharp image optimization with compression logging
- ✅ SEO-optimized metadata and keywords
- ✅ Reading time calculation
- ✅ Duplicate prevention with history tracking
- ✅ RSS feed generation
- ✅ XML sitemap generation
- ✅ Next.js ready components
- ✅ IST timezone handling
- ✅ Comprehensive error handling
- ✅ Automatic .env file loading with dotenv

## Complete Feature Parity

This package includes **all features** from the original mazakiyaai-static project:

- **Daily automation workflow** - Complete post generation pipeline
- **Image compression** - Sharp optimization with detailed logging
- **RSS & Sitemap** - SEO-ready XML generation
- **Fact-checking** - AI-powered content verification
- **Multi-source news** - Guardian, Hacker News, RSS feeds
- **IST timezone** - Proper India Standard Time handling
- **History tracking** - Duplicate title prevention
- **Next.js integration** - Ready-to-use React components

## Requirements

- Node.js 18+
- Google Gemini API key

## Contributing

We welcome contributions! Please see our [Contributing Guide](CONTRIBUTING.md) for details.

### Quick Start for Contributors

```bash
# Clone and setup
git clone https://github.com/jd316/auto-tech-blog.git
cd auto-tech-blog
npm install
cp .env.example .env

# Run tests
npm test

# Run linting
npm run lint

# Test CLI locally
npm link
auto-tech-blog --help
```

## License

MIT - see LICENSE file for details
