import { WordBank } from '../src/WordBank';

describe('WordBank', () => {
  let wordBank: WordBank;

  beforeEach(() => {
    wordBank = new WordBank();
  });

  describe('getCategories', () => {
    it('should return an array of category names', () => {
      const categories = wordBank.getCategories();
      expect(Array.isArray(categories)).toBe(true);
      expect(categories.length).toBeGreaterThan(0);
    });

    it('should include all built-in categories', () => {
      const categories = wordBank.getCategories();
      expect(categories).toContain('animals');
      expect(categories).toContain('food');
      expect(categories).toContain('objects');
      expect(categories).toContain('places');
      expect(categories).toContain('actions');
    });
  });

  describe('getWordsByCategory', () => {
    it('should return words for a valid category', () => {
      const words = wordBank.getWordsByCategory('animals');
      expect(Array.isArray(words)).toBe(true);
      expect(words.length).toBeGreaterThan(0);
    });

    it('should return different words for different categories', () => {
      const animalsWords = wordBank.getWordsByCategory('animals');
      const foodWords = wordBank.getWordsByCategory('food');
      expect(animalsWords).not.toEqual(foodWords);
    });

    it('should throw an error for an invalid category', () => {
      expect(() => wordBank.getWordsByCategory('invalid-category')).toThrow();
    });

    it('should throw with descriptive message for invalid category', () => {
      expect(() => wordBank.getWordsByCategory('nonexistent')).toThrow(/category.*not found/i);
    });
  });

  describe('getRandomWord', () => {
    it('should return a word from the specified category', () => {
      const word = wordBank.getRandomWord('animals');
      const animalWords = wordBank.getWordsByCategory('animals');
      expect(typeof word).toBe('string');
      expect(animalWords).toContain(word);
    });

    it('should return different words on multiple calls', () => {
      const words = new Set<string>();
      for (let i = 0; i < 50; i++) {
        words.add(wordBank.getRandomWord('animals'));
      }
      expect(words.size).toBeGreaterThan(1);
    });

    it('should throw for an invalid category', () => {
      expect(() => wordBank.getRandomWord('invalid-category')).toThrow();
    });
  });

  describe('custom word override', () => {
    it('should support adding a custom category', () => {
      wordBank.addCategory('custom', ['custom1', 'custom2', 'custom3']);
      expect(wordBank.getCategories()).toContain('custom');
      expect(wordBank.getWordsByCategory('custom')).toEqual(['custom1', 'custom2', 'custom3']);
    });

    it('should allow getting random words from custom category', () => {
      const customWords = ['custom1', 'custom2', 'custom3'];
      wordBank.addCategory('custom', customWords);
      expect(customWords).toContain(wordBank.getRandomWord('custom'));
    });

    it('should override existing category', () => {
      const newWords = ['dog', 'cat', 'bird'];
      wordBank.addCategory('animals', newWords);
      expect(wordBank.getWordsByCategory('animals')).toEqual(newWords);
    });
  });

  describe('built-in category word counts', () => {
    const categories = ['animals', 'food', 'objects', 'places', 'actions'];
    categories.forEach(cat => {
      it(`should have at least 10 words in ${cat}`, () => {
        expect(wordBank.getWordsByCategory(cat).length).toBeGreaterThanOrEqual(10);
      });
    });
  });

  describe('word format validation', () => {
    it('should return non-empty strings for all words', () => {
      wordBank.getCategories().forEach(category => {
        wordBank.getWordsByCategory(category).forEach(word => {
          expect(typeof word).toBe('string');
          expect(word.length).toBeGreaterThan(0);
        });
      });
    });

    it('should not have duplicate words within a category', () => {
      wordBank.getCategories().forEach(category => {
        const words = wordBank.getWordsByCategory(category);
        expect(new Set(words).size).toBe(words.length);
      });
    });
  });
});
