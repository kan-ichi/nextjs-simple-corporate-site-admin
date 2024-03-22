/**
 * DBレコード共通のプロパティ
 */
export interface RecordBase {
  id: string;
  createdAt?: Date;
  updatedAt?: Date;
}
