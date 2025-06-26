import fs from 'fs/promises';
import path from 'path';

/**
 * Load compression log
 * @param {string} logPath
 * @returns {Promise<Object>}
 */
export async function loadCompressionLog(logPath) {
  try {
    const content = await fs.readFile(logPath, 'utf-8');
    return JSON.parse(content);
  } catch {
    return {};
  }
}

/**
 * Save compression log
 * @param {string} logPath
 * @param {Object} log
 * @returns {Promise<void>}
 */
export async function saveCompressionLog(logPath, log) {
  await fs.writeFile(logPath, JSON.stringify(log, null, 2));
}

/**
 * Update compression log with image optimization results
 * @param {string} imagePath
 * @param {number} originalSize
 * @param {number} compressedSize
 * @param {string} logPath
 * @returns {Promise<void>}
 */
export async function updateCompressionLog(imagePath, originalSize, compressedSize, logPath) {
  const log = await loadCompressionLog(logPath);
  const filename = path.basename(imagePath);
  
  const savings = originalSize - compressedSize;
  const savingsPercent = originalSize > 0 ? (savings / originalSize * 100).toFixed(1) : 0;
  
  log[filename] = {
    originalSize,
    compressedSize,
    savings,
    savingsPercent: parseFloat(savingsPercent),
    lastModified: new Date().toISOString(),
  };
  
  await saveCompressionLog(logPath, log);
  
  if (savings > 0) {
    console.log(`🗜️  Compressed ${filename}: ${(originalSize/1024).toFixed(1)}KB → ${(compressedSize/1024).toFixed(1)}KB (${savingsPercent}% saved)`);
  }
}

/**
 * Get compression statistics
 * @param {string} logPath
 * @returns {Promise<Object>}
 */
export async function getCompressionStats(logPath) {
  const log = await loadCompressionLog(logPath);
  const entries = Object.values(log);
  
  if (entries.length === 0) {
    return {
      totalFiles: 0,
      totalOriginalSize: 0,
      totalCompressedSize: 0,
      totalSavings: 0,
      averageSavingsPercent: 0,
    };
  }
  
  const totalOriginalSize = entries.reduce((sum, entry) => sum + entry.originalSize, 0);
  const totalCompressedSize = entries.reduce((sum, entry) => sum + entry.compressedSize, 0);
  const totalSavings = totalOriginalSize - totalCompressedSize;
  const averageSavingsPercent = entries.reduce((sum, entry) => sum + entry.savingsPercent, 0) / entries.length;
  
  return {
    totalFiles: entries.length,
    totalOriginalSize,
    totalCompressedSize,
    totalSavings,
    averageSavingsPercent: parseFloat(averageSavingsPercent.toFixed(1)),
  };
} 