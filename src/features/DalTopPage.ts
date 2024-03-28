import { FIREBASE_REALTIME_DATABASE } from '@/common/constants/firebaseRealtimeDatabase';
import { TopPage, TopPageRecord } from '@/common/types/TopPage';
import { FirebaseRealtimeDatabase } from '@/features/FirebaseRealtimeDatabase';

/**
 * TopPage データアクセスレイヤー
 */
export module DalTopPage {
  /**
   * DBから TopPage を取得します
   */
  export async function getTopPage(): Promise<TopPageRecord | null> {
    const records = await FirebaseRealtimeDatabase.getAllRecords(FIREBASE_REALTIME_DATABASE.COLLECTION_TOP_PAGE);
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
    const is_hiring_visible = FirebaseRealtimeDatabase.convertBooleanToString(data.is_hiring_visible);
    const is_member_visible = FirebaseRealtimeDatabase.convertBooleanToString(data.is_member_visible);
    let newRecord: any;

    const oldRecord = await getTopPage();
    if (oldRecord) {
      newRecord = await FirebaseRealtimeDatabase.updateRecord(
        FIREBASE_REALTIME_DATABASE.COLLECTION_TOP_PAGE,
        { ...oldRecord, ...data, is_hiring_visible, is_member_visible },
        oldRecord.id
      );
    } else {
      newRecord = await FirebaseRealtimeDatabase.addRecord(FIREBASE_REALTIME_DATABASE.COLLECTION_TOP_PAGE, {
        ...data,
        is_hiring_visible,
        is_member_visible,
      });
    }

    return {
      ...newRecord.recordBase,
      ...newRecord.data,
      is_hiring_visible: FirebaseRealtimeDatabase.convertStringToBoolean(newRecord.data.is_hiring_visible),
      is_member_visible: FirebaseRealtimeDatabase.convertStringToBoolean(newRecord.data.is_member_visible),
    };
  }
}
