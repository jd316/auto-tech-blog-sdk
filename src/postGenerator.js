import fs from 'fs/promises';
import path from 'path';
import { generateTopic, draftPost, createHeroImage, factCheck } from './gemini.js';
import { getSuggestedTopic } from './topicSources.js';
import {
  createSlug,
  getISTDate,
  calculateReadingTime,
  ensureDir,
  saveAndOptimizeImage,
  createPlaceholderImage,
  loadHistory,
  saveHistory,
  isDuplicateTitle,
} from './utils.js';
import { saveRSSFeed } from './rssGenerator.js';
import { saveSitemap } from './sitemapGenerator.js';

/**
 * Generate complete blog post with all assets
 * @param {Object} [options]
 * @param {string} [options.outputDir] - Base output directory
 * @param {string} [options.date] - Fixed date (YYYY-MM-DD)
 * @param {boolean} [options.skipDuplicateCheck] - Skip history check
 * @returns {Promise<Object>}
 */
export async function generateBlogPost(options = {}) {
  const {
    outputDir = process.cwd(),
    date = process.env.DATE && /^\d{4}-\d{2}-\d{2}$/.test(process.env.DATE)
      ? process.env.DATE
      : getISTDate(),
    skipDuplicateCheck = false,
  } = options;

  console.log('📝 Starting blog post generation...');

  // Load history for duplicate checking
  const historyPath = path.join(outputDir, '.blog-history.json');
  const history = skipDuplicateCheck ? [] : await loadHistory(historyPath);
  console.log(`🗂  Loaded ${history.length} history entries`);

  // Get topic from sources or generate one
  let topic = await getSuggestedTopic();
  if (!topic) {
    console.log('💡 Generating topic with AI...');
    topic = await generateTopic();
  }

  console.log(`💡 Topic: ${topic.title}`);

  // Check for duplicates
  if (!skipDuplicateCheck && isDuplicateTitle(topic.title, history)) {
    throw new Error(`Duplicate title detected: "${topic.title}"`);
  }

  // Draft the post
  console.log('✍️  Drafting post...');
  const draft = await draftPost({
    title: topic.title,
    description: topic.description,
    fullContent: topic.fullContent || '',
  });

  console.log(`✍️  Drafted post (${draft.length} characters)`);

  // Fact-check if we have source content
  if (topic.fullContent) {
    console.log('🔍 Fact-checking draft...');
    const factCheckResult = await factCheck({
      draft,
      context: topic.fullContent,
    });

    if (!factCheckResult.ok) {
      console.error('❌ Fact-check failed:');
      factCheckResult.issues.forEach(issue => console.error(`  • ${issue}`));
      throw new Error('Fact-check failed - aborting post generation');
    }
    console.log('✅ Fact-check passed');
  }

  // Create slug and folder structure
  const slug = createSlug(topic.title);
  const folderName = `${date}-${slug}`;
  const postDir = path.join(outputDir, 'posts', folderName);
  const assetsDir = path.join(outputDir, 'assets', 'images');

  await ensureDir(postDir);
  await ensureDir(assetsDir);

  // Generate hero image
  console.log('🖼  Generating hero image...');
  const imageFileName = `${folderName}.png`;
  const imagePath = path.join(assetsDir, imageFileName);

  try {
    const imageBuffer = await createHeroImage({ title: topic.title });

    if (imageBuffer.length > 100) { // Check if we got actual image data
      await saveAndOptimizeImage(imageBuffer, imagePath);
      console.log(`🖼  Saved hero image: ${imageFileName}`);
    } else {
      throw new Error('Generated image buffer too small');
    }
  } catch (error) {
    console.warn('⚠️  Hero image generation failed, creating placeholder');
    await createPlaceholderImage(imagePath);
  }

  // Calculate reading time
  const readingTime = calculateReadingTime(draft);

  // Create metadata
  const metadata = {
    title: topic.title,
    description: topic.description || `Exploring ${topic.title} and its implications for the tech industry.`,
    date,
    readingTime: `${readingTime} min read`,
    image: `/assets/images/${imageFileName}`,
    keywords: extractKeywords(topic.title + ' ' + draft),
    slug: folderName,
  };

  // Write metadata file
  await fs.writeFile(
    path.join(postDir, 'metadata.json'),
    JSON.stringify(metadata, null, 2),
  );

  // Write content file
  const content = `# ${topic.title}

${draft}`;

  await fs.writeFile(
    path.join(postDir, 'content.md'),
    content,
  );

  // Write index file for Next.js (if needed)
  const indexContent = `import fs from 'fs';
import path from 'path';
import { marked } from 'marked';
import { GetStaticProps } from 'next';

export default function BlogPost({ content, metadata }) {
  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <img 
        src={metadata.image} 
        alt={metadata.title}
        className="w-full h-64 object-cover rounded-lg mb-8"
      />
      <h1 className="text-4xl font-bold mb-4">{metadata.title}</h1>
      <p className="text-gray-600 mb-6">{metadata.description}</p>
      <div className="flex gap-4 text-sm text-gray-500 mb-8">
        <span>{metadata.date}</span>
        <span>{metadata.readingTime}</span>
      </div>
      <div 
        className="prose max-w-none"
        dangerouslySetInnerHTML={{ __html: content }}
      />
    </div>
  );
}

export const getStaticProps: GetStaticProps = async () => {
  const contentPath = path.join(process.cwd(), 'posts', '${folderName}', 'content.md');
  const metadataPath = path.join(process.cwd(), 'posts', '${folderName}', 'metadata.json');
  
  const contentFile = fs.readFileSync(contentPath, 'utf-8');
  const metadataFile = fs.readFileSync(metadataPath, 'utf-8');
  
  const content = marked(contentFile);
  const metadata = JSON.parse(metadataFile);
  
  return {
    props: {
      content,
      metadata,
    },
  };
};`;

  await fs.writeFile(
    path.join(postDir, 'index.tsx'),
    indexContent,
  );

  // Update history
  if (!skipDuplicateCheck) {
    const updatedHistory = [...history, topic.title];
    await saveHistory(historyPath, updatedHistory);
    console.log('📚 Updated history');
  }

  // Generate RSS and sitemap
  try {
    await saveRSSFeed({
      outputDir,
      siteUrl: options.siteUrl || 'https://example.com',
      title: options.siteTitle || 'Tech Blog',
      description: options.siteDescription || 'Latest tech news and insights',
    });
  } catch (error) {
    console.warn('⚠️  RSS generation failed:', error.message);
  }

  try {
    await saveSitemap({
      outputDir,
      siteUrl: options.siteUrl || 'https://example.com',
      staticPages: options.staticPages,
    });
  } catch (error) {
    console.warn('⚠️  Sitemap generation failed:', error.message);
  }

  console.log('✅ Blog post generation completed');

  return {
    folderName,
    metadata,
    imagePath,
    postDir,
  };
}

/**
 * Extract keywords from content for SEO
 * @param {string} content
 * @returns {string[]}
 */
function extractKeywords(content) {
  const commonWords = new Set([
    'the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by', 'is', 'are', 'was', 'were', 'be', 'been', 'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would', 'could', 'should', 'this', 'that', 'these', 'those',
  ]);

  const words = content
    .toLowerCase()
    .replace(/[^\w\s]/g, '')
    .split(/\s+/)
    .filter(word => word.length > 3 && !commonWords.has(word));

  // Count word frequency
  const wordCount = {};
  words.forEach(word => {
    wordCount[word] = (wordCount[word] || 0) + 1;
  });

  // Return top 10 most frequent words
  return Object.entries(wordCount)
    .sort(([,a], [,b]) => b - a)
    .slice(0, 10)
    .map(([word]) => word);
}
