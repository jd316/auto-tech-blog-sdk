import {
  createSlug,
  getISTDate,
  calculateReadingTime,
  isDuplicateTitle,
} from '../src/utils.js';

describe('Utility Functions', () => {
  describe('createSlug', () => {
    test('creates valid URL slug from title', () => {
      expect(createSlug('Hello World!')).toBe('hello-world');
      expect(createSlug('AI & Machine Learning')).toBe('ai-machine-learning');
      expect(createSlug('2024: The Year of AI')).toBe('2024-the-year-of-ai');
      expect(createSlug('  Multiple   Spaces  ')).toBe('multiple-spaces');
    });

    test('limits slug length to 100 characters', () => {
      const longTitle = 'a'.repeat(150);
      expect(createSlug(longTitle).length).toBeLessThanOrEqual(100);
    });
  });

  describe('getISTDate', () => {
    test('returns date in YYYY-MM-DD format', () => {
      const date = getISTDate();
      expect(date).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    });

    test('handles custom date input', () => {
      const customDate = new Date('2024-01-15T00:00:00Z');
      const result = getISTDate(customDate);
      expect(result).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    });
  });

  describe('calculateReadingTime', () => {
    test('calculates reading time correctly', () => {
      const shortText = 'word '.repeat(100); // 100 words
      expect(calculateReadingTime(shortText)).toBe(1);

      const mediumText = 'word '.repeat(400); // 400 words
      expect(calculateReadingTime(mediumText)).toBe(2);

      const longText = 'word '.repeat(1000); // 1000 words
      expect(calculateReadingTime(longText)).toBe(5);
    });

    test('removes markdown syntax before counting', () => {
      const markdown = '# Title\n\n**Bold** text with `code` and [link](url)';
      expect(calculateReadingTime(markdown)).toBe(1);
    });

    test('minimum reading time is 1 minute', () => {
      expect(calculateReadingTime('short')).toBe(1);
      expect(calculateReadingTime('')).toBe(1);
    });
  });

  describe('isDuplicateTitle', () => {
    const history = ['AI Revolution', 'Machine Learning Basics', 'Web3 Future'];

    test('detects duplicate titles', () => {
      expect(isDuplicateTitle('AI Revolution', history)).toBe(true);
      expect(isDuplicateTitle('ai revolution', history)).toBe(true); // case insensitive
      expect(isDuplicateTitle('  AI Revolution  ', history)).toBe(true); // with spaces
    });

    test('returns false for unique titles', () => {
      expect(isDuplicateTitle('Quantum Computing', history)).toBe(false);
      expect(isDuplicateTitle('AI Evolution', history)).toBe(false);
    });

    test('handles empty history', () => {
      expect(isDuplicateTitle('Any Title', [])).toBe(false);
    });
  });
});
