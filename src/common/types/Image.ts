import { RecordBase } from '@/common/types/RecordBase';

/**
 * 画像の型定義
 */
export interface Image {
  url: string;
  width?: number;
  height?: number;
}

/**
 * 画像の型定義（DB用）
 */
export interface NewsRecord extends RecordBase, Image {}
