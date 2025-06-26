# auto-tech-blog-sdk

[![npm version](https://badge.fury.io/js/auto-tech-blog-sdk.svg)](https://badge.fury.io/js/auto-tech-blog-sdk)
[![CI Status](https://github.com/jd316/auto-tech-blog-sdk/workflows/CI/badge.svg)](https://github.com/jd316/auto-tech-blog-sdk/actions)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Node.js Version](https://img.shields.io/node/v/auto-tech-blog-sdk.svg)](https://nodejs.org)
[![npm downloads](https://img.shields.io/npm/dm/auto-tech-blog-sdk.svg)](https://www.npmjs.com/package/auto-tech-blog-sdk)

## Project Overview

The `auto-tech-blog-sdk` is a powerful and versatile Node.js package designed to automate the generation of high-quality, AI-powered tech and AI blog posts. It serves as both a command-line interface (CLI) tool for quick post generation and a robust Software Development Kit (SDK) for programmatic integration into larger applications.

### Key Features and Capabilities

- **Automated Content Creation**: Seamlessly generates full blog posts, including content, hero images, RSS feeds, and sitemaps, all with a single command or API call.
- **Intelligent Topic Discovery**: Fetches trending tech topics from diverse sources like the Guardian API, Hacker News, and custom RSS feeds, ensuring your content is always relevant and timely.
- **Google Gemini Integration**: Leverages the advanced capabilities of Google's Gemini AI models for sophisticated blog post drafting, summarization, and content analysis.
- **Robust Fact-Checking**: Incorporates an AI-powered fact-checking mechanism to verify generated content against original source articles, ensuring accuracy and reliability.
- **Dynamic Hero Image Generation**: Automatically creates visually appealing, text-free hero images (1920x1080) for each blog post using Gemini 2.0 Flash, with built-in Sharp optimization for web-ready compression.
- **SEO Optimization**: Generates clean, search engine-friendly markdown content, along with automated RSS feed and XML sitemap creation for improved discoverability.
- **Flexible Output**: Organizes generated posts into a structured folder system, complete with markdown content, JSON metadata, and optimized image assets.
- **Developer-Friendly**: Offers a comprehensive SDK with TypeScript definitions for easy integration into Node.js projects, alongside a user-friendly CLI for direct use.

This project aims to streamline the content creation process for tech bloggers, marketers, and developers, enabling rapid publication of engaging and informative articles with minimal manual effort.

## Architecture

The `auto-tech-blog-sdk` is structured into several modular components, each responsible for a specific part of the blog generation pipeline. This design ensures maintainability, extensibility, and reusability.

```mermaid
graph TD
    A[CLI / SDK Entry Point] --> B{Choose Topic Source}
    B --> C{News APIs (Guardian)}
    B --> D{Hacker News}
    B --> E{Custom RSS Feeds}

    C --> F[Topic Suggestion]
    D --> F
    E --> F

    F --> G[Google Gemini AI]
    G --> H[Draft Blog Post]
    H --> I[Fact-Check Content]
    I -- OK --> J[Generate Hero Image]
    I -- Issues --> H

    J --> K[Image Optimization (Sharp)]
    K --> L[Save Post Assets]

    L --> M[Generate RSS Feed]
    L --> N[Generate Sitemap]

    M --> O[Save RSS Feed]
    N --> P[Save Sitemap]

    O --> Q[Completion]
    P --> Q

    subgraph Data Flow
        R[Environment Variables (.env)] -- provide API Keys --> G
        S[History Tracking (.blog-history.json)] -- prevent duplicates --> B
        T[Output Directory (posts/, assets/)] -- save content --> L
    end

    style A fill:#f9f,stroke:#333,stroke-width:2px
    style B fill:#bbf,stroke:#333,stroke-width:2px
    style C fill:#ccf,stroke:#333,stroke-width:2px
    style D fill:#ccf,stroke:#333,stroke-width:2px
    style E fill:#ccf,stroke:#333,stroke-width:2px
    style F fill:#9cf,stroke:#333,stroke-width:2px
    style G fill:#f9f,stroke:#333,stroke-width:2px
    style H fill:#bbf,stroke:#333,stroke-width:2px
    style I fill:#f9f,stroke:#333,stroke-width:2px
    style J fill:#bbf,stroke:#333,stroke-width:2px
    style K fill:#ccf,stroke:#333,stroke-width:2px
    style L fill:#9cf,stroke:#333,stroke-width:2px
    style M fill:#bbf,stroke:#333,stroke-width:2px
    style N fill:#bbf,stroke:#333,stroke-width:2px
    style O fill:#9cf,stroke:#333,stroke-width:2px
    style P fill:#9cf,stroke:#333,stroke-width:2px
    style Q fill:#f9f,stroke:#333,stroke-width:2px
```

### Core Modules

- `cli.js`: The main command-line interface entry point, responsible for parsing arguments and orchestrating the blog generation workflow.
- `index.js`: The primary SDK entry point, exposing the `runOnce` and `generateBlogPost` functions for programmatic use.
- `src/gemini.js`: Encapsulates all interactions with the Google Gemini API, including topic generation, post drafting, hero image creation, and fact-checking.
- `src/postGenerator.js`: Manages the end-to-end process of generating a single blog post, coordinating calls to Gemini and other utilities.
- `src/topicSources.js`: Handles fetching and curating tech topic ideas from various external APIs (Guardian, Hacker News) and RSS feeds.
- `src/rssGenerator.js`: Responsible for generating the RSS feed XML from all published blog posts.
- `src/sitemapGenerator.js`: Creates the SEO-optimized XML sitemap for the blog.
- `src/utils.js`: Contains various utility functions, including date handling, slug generation, reading time calculation, and image processing.
- `src/compressionLog.js`: Manages the logging of image compression statistics.

This modular design allows for clear separation of concerns, making it easier to maintain, debug, and extend the project with new features or integrations.

## Quick Start

```bash
# Install globally
npm install -g auto-tech-blog-sdk

# Or use directly with npx
npx auto-tech-blog-sdk
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
    auto-tech-blog-sdk
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
import { runOnce, generateBlogPost, BlogPostResult } from 'auto-tech-blog-sdk';
```

### JavaScript Usage

```js
import { runOnce, generateBlogPost } from 'auto-tech-blog-sdk';

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
