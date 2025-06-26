#!/usr/bin/env node

// Simple smoke test for auto-tech-blog-sdk
import assert from 'assert';
import { createSlug, getISTDate, calculateReadingTime, isDuplicateTitle } from '../src/utils.js';

console.log('🧪 Running smoke tests...');

// Test createSlug
assert.strictEqual(createSlug('Hello World!'), 'hello-world');
assert.strictEqual(createSlug('AI & Machine Learning'), 'ai-machine-learning');
console.log('✓ createSlug works');

// Test getISTDate
const date = getISTDate();
assert.match(date, /^\d{4}-\d{2}-\d{2}$/);
console.log('✓ getISTDate works');

// Test calculateReadingTime
const text = 'word '.repeat(200); // 200 words
assert.strictEqual(calculateReadingTime(text), 1);
console.log('✓ calculateReadingTime works');

// Test isDuplicateTitle
const history = ['Test Article', 'Another Article'];
assert.strictEqual(isDuplicateTitle('Test Article', history), true);
assert.strictEqual(isDuplicateTitle('New Article', history), false);
console.log('✓ isDuplicateTitle works');

// Test package exports
try {
  const module = await import('../index.js');
  assert.strictEqual(typeof module.createSlug, 'function');
  assert.strictEqual(typeof module.generateBlogPost, 'function');
  assert.strictEqual(typeof module.runOnce, 'function');
  console.log('✓ Package exports available');
} catch (error) {
  console.error('✗ Package export test failed:', error.message);
  process.exit(1);
}

console.log('🎉 All smoke tests passed!');
