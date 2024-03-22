import { RecordBase } from '@/common/types/RecordBase';

/**
 * カテゴリーの型定義
 */
export interface Category {
  name: string;
}

/**
 * カテゴリーの型定義（DB用）
 */
export interface CategoryRecord extends RecordBase, Category {}
