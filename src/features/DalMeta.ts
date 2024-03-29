import { FIREBASE_REALTIME_DATABASE } from '@/common/constants/firebaseRealtimeDatabase';
import { Meta, MetaRecord } from '@/common/types/Meta';
import { FirebaseRealtimeDatabase } from '@/features/FirebaseRealtimeDatabase';

/**
 * Meta データアクセスレイヤー
 */
export module DalMeta {
  /**
   * DBから Meta を取得します
   */
  export async function getMeta(): Promise<MetaRecord | null> {
    const records = await FirebaseRealtimeDatabase.getAllRecords(FIREBASE_REALTIME_DATABASE.COLLECTION_META);
    if (records.length !== 0) {
      const data = records[0].data as Meta;
      return {
        ...records[0].recordBase,
        ...data,
      };
    } else {
      return null;
    }
  }

  /**
   * DBの Meta を更新します
   */
  export async function upsertMeta(data: Meta): Promise<MetaRecord> {
    let newRecord: any;

    const oldRecord = await getMeta();
    if (oldRecord) {
      newRecord = await FirebaseRealtimeDatabase.updateRecord(
        FIREBASE_REALTIME_DATABASE.COLLECTION_META,
        { ...oldRecord, ...data },
        oldRecord.id
      );
    } else {
      newRecord = await FirebaseRealtimeDatabase.addRecord(FIREBASE_REALTIME_DATABASE.COLLECTION_META, {
        ...data,
      });
    }

    return { ...newRecord.recordBase, ...newRecord.data };
  }
}
