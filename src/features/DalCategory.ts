import { FIREBASE_REALTIME_DATABASE } from '@/common/constants/firebaseRealtimeDatabase';
import { Category, CategoryRecord } from '@/common/types/Category';
import { FirebaseRealtimeDatabase } from '@/features/FirebaseRealtimeDatabase';

/**
 * Category データアクセスレイヤー
 */
export module DalCategory {
  /**
   * Category をDBに追加し、追加したレコードを返します
   */
  export async function addCategory(data: Category): Promise<CategoryRecord> {
    const record = await FirebaseRealtimeDatabase.addRecord(
      FIREBASE_REALTIME_DATABASE.COLLECTION_NAME_CATEGORIES,
      data
    );
    return {
      ...record.recordBase,
      ...record.data,
    };
  }

  /**
   * DBから Category を取得します
   */
  export async function getCategoryById(id: string): Promise<CategoryRecord | undefined> {
    const record = await FirebaseRealtimeDatabase.getRecordById(
      FIREBASE_REALTIME_DATABASE.COLLECTION_NAME_CATEGORIES,
      id
    );
    return record
      ? {
          ...(record.data as Category),
          ...record.recordBase,
        }
      : undefined;
  }

  /**
   * DBから Category を全件取得します
   */
  export async function getAllCategory(): Promise<CategoryRecord[]> {
    const records = await FirebaseRealtimeDatabase.getAllRecords(FIREBASE_REALTIME_DATABASE.COLLECTION_NAME_CATEGORIES);
    return records.map(
      (record): CategoryRecord => ({
        ...(record.data as Category),
        ...record.recordBase,
      })
    );
  }

  /**
   * DBの Category を更新します
   */
  export async function updateCategory(data: CategoryRecord): Promise<CategoryRecord> {
    const record = await FirebaseRealtimeDatabase.updateRecord(
      FIREBASE_REALTIME_DATABASE.COLLECTION_NAME_CATEGORIES,
      data,
      data.id
    );
    return {
      ...record.recordBase,
      ...record.data,
    };
  }

  /**
   * DBから Category を削除します
   */
  export async function deleteCategory(id: string): Promise<void> {
    await FirebaseRealtimeDatabase.deleteRecord(FIREBASE_REALTIME_DATABASE.COLLECTION_NAME_CATEGORIES, id);
  }
}
