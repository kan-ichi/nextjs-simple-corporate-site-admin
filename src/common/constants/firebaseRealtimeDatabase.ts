/**
 * Firebase Realtime Database コレクションを格納するデータツリー名
 */
export const FIREBASE_REALTIME_DATABASE_DATA_TREE_NAME = {
  /**
   * 本番環境DBコレクションを格納するデータツリー名
   */
  DATA_TREE_NAME_PRODUCTION: 'production',
  /**
   * ステージング環境DBコレクションを格納するデータツリー名
   */
  DATA_TREE_NAME_STAGING: 'staging',
} as const;

/**
 * Firebase Realtime Database DBコレクション名
 */
export const FIREBASE_REALTIME_DATABASE_COLLECTION_NAME = {
  /**
   * Meta のDBコレクション名
   */
  COLLECTION_META: 'meta',
  /**
   * TopPage のDBコレクション名
   */
  COLLECTION_TOP_PAGE: 'top_page',
  /**
   * Business のDBコレクション名
   */
  COLLECTION_NAME_BUSINESSES: 'businesses',
  /**
   * Category のDBコレクション名
   */
  COLLECTION_NAME_CATEGORIES: 'categories',
  /**
   * News のDBコレクション名
   */
  COLLECTION_NAME_NEWS: 'news',
  /**
   * Member のDBコレクション名
   */
  COLLECTION_NAME_MEMBERS: 'members',
} as const;
