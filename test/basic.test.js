// Basic smoke tests for auto-tech-blog-sdk

import { createSlug, getISTDate, calculateReadingTime, isDuplicateTitle } from '../src/utils.js';

describe('Basic functionality tests', () => {
  test('createSlug works correctly', () => {
    expect(createSlug('Hello World!')).toBe('hello-world');
    expect(createSlug('AI & Machine Learning')).toBe('ai-machine-learning');
  });

  test('getISTDate returns valid date format', () => {
    const date = getISTDate();
    expect(date).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  });

  test('calculateReadingTime works', () => {
    const text = 'word '.repeat(200); // 200 words
    expect(calculateReadingTime(text)).toBe(1);
  });

  test('isDuplicateTitle detects duplicates', () => {
    const history = ['Test Article', 'Another Article'];
    expect(isDuplicateTitle('Test Article', history)).toBe(true);
    expect(isDuplicateTitle('New Article', history)).toBe(false);
  });

  test('package exports are available', async () => {
    const module = await import('../index.js');
    expect(typeof module.createSlug).toBe('function');
    expect(typeof module.generateBlogPost).toBe('function');
    expect(typeof module.runOnce).toBe('function');
  });
});
