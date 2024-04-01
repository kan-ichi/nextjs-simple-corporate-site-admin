import { FIREBASE_REALTIME_DATABASE_COLLECTION_NAME } from '@/common/constants/firebaseRealtimeDatabase';
import { TopPage, TopPageRecord } from '@/common/types/TopPage';
import { FirebaseRealtimeDatabase } from '@/features/FirebaseRealtimeDatabase';

/**
 * TopPage データアクセスレイヤー
 */
export module DalTopPage {
  /**
   * Firebase Realtime Database DBコレクション名
   */
  const COLLECTION_NAME = FIREBASE_REALTIME_DATABASE_COLLECTION_NAME.COLLECTION_TOP_PAGE;

  /**
   * DBから TopPage を取得します
   */
  export async function getTopPage(): Promise<TopPageRecord | null> {
    const dal = new FirebaseRealtimeDatabase({ collectionName: COLLECTION_NAME });
    const records = await dal.getAllRecords();
    if (records.length !== 0) {
      const data = records[0].data as TopPage;
      return {
        ...records[0].recordBase,
        ...data,
        is_hiring_visible: FirebaseRealtimeDatabase.convertStringToBoolean(data.is_hiring_visible),
        is_member_visible: FirebaseRealtimeDatabase.convertStringToBoolean(data.is_member_visible),
      };
    } else {
      return null;
    }
  }

  /**
   * DBの TopPage を更新します
   */
  export async function upsertTopPage(data: TopPage): Promise<TopPageRecord> {
    const dal = new FirebaseRealtimeDatabase({ collectionName: COLLECTION_NAME });
    const is_hiring_visible = FirebaseRealtimeDatabase.convertBooleanToString(data.is_hiring_visible);
    const is_member_visible = FirebaseRealtimeDatabase.convertBooleanToString(data.is_member_visible);
    let newRecord: any;

    const oldRecord = await getTopPage();
    if (oldRecord) {
      newRecord = await dal.updateRecord({ ...oldRecord, ...data, is_hiring_visible, is_member_visible }, oldRecord.id);
    } else {
      newRecord = await dal.addRecord({ ...data, is_hiring_visible, is_member_visible });
    }

    return {
      ...newRecord.recordBase,
      ...newRecord.data,
      is_hiring_visible: FirebaseRealtimeDatabase.convertStringToBoolean(newRecord.data.is_hiring_visible),
      is_member_visible: FirebaseRealtimeDatabase.convertStringToBoolean(newRecord.data.is_member_visible),
    };
  }
}
