/**
 * Sentiment Analysis Service
 * Classifies text sentiment as positive, negative, or neutral
 * Enhanced with financial domain knowledge
 */

import Sentiment from 'sentiment';

const sentiment = new Sentiment();

// Financial sentiment patterns for domain-specific classification
const positivePatterns = [
  /\bbeat.*expectations?\b/i,
  /\bexceed.*expectations?\b/i,
  /\bstrong.*growth\b/i,
  /\bexcellent.*performance\b/i,
  /\boutstanding.*results?\b/i,
  /\bsignificant.*improvement\b/i,
  /\bprofit.*increase\b/i,
  /\bsurge\b/i,
  /\bsoar\b/i,
];

const negativePatterns = [
  /\bmiss.*expectations?\b/i,
  /\bsignificant.*decline\b/i,
  /\bpoor.*performance\b/i,
  /\bmajor.*losses?\b/i,
  /\bterrible.*results?\b/i,
  /\bloss.*report\b/i,
];

/**
 * Check if text matches financial sentiment patterns
 * @param {string} text - Text to check
 * @returns {number} Score adjustment (-1, 0, or 1)
 */
function getFinancialSentimentBoost(text) {
  const lowerText = text.toLowerCase();

  // Check positive patterns
  for (const pattern of positivePatterns) {
    if (pattern.test(lowerText)) {
      return 3; // Strong positive boost
    }
  }

  // Check negative patterns
  for (const pattern of negativePatterns) {
    if (pattern.test(lowerText)) {
      return -3; // Strong negative boost
    }
  }

  return 0; // No boost
}

/**
 * Classify text sentiment
 * @param {string} text - Text to analyze
 * @returns {string} 'positive', 'negative', or 'neutral'
 */
export function classifySentiment(text) {
  if (!text || typeof text !== 'string') {
    return 'neutral';
  }

  const result = sentiment.analyze(text);
  const financialBoost = getFinancialSentimentBoost(text);
  const finalScore = result.score + financialBoost;

  if (finalScore > 0) {
    return 'positive';
  } else if (finalScore < 0) {
    return 'negative';
  } else {
    return 'neutral';
  }
}

/**
 * Extract key facts and sentiment from text
 * @param {string} text - Source text
 * @returns {Object} { keyFacts: string[], sentiment: string }
 */
export function analyzeText(text) {
  if (!text) {
    return {
      keyFacts: ['No information available'],
      sentiment: 'neutral',
    };
  }

  // Extract key facts (simple extraction - split by sentences)
  const sentences = text
    .split(/[.!?]+/)
    .map((s) => s.trim())
    .filter((s) => s.length > 10 && s.length <= 500);

  const keyFacts = sentences.slice(0, 5); // Take up to 5 key facts

  if (keyFacts.length === 0) {
    keyFacts.push('Event information available');
  }

  // Classify sentiment
  const sentimentClass = classifySentiment(text);

  return {
    keyFacts,
    sentiment: sentimentClass,
  };
}
