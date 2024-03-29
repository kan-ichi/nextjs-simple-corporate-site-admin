import { RecordBase } from '@/common/types/RecordBase';

/**
 * ニュースの型定義
 */
export interface News {
  imagefile_url?: string;
  release_date: string;
  title: string;
  description: string;
  content: string;
  category_id?: string;
}

/**
 * ニュースの型定義（DB用）
 */
export interface NewsRecord extends RecordBase, News {}
