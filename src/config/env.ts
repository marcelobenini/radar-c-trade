/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * Environment configuration and global parameters
 */
export const ENV_CONFIG = {
  // Mode of application
  IS_PRODUCTION: import.meta.env.PROD,
  IS_DEVELOPMENT: import.meta.env.DEV,

  // API Endpoints
  API_BASE_URL: '/api',
  GEMINI_ENDPOINTS: {
    TEST_CONNECTION: '/api/gemini/test-connection',
    ANALYZE_MENU: '/api/gemini/analyze-menu',
  },

  // Feature Flags for modular rollouts
  FEATURE_FLAGS: {
    ENABLE_REAL_TIME_NOTIFICATIONS: false,
    ENABLE_OFFLINE_MODE: true,
    ENABLE_CRM_INTEGRATION: false,
    ENABLE_DETAILED_LOGS: import.meta.env.DEV,
  },

  // App Constants
  APP_VERSION: '0.9.5-MVP',
  SUPPORT_EMAIL: 'suporte@ctrade.com.br',
};
