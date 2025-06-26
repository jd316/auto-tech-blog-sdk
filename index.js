import { generateTopic, draftPost, createHeroImage, factCheck } from './src/gemini.js';
import { getSuggestedTopic } from './src/topicSources.js';
import { generateBlogPost } from './src/postGenerator.js';
import { generateRSS, saveRSSFeed } from './src/rssGenerator.js';
import { generateSitemap, saveSitemap } from './src/sitemapGenerator.js';
import { 
  createSlug, 
  getISTDate, 
  calculateReadingTime, 
  saveAndOptimizeImage,
  createPlaceholderImage,
  loadHistory,
  saveHistory,
  isDuplicateTitle 
} from './src/utils.js';
import { 
  loadCompressionLog, 
  saveCompressionLog, 
  updateCompressionLog, 
  getCompressionStats 
} from './src/compressionLog.js';

export {
  // AI functions
  generateTopic,
  draftPost,
  createHeroImage,
  factCheck,
  
  // Content sources
  getSuggestedTopic,
  
  // Main generation
  generateBlogPost,
  
  // RSS & Sitemap
  generateRSS,
  saveRSSFeed,
  generateSitemap,
  saveSitemap,
  
  // Utilities
  createSlug,
  getISTDate,
  calculateReadingTime,
  saveAndOptimizeImage,
  createPlaceholderImage,
  loadHistory,
  saveHistory,
  isDuplicateTitle,
  
  // Compression logging
  loadCompressionLog,
  saveCompressionLog,
  updateCompressionLog,
  getCompressionStats,
};

/**
 * High-level convenience function – generates and scaffolds a post.
 * @param {Object} [opts]
 * @param {string} [opts.outputDir] - Output directory for generated files
 * @param {string} [opts.date] - Fixed yyyy-mm-dd (defaults to today IST)
 * @param {boolean} [opts.skipDuplicateCheck] - Skip duplicate title checking
 * @param {string} [opts.siteUrl] - Base URL for RSS/sitemap generation
 * @param {string} [opts.siteTitle] - Site title for RSS
 * @param {string} [opts.siteDescription] - Site description for RSS
 * @param {Array} [opts.staticPages] - Static pages for sitemap
 * @returns {Promise<Object>}
 */
export async function runOnce(opts = {}) {
  return await generateBlogPost(opts);
} 