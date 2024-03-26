/**
 * DBレコード共通のプロパティ
 */
export interface RecordBase {
  id: string;
  created_at?: Date;
  updated_at?: Date;
}
