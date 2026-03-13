export const STORAGE_KEYS = {
  // Navigation / onboarding
  HAS_ONBOARDED: 'app:has_onboarded',
  INTRO_SEEN: 'app:intro_seen',

  // Step sync (date-keyed: `${PREFIX}${YYYY-MM-DD}`)
  STEP_CACHE_PREFIX: 'steps:',

  // Content packs
  CONTENT_PACK_STATUS_PREFIX: 'content_pack:status:',
  CONTENT_PACK_CHECKSUM_PREFIX: 'content_pack:checksum:',

  // Weather
  WEATHER_CACHE_PREFIX: 'weather:',
  WEATHER_DAILY_COUNT_PREFIX: 'weather:daily_count:',

  // Notifications
  NOTIFICATION_OPT_OUT: 'notification:opt_out',
  NOTIFICATION_LAST_SENT: 'notification:last_sent',

  // Country
  COUNTRY_CODE: 'app:country_code',

  // Ads
  AD_CONSENT_SHOWN: 'ads:consent_shown',

  // Static content cache
  STATIC_CONTENT_PREFIX: 'static_content:',
} as const;
