/**
 * Configuration File Watcher
 * Monitors and reloads configuration files every 5 minutes
 * ⚠️ CRITICAL: Ensures system always uses current configuration as files change frequently
 */

import { loadConfiguration } from './parser.js';

class ConfigurationWatcher {
  constructor(docsPath = './docs') {
    this.docsPath = docsPath;
    this.config = null;
    this.lastLoadTime = null;
    this.reloadInterval = 5 * 60 * 1000; // 5 minutes in milliseconds
    this.intervalId = null;
  }

  /**
   * Start watching configuration files
   */
  start() {
    // Load configuration immediately
    this.reload();

    // Set up periodic reload
    this.intervalId = setInterval(() => {
      this.reload();
    }, this.reloadInterval);

    console.log(
      `Configuration watcher started. Reloading every ${this.reloadInterval / 1000} seconds.`
    );
  }

  /**
   * Stop watching configuration files
   */
  stop() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
      console.log('Configuration watcher stopped.');
    }
  }

  /**
   * Reload configuration from files
   */
  reload() {
    try {
      const startTime = Date.now();
      this.config = loadConfiguration(this.docsPath);
      this.lastLoadTime = new Date();
      const duration = Date.now() - startTime;

      console.log(
        `Configuration reloaded successfully in ${duration}ms at ${this.lastLoadTime.toISOString()}`
      );
      console.log(
        `  - Event types: ${this.config.eventTypes.length} (Common: ${this.config.eventTypes.filter((et) => et.category === 'common').length}, Unique: ${this.config.eventTypes.filter((et) => et.category === 'unique').length})`
      );
      console.log(`  - Sources: ${this.config.sources.length}`);
      console.log(`  - Exchanges: ${this.config.exchanges.length}`);
    } catch (error) {
      console.error(`Failed to reload configuration: ${error.message}`);
      // Keep previous valid configuration if reload fails
      if (!this.config) {
        throw error; // If this is the first load, throw error
      }
    }
  }

  /**
   * Get current configuration
   * @returns {Object} { eventTypes, sources, exchanges }
   */
  getConfiguration() {
    if (!this.config) {
      throw new Error('Configuration not loaded. Call start() first.');
    }
    return this.config;
  }

  /**
   * Get configuration with TTL check
   * Reloads if configuration is older than TTL
   * @param {number} ttl - Time to live in milliseconds (default: 5 minutes)
   * @returns {Object} { eventTypes, sources, exchanges }
   */
  getConfigurationWithTTL(ttl = this.reloadInterval) {
    const now = Date.now();
    const age = this.lastLoadTime ? now - this.lastLoadTime.getTime() : Infinity;

    if (age > ttl) {
      console.log(`Configuration is older than TTL (${age}ms > ${ttl}ms). Reloading...`);
      this.reload();
    }

    return this.getConfiguration();
  }

  /**
   * Force immediate reload of configuration
   */
  forceReload() {
    console.log('Forcing configuration reload...');
    this.reload();
  }
}

// Singleton instance
let watcherInstance = null;

/**
 * Get the singleton configuration watcher instance
 * @param {string} docsPath - Path to docs/ folder
 * @returns {ConfigurationWatcher} Watcher instance
 */
export function getConfigurationWatcher(docsPath = './docs') {
  if (!watcherInstance) {
    watcherInstance = new ConfigurationWatcher(docsPath);
  }
  return watcherInstance;
}

export { ConfigurationWatcher };
