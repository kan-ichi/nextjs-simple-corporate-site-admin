import { RecordBase } from '@/common/types/RecordBase';

/**
 *  事業内容の型定義
 */
export interface Business {
  logo_url?: string;
  description: string;
  service_url?: string;
}

/**
 *  事業内容の型定義（DB用）
 */
export interface BusinessRecord extends RecordBase, Business {}
