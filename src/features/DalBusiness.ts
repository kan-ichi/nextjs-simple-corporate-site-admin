import { FIREBASE_REALTIME_DATABASE_COLLECTION_NAME } from '@/common/constants/firebaseRealtimeDatabase';
import { Business, BusinessRecord } from '@/common/types/Business';
import { FirebaseRealtimeDatabase } from '@/features/FirebaseRealtimeDatabase';

/**
 * Business データアクセスレイヤー
 */
export module DalBusiness {
  /**
   * Firebase Realtime Database DBコレクション名
   */
  const COLLECTION_NAME = FIREBASE_REALTIME_DATABASE_COLLECTION_NAME.COLLECTION_NAME_BUSINESSES;

  /**
   * Business をDBに追加し、追加したレコードを返します
   */
  export async function addBusiness(data: Business): Promise<BusinessRecord> {
    const dal = new FirebaseRealtimeDatabase({ collectionName: COLLECTION_NAME });
    const record = await dal.addRecord(data);
    return { ...record.recordBase, ...record.data };
  }

  /**
   * DBから Business を取得します
   */
  export async function getBusinessById(id: string): Promise<BusinessRecord | undefined> {
    const dal = new FirebaseRealtimeDatabase({ collectionName: COLLECTION_NAME });
    const record = await dal.getRecordById(id);
    return record ? { ...(record.data as Business), ...record.recordBase } : undefined;
  }

  /**
   * DBから Business を全件取得します
   */
  export async function getAllBusiness(): Promise<BusinessRecord[]> {
    const dal = new FirebaseRealtimeDatabase({ collectionName: COLLECTION_NAME });
    const records = await dal.getAllRecords();
    return records.map((record): BusinessRecord => ({ ...(record.data as Business), ...record.recordBase }));
  }

  /**
   * DBの Business を更新します
   */
  export async function updateBusiness(data: BusinessRecord): Promise<BusinessRecord> {
    const dal = new FirebaseRealtimeDatabase({ collectionName: COLLECTION_NAME });
    const record = await dal.updateRecord(data, data.id);
    return { ...record.recordBase, ...record.data };
  }

  /**
   * DBから Business を削除します
   */
  export async function deleteBusiness(id: string): Promise<void> {
    const dal = new FirebaseRealtimeDatabase({ collectionName: COLLECTION_NAME });
    await dal.deleteRecord(id);
  }
}
