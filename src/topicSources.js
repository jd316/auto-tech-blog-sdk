import Parser from 'rss-parser';
import { JSDOM } from 'jsdom';
import { Readability } from '@mozilla/readability';

const rssParser = new Parser({
  timeout: 10000,
  headers: {
    'User-Agent': 'Mozilla/5.0 (compatible; auto-tech-blog/1.0)',
  },
});

// Tech RSS feeds pool
const RSS_FEEDS = [
  'https://techcrunch.com/feed/',
  'https://www.theverge.com/rss/index.xml',
  'https://feeds.arstechnica.com/arstechnica/index',
  'https://www.wired.com/feed/rss',
  'https://venturebeat.com/feed/',
  'https://mashable.com/feeds/rss/all',
  'https://www.engadget.com/rss.xml',
];

// Tech keywords for filtering
const TECH_KEYWORDS = [
  'ai', 'artificial intelligence', 'machine learning', 'deep learning',
  'blockchain', 'cryptocurrency', 'bitcoin', 'ethereum', 'web3',
  'startup', 'funding', 'venture capital', 'ipo',
  'software', 'programming', 'developer', 'api',
  'cloud', 'aws', 'azure', 'google cloud',
  'mobile', 'app', 'ios', 'android',
  'data', 'analytics', 'big data',
  'cybersecurity', 'privacy', 'security',
  'iot', 'internet of things', 'smart',
  'robotics', 'automation', 'tech',
];

/**
 * Check if content is tech-related
 * @param {string} text
 * @returns {boolean}
 */
function isTechRelated(text) {
  const lowerText = text.toLowerCase();
  return TECH_KEYWORDS.some(keyword => lowerText.includes(keyword));
}

/**
 * Extract full article content using Readability
 * @param {string} url
 * @returns {Promise<string>}
 */
async function extractArticleContent(url) {
  try {
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; auto-tech-blog/1.0)',
      },
      timeout: 10000,
    });
    
    if (!response.ok) return '';
    
    const html = await response.text();
    const dom = new JSDOM(html, { url });
    const reader = new Readability(dom.window.document);
    const article = reader.parse();
    
    return article?.textContent || '';
  } catch (error) {
    console.warn(`Failed to extract content from ${url}:`, error.message);
    return '';
  }
}

/**
 * Fetch tech stories from Guardian API
 * @returns {Promise<Array>}
 */
async function fetchFromGuardian() {
  if (!process.env.GUARDIAN_KEY) return [];
  
  try {
    const url = `https://content.guardianapis.com/search?section=technology&page-size=10&api-key=${process.env.GUARDIAN_KEY}`;
    const response = await fetch(url);
    const data = await response.json();
    
    if (!data.response?.results) return [];
    
    return data.response.results.map(item => ({
      title: item.webTitle,
      description: item.fields?.trailText || '',
      url: item.webUrl,
      source: 'Guardian',
    }));
  } catch (error) {
    console.warn('Guardian API fetch failed:', error.message);
    return [];
  }
}

/**
 * Fetch tech stories from Hacker News
 * @returns {Promise<Array>}
 */
async function fetchFromHackerNews() {
  try {
    const topStoriesResponse = await fetch('https://hacker-news.firebaseio.com/v0/topstories.json');
    const topStoryIds = await topStoriesResponse.json();
    
    const stories = [];
    for (const id of topStoryIds.slice(0, 20)) {
      try {
        const itemResponse = await fetch(`https://hacker-news.firebaseio.com/v0/item/${id}.json`);
        const item = await itemResponse.json();
        
        if (item.url && isTechRelated(item.title)) {
          stories.push({
            title: item.title,
            description: '',
            url: item.url,
            source: 'Hacker News',
          });
        }
        
        if (stories.length >= 5) break;
      } catch (error) {
        continue;
      }
    }
    
    return stories;
  } catch (error) {
    console.warn('Hacker News fetch failed:', error.message);
    return [];
  }
}

/**
 * Fetch tech stories from RSS feeds
 * @returns {Promise<Array>}
 */
async function fetchFromRSS() {
  const shuffledFeeds = RSS_FEEDS.sort(() => Math.random() - 0.5);
  const selectedFeed = shuffledFeeds[0];
  
  try {
    const feed = await rssParser.parseURL(selectedFeed);
    const techItems = feed.items
      .filter(item => isTechRelated(item.title + ' ' + (item.contentSnippet || '')))
      .slice(0, 5);
    
    return techItems.map(item => ({
      title: item.title,
      description: item.contentSnippet || '',
      url: item.link,
      source: 'RSS',
    }));
  } catch (error) {
    console.warn(`RSS fetch failed for ${selectedFeed}:`, error.message);
    return [];
  }
}

/**
 * Get a suggested topic with full content for AI processing
 * @returns {Promise<Object|null>}
 */
export async function getSuggestedTopic() {
  console.log('🔍 Fetching topic suggestions...');
  
  // Fetch from all sources in parallel
  const [guardianStories, hnStories, rssStories] = await Promise.all([
    fetchFromGuardian(),
    fetchFromHackerNews(),
    fetchFromRSS(),
  ]);
  
  // Combine and shuffle all stories
  const allStories = [...guardianStories, ...hnStories, ...rssStories]
    .sort(() => Math.random() - 0.5);
  
  if (allStories.length === 0) {
    console.log('❌ No tech stories found from sources');
    return null;
  }
  
  // Try to get full content for the first few stories
  for (const story of allStories.slice(0, 3)) {
    console.log(`📄 Extracting content from: ${story.title}`);
    const fullContent = await extractArticleContent(story.url);
    
    if (fullContent && fullContent.length > 500) {
      console.log(`✅ Found suitable story from ${story.source}`);
      return {
        title: story.title,
        description: story.description,
        fullContent: fullContent.slice(0, 4000), // Limit content length
        source: story.source,
      };
    }
  }
  
  // Fallback to first story without full content
  const fallbackStory = allStories[0];
  console.log(`⚠️  Using fallback story: ${fallbackStory.title}`);
  
  return {
    title: fallbackStory.title,
    description: fallbackStory.description,
    fullContent: '',
    source: fallbackStory.source,
  };
} 