import { CategoryRecord } from '@/common/types/Category';
import { Image } from '@/common/types/Image';
import { RecordBase } from '@/common/types/RecordBase';

/**
 * ニュースの型定義
 */
export interface News {
  title: string;
  description: string;
  content: string;
  thumbnail?: Image;
  category?: CategoryRecord;
}

/**
 * ニュースの型定義（DB用）
 */
export interface NewsRecord extends RecordBase, News {}
