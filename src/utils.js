import fs from 'fs/promises';
import path from 'path';
import { format } from 'date-fns';
import sharp from 'sharp';
import { updateCompressionLog } from './compressionLog.js';

/**
 * Create a URL-friendly slug from title
 * @param {string} title
 * @returns {string}
 */
export function createSlug(title) {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 100);
}

/**
 * Generate IST date string
 * @param {Date} [date]
 * @returns {string}
 */
export function getISTDate(date = new Date()) {
  const istDate = new Date(date.getTime() + (5.5 * 60 * 60 * 1000));
  return format(istDate, 'yyyy-MM-dd');
}

/**
 * Estimate reading time from markdown content
 * @param {string} content
 * @returns {number}
 */
export function calculateReadingTime(content) {
  const wordsPerMinute = 200;
  const words = content
    .replace(/```[\s\S]*?```/g, '') // Remove code blocks
    .replace(/`[^`]+`/g, '') // Remove inline code
    .replace(/[#*_\[\]()]/g, '') // Remove markdown syntax
    .split(/\s+/)
    .filter(word => word.length > 0).length;
  
  return Math.max(1, Math.ceil(words / wordsPerMinute));
}

/**
 * Ensure directory exists
 * @param {string} dirPath
 */
export async function ensureDir(dirPath) {
  try {
    await fs.access(dirPath);
  } catch {
    await fs.mkdir(dirPath, { recursive: true });
  }
}

/**
 * Save and optimize image
 * @param {Buffer} imageBuffer
 * @param {string} outputPath
 * @param {Object} [options]
 * @returns {Promise<void>}
 */
export async function saveAndOptimizeImage(imageBuffer, outputPath, options = {}) {
  const {
    width = 1920,
    height = 1080,
    quality = 80,
    format = 'png',
    logCompression = true,
  } = options;

  await ensureDir(path.dirname(outputPath));

  const originalSize = imageBuffer.length;

  // Resize and optimize the image with sharp
  let pipeline = sharp(imageBuffer)
    .resize(width, height, { fit: 'cover', position: 'center' });

  if (format === 'jpeg' || format === 'jpg') {
    pipeline = pipeline.jpeg({ quality });
  } else {
    pipeline = pipeline.png({ quality });
  }

  const optimizedBuffer = await pipeline.toBuffer();
  await fs.writeFile(outputPath, optimizedBuffer);

  // Log compression if enabled
  if (logCompression) {
    const logPath = path.join(path.dirname(outputPath), '.compression-log.json');
    await updateCompressionLog(outputPath, originalSize, optimizedBuffer.length, logPath);
  }
}

/**
 * Create placeholder image if needed
 * @param {string} outputPath
 * @returns {Promise<void>}
 */
export async function createPlaceholderImage(outputPath) {
  await ensureDir(path.dirname(outputPath));

  // Create a simple gradient placeholder
  const placeholderSvg = `
    <svg width="1920" height="1080" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style="stop-color:#667eea;stop-opacity:1" />
          <stop offset="100%" style="stop-color:#764ba2;stop-opacity:1" />
        </linearGradient>
      </defs>
      <rect width="100%" height="100%" fill="url(#grad)" />
      <circle cx="960" cy="540" r="100" fill="rgba(255,255,255,0.1)" />
      <circle cx="1200" cy="300" r="60" fill="rgba(255,255,255,0.05)" />
      <circle cx="720" cy="780" r="80" fill="rgba(255,255,255,0.05)" />
    </svg>
  `;

  await sharp(Buffer.from(placeholderSvg))
    .png()
    .toFile(outputPath);
}

/**
 * Load and merge history files (for duplicate prevention)
 * @param {string} historyPath
 * @returns {Promise<string[]>}
 */
export async function loadHistory(historyPath) {
  try {
    const content = await fs.readFile(historyPath, 'utf-8');
    const data = JSON.parse(content);
    return Array.isArray(data) ? data : [];
  } catch {
    return [];
  }
}

/**
 * Save history file
 * @param {string} historyPath
 * @param {string[]} titles
 * @returns {Promise<void>}
 */
export async function saveHistory(historyPath, titles) {
  await ensureDir(path.dirname(historyPath));
  await fs.writeFile(historyPath, JSON.stringify(titles, null, 2));
}

/**
 * Check if title already exists in history
 * @param {string} title
 * @param {string[]} history
 * @returns {boolean}
 */
export function isDuplicateTitle(title, history) {
  const normalizedTitle = title.toLowerCase().trim();
  return history.some(prevTitle => 
    prevTitle.toLowerCase().trim() === normalizedTitle
  );
} 