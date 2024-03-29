import { FIREBASE_REALTIME_DATABASE } from '@/common/constants/firebaseRealtimeDatabase';
import { Business, BusinessRecord } from '@/common/types/Business';
import { FirebaseRealtimeDatabase } from '@/features/FirebaseRealtimeDatabase';

/**
 * Business データアクセスレイヤー
 */
export module DalBusiness {
  /**
   * Business をDBに追加し、追加したレコードを返します
   */
  export async function addBusiness(data: Business): Promise<BusinessRecord> {
    console.log(data);
    const record = await FirebaseRealtimeDatabase.addRecord(
      FIREBASE_REALTIME_DATABASE.COLLECTION_NAME_BUSINESSES,
      data
    );
    return {
      ...record.recordBase,
      ...record.data,
    };
  }

  /**
   * DBから Business を取得します
   */
  export async function getBusinessById(id: string): Promise<BusinessRecord | undefined> {
    const record = await FirebaseRealtimeDatabase.getRecordById(
      FIREBASE_REALTIME_DATABASE.COLLECTION_NAME_BUSINESSES,
      id
    );
    return record
      ? {
          ...(record.data as Business),
          ...record.recordBase,
        }
      : undefined;
  }

  /**
   * DBから Business を全件取得します
   */
  export async function getAllBusiness(): Promise<BusinessRecord[]> {
    const records = await FirebaseRealtimeDatabase.getAllRecords(FIREBASE_REALTIME_DATABASE.COLLECTION_NAME_BUSINESSES);
    return records.map(
      (record): BusinessRecord => ({
        ...(record.data as Business),
        ...record.recordBase,
      })
    );
  }

  /**
   * DBの Business を更新します
   */
  export async function updateBusiness(data: BusinessRecord): Promise<BusinessRecord> {
    const record = await FirebaseRealtimeDatabase.updateRecord(
      FIREBASE_REALTIME_DATABASE.COLLECTION_NAME_BUSINESSES,
      data,
      data.id
    );
    return {
      ...record.recordBase,
      ...record.data,
    };
  }

  /**
   * DBから Business を削除します
   */
  export async function deleteBusiness(id: string): Promise<void> {
    await FirebaseRealtimeDatabase.deleteRecord(FIREBASE_REALTIME_DATABASE.COLLECTION_NAME_BUSINESSES, id);
  }
}
