import { CategoryRecord } from '@/common/types/Category';
import { RecordBase } from '@/common/types/RecordBase';

/**
 * ニュースの型定義
 */
export interface News {
  release_date: string;
  title: string;
  description: string;
  content: string;
  image_id?: string;
  category?: CategoryRecord;
}

/**
 * ニュースの型定義（DB用）
 */
export interface NewsRecord extends RecordBase, News {}
