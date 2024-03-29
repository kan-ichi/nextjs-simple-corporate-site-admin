import { RecordBase } from '@/common/types/RecordBase';

/**
 *  メンバーの型定義
 */
export interface Member {
  imagefile_url?: string;
  name: string;
  position: string;
  profile: string;
}

/**
 *  メンバーの型定義（DB用）
 */
export interface MemberRecord extends RecordBase, Member {}
