/** Default upper bound for tenant collection reads (lists + live listeners). */
export const DEFAULT_COLLECTION_LIMIT = 500;

/** Tighter window for dashboard / KPI-oriented reads. */
export const DASHBOARD_COLLECTION_LIMIT = 200;

/** Recent activity and similar feeds. */
export const ACTIVITY_FEED_LIMIT = 50;
