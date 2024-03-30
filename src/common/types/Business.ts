import { RecordBase } from './RecordBase';

/**
 *  事業内容の型定義
 */
export interface Business {
  imagefile_url?: string;
  logo_url?: string;
  description: string;
  service_url?: string;
}

/**
 *  事業内容の型定義（DB用）
 */
export interface BusinessRecord extends RecordBase, Business {}
