import fs from 'fs/promises';
import path from 'path';
import { Feed } from 'feed';

/**
 * Generate RSS feed from blog posts
 * @param {Object} options
 * @param {string} options.outputDir - Directory containing posts
 * @param {string} options.siteUrl - Base URL of the site
 * @param {string} options.title - Site title
 * @param {string} options.description - Site description
 * @returns {Promise<string>} RSS XML content
 */
export async function generateRSS(options = {}) {
  const {
    outputDir = process.cwd(),
    siteUrl = 'https://example.com',
    title = 'Tech Blog',
    description = 'Latest tech news and insights',
  } = options;

  const postsDir = path.join(outputDir, 'posts');

  try {
    const postFolders = await fs.readdir(postsDir);
    const posts = [];

    for (const folder of postFolders) {
      if (!/^\d{4}-\d{2}-\d{2}-/.test(folder)) continue;

      try {
        const metadataPath = path.join(postsDir, folder, 'metadata.json');
        const metadata = JSON.parse(await fs.readFile(metadataPath, 'utf-8'));

        const contentPath = path.join(postsDir, folder, 'content.md');
        const content = await fs.readFile(contentPath, 'utf-8');

        posts.push({
          ...metadata,
          content,
          url: `${siteUrl}/blog/${folder}`,
        });
      } catch (error) {
        console.warn(`Failed to load post ${folder}:`, error.message);
      }
    }

    // Sort by date descending
    posts.sort((a, b) => new Date(b.date) - new Date(a.date));

    const feed = new Feed({
      title,
      description,
      id: siteUrl,
      link: siteUrl,
      language: 'en',
      copyright: `© ${new Date().getFullYear()} ${title}`,
      updated: new Date(),
      feedLinks: {
        rss: `${siteUrl}/rss.xml`,
      },
    });

    posts.forEach(post => {
      feed.addItem({
        title: post.title,
        id: post.url,
        link: post.url,
        description: post.description,
        content: post.content.replace(/^# .*\n\n/, ''), // Remove title from content
        date: new Date(post.date),
        image: post.image ? `${siteUrl}${post.image}` : undefined,
      });
    });

    return feed.rss2();
  } catch (error) {
    console.error('RSS generation failed:', error);
    throw error;
  }
}

/**
 * Save RSS feed to file
 * @param {Object} options
 * @returns {Promise<void>}
 */
export async function saveRSSFeed(options = {}) {
  const {
    outputDir = process.cwd(),
    rssPath = 'rss.xml',
    ...rssOptions
  } = options;

  const rssContent = await generateRSS({ outputDir, ...rssOptions });
  const outputPath = path.join(outputDir, rssPath);

  await fs.writeFile(outputPath, rssContent);
  console.log(`✅ RSS feed generated at ${outputPath}`);
}
