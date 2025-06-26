import fs from 'fs/promises';
import path from 'path';

/**
 * Generate XML sitemap from blog posts
 * @param {Object} options
 * @param {string} options.outputDir - Directory containing posts
 * @param {string} options.siteUrl - Base URL of the site
 * @param {Array} [options.staticPages] - Array of static page paths
 * @returns {Promise<string>} Sitemap XML content
 */
export async function generateSitemap(options = {}) {
  const {
    outputDir = process.cwd(),
    siteUrl = 'https://example.com',
    staticPages = ['/', '/about', '/contact', '/services', '/portfolio'],
  } = options;

  const postsDir = path.join(outputDir, 'posts');
  const urls = [];

  // Add static pages
  staticPages.forEach(page => {
    urls.push({
      loc: `${siteUrl}${page}`,
      lastmod: new Date().toISOString().split('T')[0],
      changefreq: page === '/' ? 'daily' : 'monthly',
      priority: page === '/' ? '1.0' : '0.8',
    });
  });

  // Add blog index
  urls.push({
    loc: `${siteUrl}/blog`,
    lastmod: new Date().toISOString().split('T')[0],
    changefreq: 'daily',
    priority: '0.9',
  });

  try {
    const postFolders = await fs.readdir(postsDir);

    for (const folder of postFolders) {
      if (!/^\d{4}-\d{2}-\d{2}-/.test(folder)) continue;

      try {
        const metadataPath = path.join(postsDir, folder, 'metadata.json');
        const metadata = JSON.parse(await fs.readFile(metadataPath, 'utf-8'));

        urls.push({
          loc: `${siteUrl}/blog/${folder}`,
          lastmod: metadata.date,
          changefreq: 'weekly',
          priority: '0.7',
        });
      } catch (error) {
        console.warn(`Failed to load post metadata ${folder}:`, error.message);
      }
    }
  } catch (error) {
    console.warn('Failed to read posts directory:', error.message);
  }

  // Sort URLs by priority (descending) then by lastmod (descending)
  urls.sort((a, b) => {
    if (a.priority !== b.priority) {
      return parseFloat(b.priority) - parseFloat(a.priority);
    }
    return new Date(b.lastmod) - new Date(a.lastmod);
  });

  // Generate XML
  const urlElements = urls.map(url => `
  <url>
    <loc>${url.loc}</loc>
    <lastmod>${url.lastmod}</lastmod>
    <changefreq>${url.changefreq}</changefreq>
    <priority>${url.priority}</priority>
  </url>`).join('');

  const sitemapXml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${urlElements}
</urlset>`;

  return sitemapXml;
}

/**
 * Save sitemap to file
 * @param {Object} options
 * @returns {Promise<void>}
 */
export async function saveSitemap(options = {}) {
  const {
    outputDir = process.cwd(),
    sitemapPath = 'sitemap.xml',
    ...sitemapOptions
  } = options;

  const sitemapContent = await generateSitemap({ outputDir, ...sitemapOptions });
  const outputPath = path.join(outputDir, sitemapPath);

  await fs.writeFile(outputPath, sitemapContent);

  // Count URLs for logging
  const urlCount = (sitemapContent.match(/<url>/g) || []).length;
  console.log(`✅ Sitemap generated with ${urlCount} entries at ${outputPath}`);
}
