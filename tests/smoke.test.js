import { runOnce, generateBlogPost } from '../index.js';

describe('Auto Tech Blog SDK Smoke Test', () => {
  test('should export runOnce function', () => {
    expect(typeof runOnce).toBe('function');
  });

  test('should export generateBlogPost function', () => {
    expect(typeof generateBlogPost).toBe('function');
  });
});
