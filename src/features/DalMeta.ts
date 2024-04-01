import { FIREBASE_REALTIME_DATABASE_COLLECTION_NAME } from '@/common/constants/firebaseRealtimeDatabase';
import { Meta, MetaRecord } from '@/common/types/Meta';
import { FirebaseRealtimeDatabase } from '@/features/FirebaseRealtimeDatabase';

/**
 * Meta データアクセスレイヤー
 */
export module DalMeta {
  /**
   * Firebase Realtime Database DBコレクション名
   */
  const COLLECTION_NAME = FIREBASE_REALTIME_DATABASE_COLLECTION_NAME.COLLECTION_META;

  /**
   * DBから Meta を取得します
   */
  export async function getMeta(): Promise<MetaRecord | null> {
    const dal = new FirebaseRealtimeDatabase({ collectionName: COLLECTION_NAME });
    const records = await dal.getAllRecords();
    if (records.length !== 0) {
      const data = records[0].data as Meta;
      return { ...records[0].recordBase, ...data };
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
    const dal = new FirebaseRealtimeDatabase({ collectionName: COLLECTION_NAME });
    if (oldRecord) {
      newRecord = await dal.updateRecord({ ...oldRecord, ...data }, oldRecord.id);
    } else {
      newRecord = await dal.addRecord({ ...data });
    }
    return { ...newRecord.recordBase, ...newRecord.data };
  }
}
