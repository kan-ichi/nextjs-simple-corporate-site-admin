import { FIREBASE_REALTIME_DATABASE_COLLECTION_NAME } from '@/common/constants/firebaseRealtimeDatabase';
import { Category, CategoryRecord } from '@/common/types/Category';
import { FirebaseRealtimeDatabase } from '@/features/FirebaseRealtimeDatabase';

/**
 * Category データアクセスレイヤー
 */
export module DalCategory {
  /**
   * Firebase Realtime Database DBコレクション名
   */
  const COLLECTION_NAME = FIREBASE_REALTIME_DATABASE_COLLECTION_NAME.COLLECTION_NAME_CATEGORIES;

  /**
   * Category をDBに追加し、追加したレコードを返します
   */
  export async function addCategory(data: Category): Promise<CategoryRecord> {
    const dal = new FirebaseRealtimeDatabase({ collectionName: COLLECTION_NAME });
    const record = await dal.addRecord(data);
    return { ...record.recordBase, ...record.data };
  }

  /**
   * DBから Category を取得します
   */
  export async function getCategoryById(id: string): Promise<CategoryRecord | undefined> {
    const dal = new FirebaseRealtimeDatabase({ collectionName: COLLECTION_NAME });
    const record = await dal.getRecordById(id);
    return record ? { ...(record.data as Category), ...record.recordBase } : undefined;
  }

  /**
   * DBから Category を全件取得します
   */
  export async function getAllCategory(): Promise<CategoryRecord[]> {
    const dal = new FirebaseRealtimeDatabase({ collectionName: COLLECTION_NAME });
    const records = await dal.getAllRecords();
    return records.map((record): CategoryRecord => ({ ...(record.data as Category), ...record.recordBase }));
  }

  /**
   * DBの Category を更新します
   */
  export async function updateCategory(data: CategoryRecord): Promise<CategoryRecord> {
    const dal = new FirebaseRealtimeDatabase({ collectionName: COLLECTION_NAME });
    const record = await dal.updateRecord(data, data.id);
    return { ...record.recordBase, ...record.data };
  }

  /**
   * DBから Category を削除します
   */
  export async function deleteCategory(id: string): Promise<void> {
    const dal = new FirebaseRealtimeDatabase({ collectionName: COLLECTION_NAME });
    await dal.deleteRecord(id);
  }
}
