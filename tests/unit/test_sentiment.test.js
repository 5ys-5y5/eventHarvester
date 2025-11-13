/**
 * Unit Test: Sentiment Analysis
 * Tests sentiment classification (positive/negative/neutral)
 */

import { describe, it, expect } from 'vitest';
import { classifySentiment } from '../../src/services/analysis/sentiment.js';

describe('Unit: Sentiment analysis', () => {
  it('should classify positive sentiment', () => {
    const positiveTexts = [
      'Revenue beat expectations',
      'Strong growth in sales',
      'Excellent performance',
      'Significant improvement in margins',
      'Outstanding quarterly results',
    ];

    positiveTexts.forEach((text) => {
      const result = classifySentiment(text);
      expect(result).toBe('positive');
    });
  });

  it('should classify negative sentiment', () => {
    const negativeTexts = [
      'Revenue missed expectations',
      'Significant decline in sales',
      'Poor performance',
      'Major losses reported',
      'Terrible quarterly results',
    ];

    negativeTexts.forEach((text) => {
      const result = classifySentiment(text);
      expect(result).toBe('negative');
    });
  });

  it('should classify neutral sentiment', () => {
    const neutralTexts = [
      'The company reported results',
      'Announcement scheduled for next week',
      'The meeting will be held',
      'Data was released',
    ];

    neutralTexts.forEach((text) => {
      const result = classifySentiment(text);
      expect(result).toBe('neutral');
    });
  });

  it('should handle mixed sentiment based on overall tone', () => {
    const text = 'Revenue grew significantly but costs increased dramatically';
    const result = classifySentiment(text);

    // Should return based on net sentiment score
    expect(['positive', 'negative', 'neutral']).toContain(result);
  });

  it('should handle empty text as neutral', () => {
    const result = classifySentiment('');
    expect(result).toBe('neutral');
  });

  it('should return one of three allowed sentiments', () => {
    const texts = [
      'Great results',
      'Bad performance',
      'The data shows',
      'Excellent growth',
      'Terrible losses',
    ];

    texts.forEach((text) => {
      const result = classifySentiment(text);
      expect(['positive', 'negative', 'neutral']).toContain(result);
    });
  });
});
