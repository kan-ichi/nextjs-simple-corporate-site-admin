import { RecordBase } from './RecordBase';

/**
 * メタ情報の型定義
 */
export interface Meta {
  title?: string;
  description?: string;
  og_title?: string;
  og_description?: string;
  og_image_url?: string;
  canonical_tag?: string;
}

/**
 * メタ情報の型定義（DB用）
 */
export interface MetaRecord extends RecordBase, Meta {}
