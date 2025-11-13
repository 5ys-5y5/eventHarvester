/**
 * Configuration Parser
 * Parses Korean markdown configuration files with English technical terms
 * ⚠️ CRITICAL: Do NOT hard-code any values - parse dynamically as configuration changes frequently
 */

import { readFileSync } from 'fs';
import { marked } from 'marked';

/**
 * Parse docs/eventsByTypeList.md
 * Extracts Common and Unique event types across sectors
 * @param {string} filePath - Path to eventsByTypeList.md
 * @returns {Array} Array of event types with structure: { name, category, sector, description }
 */
export function parseEventsByTypeList(filePath) {
  try {
    const content = readFileSync(filePath, 'utf-8');
    const eventTypes = [];

    // Split by lines and process
    const lines = content.split('\n');
    let currentCategory = null;
    let currentSector = null;

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();

      // Detect category: ### A) Common or ### B) Unique
      if (line.includes('### A) Common')) {
        currentCategory = 'common';
        currentSector = null;
      } else if (line.includes('### B) Unique')) {
        currentCategory = 'unique';
      }

      // Detect sector headers (e.g., - **IT**, - **Comms**)
      const sectorMatch = line.match(/^-\s+\*\*(\w+)\*\*/);
      if (sectorMatch && currentCategory === 'unique') {
        currentSector = sectorMatch[1];
      }

      // Extract event types (lines starting with backtick codes)
      const eventMatch = line.match(/`([a-zA-Z]+)`/g);
      if (eventMatch && currentCategory) {
        eventMatch.forEach((match) => {
          const eventName = match.replace(/`/g, '');
          // Skip if it's a description keyword
          if (
            ![
              'surprise',
              'guideRev',
              'kpi',
              'fomc',
              'cpiJobs',
              'ismPmi',
              'gdp',
              'retailSales',
              'durablesHousing',
            ].includes(eventName)
          ) {
            // For common events, we need to extract the main event type
            if (currentCategory === 'common' && line.startsWith('- **')) {
              const mainTypeMatch = line.match(/^-\s+\*\*(\w+)\*\*/);
              if (mainTypeMatch) {
                const mainType = mainTypeMatch[1];
                if (!eventTypes.find((et) => et.name === mainType)) {
                  eventTypes.push({
                    name: mainType,
                    category: currentCategory,
                    sector: currentSector,
                    description: line.substring(line.indexOf('**') + mainType.length + 4),
                  });
                }
              }
            }

            // For unique events, extract from list items
            if (currentCategory === 'unique' && currentSector && line.includes(':')) {
              const description = line.substring(line.indexOf(':') + 1).trim();
              if (!eventTypes.find((et) => et.name === eventName)) {
                eventTypes.push({
                  name: eventName,
                  category: currentCategory,
                  sector: currentSector,
                  description: description || `${eventName} events`,
                });
              }
            }
          }
        });
      }
    }

    return eventTypes;
  } catch (error) {
    throw new Error(`Failed to parse eventsByTypeList.md: ${error.message}`);
  }
}

/**
 * Parse docs/sourceBookmarks.md
 * Extracts official government/institutional source URLs by category
 * @param {string} filePath - Path to sourceBookmarks.md
 * @returns {Array} Array of sources with structure: { name, url, category, reliability }
 */
export function parseSourceBookmarks(filePath) {
  try {
    const content = readFileSync(filePath, 'utf-8');
    const sources = [];

    const lines = content.split('\n');
    let currentCategory = null;

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();

      // Detect category headers (e.g., ### 공시/시장구조, ### 통화정책/매크로)
      if (line.startsWith('###')) {
        currentCategory = line.replace('###', '').trim();
      }

      // Extract source URLs (markdown links)
      const linkMatch = line.match(/\[([^\]]+)\]\(([^)]+)\)/);
      if (linkMatch && currentCategory) {
        const name = linkMatch[1];
        const url = linkMatch[2];

        sources.push({
          name,
          url,
          category: currentCategory,
          reliability: 5, // Assume max reliability for official sources
          eventTypes: [], // Will be populated based on category mapping
        });
      }
    }

    return sources;
  } catch (error) {
    throw new Error(`Failed to parse sourceBookmarks.md: ${error.message}`);
  }
}

/**
 * Parse docs/targetCriteria.md
 * Extracts US exchanges with MIC codes
 * @param {string} filePath - Path to targetCriteria.md
 * @returns {Array} Array of exchanges with structure: { mic, name }
 */
export function parseTargetCriteria(filePath) {
  try {
    const content = readFileSync(filePath, 'utf-8');
    const exchanges = [];

    const lines = content.split('\n');

    for (const line of lines) {
      // Match pattern: "    - Exchange Name (MIC)"
      const match = line.match(/\s+-\s+([^(]+)\(([A-Z]{4})\)/);
      if (match) {
        const name = match[1].trim();
        const mic = match[2].trim();

        exchanges.push({
          mic,
          name,
        });
      }
    }

    return exchanges;
  } catch (error) {
    throw new Error(`Failed to parse targetCriteria.md: ${error.message}`);
  }
}

/**
 * Load all configuration files
 * @param {string} docsPath - Path to docs/ folder (default: './docs')
 * @returns {Object} { eventTypes, sources, exchanges }
 */
export function loadConfiguration(docsPath = './docs') {
  const eventTypes = parseEventsByTypeList(`${docsPath}/eventsByTypeList.md`);
  const sources = parseSourceBookmarks(`${docsPath}/sourceBookmarks.md`);
  const exchanges = parseTargetCriteria(`${docsPath}/targetCriteria.md`);

  return {
    eventTypes,
    sources,
    exchanges,
  };
}
