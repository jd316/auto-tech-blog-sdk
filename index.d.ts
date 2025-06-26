/**
 * auto-tech-blog TypeScript definitions
 */

export interface TopicResult {
  title: string;
  description: string;
  fullContent?: string;
  source?: string;
}

export interface DraftPostParams {
  title: string;
  description: string;
  fullContent?: string;
}

export interface CreateHeroImageParams {
  title: string;
}

export interface FactCheckParams {
  draft: string;
  context: string;
}

export interface FactCheckResult {
  ok: boolean;
  issues: string[];
}

export interface GenerateBlogPostOptions {
  outputDir?: string;
  date?: string;
  skipDuplicateCheck?: boolean;
  siteUrl?: string;
  siteTitle?: string;
  siteDescription?: string;
  staticPages?: string[];
}

export interface BlogPostResult {
  folderName: string;
  metadata: BlogPostMetadata;
  imagePath: string;
  postDir: string;
}

export interface BlogPostMetadata {
  title: string;
  description: string;
  date: string;
  readingTime: string;
  image: string;
  keywords: string[];
  slug: string;
}

export interface RSSOptions {
  outputDir?: string;
  siteUrl?: string;
  title?: string;
  description?: string;
  rssPath?: string;
}

export interface SitemapOptions {
  outputDir?: string;
  siteUrl?: string;
  staticPages?: string[];
  sitemapPath?: string;
}

export interface CompressionLogEntry {
  originalSize: number;
  compressedSize: number;
  savings: number;
  savingsPercent: number;
  lastModified: string;
}

export interface CompressionStats {
  totalFiles: number;
  totalOriginalSize: number;
  totalCompressedSize: number;
  totalSavings: number;
  averageSavingsPercent: number;
}

export interface SaveImageOptions {
  width?: number;
  height?: number;
  quality?: number;
  format?: 'png' | 'jpeg' | 'jpg';
  logCompression?: boolean;
}

// AI functions
export function generateTopic(): Promise<TopicResult>;
export function draftPost(params: DraftPostParams): Promise<string>;
export function createHeroImage(params: CreateHeroImageParams): Promise<Buffer>;
export function factCheck(params: FactCheckParams): Promise<FactCheckResult>;

// Content sources
export function getSuggestedTopic(): Promise<TopicResult | null>;

// Main generation
export function generateBlogPost(options?: GenerateBlogPostOptions): Promise<BlogPostResult>;
export function runOnce(options?: GenerateBlogPostOptions): Promise<BlogPostResult>;

// RSS & Sitemap
export function generateRSS(options?: RSSOptions): Promise<string>;
export function saveRSSFeed(options?: RSSOptions): Promise<void>;
export function generateSitemap(options?: SitemapOptions): Promise<string>;
export function saveSitemap(options?: SitemapOptions): Promise<void>;

// Utilities
export function createSlug(title: string): string;
export function getISTDate(date?: Date): string;
export function calculateReadingTime(content: string): number;
export function saveAndOptimizeImage(imageBuffer: Buffer, outputPath: string, options?: SaveImageOptions): Promise<void>;
export function createPlaceholderImage(outputPath: string): Promise<void>;
export function loadHistory(historyPath: string): Promise<string[]>;
export function saveHistory(historyPath: string, titles: string[]): Promise<void>;
export function isDuplicateTitle(title: string, history: string[]): boolean;

// Compression logging
export function loadCompressionLog(logPath: string): Promise<Record<string, CompressionLogEntry>>;
export function saveCompressionLog(logPath: string, log: Record<string, CompressionLogEntry>): Promise<void>;
export function updateCompressionLog(imagePath: string, originalSize: number, compressedSize: number, logPath: string): Promise<void>;
export function getCompressionStats(logPath: string): Promise<CompressionStats>; 