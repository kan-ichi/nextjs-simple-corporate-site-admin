import { FIREBASE_REALTIME_DATABASE_COLLECTION_NAME } from '@/common/constants/firebaseRealtimeDatabase';
import { TopPage, TopPageRecord } from '@/common/types/TopPage';
import { FirebaseRealtimeDatabase } from '@/features/FirebaseRealtimeDatabase';

/**
 * コンストラクタ引数
 */
export interface ConstructorArguments {
  dataTreeName?: string;
  isProduction?: boolean;
}

/**
 * TopPage データアクセスレイヤー
 */
export class DalTopPage {
  private options?: ConstructorArguments;
  constructor(options?: ConstructorArguments) {
    this.options = options;
  }

  /**
   * Firebase Realtime Database データ操作クラスを生成します
   */
  createFirebaseRealtimeDatabase() {
    return new FirebaseRealtimeDatabase({
      dataTreeName: this.options?.dataTreeName,
      isProduction: this.options?.isProduction,
      collectionName: FIREBASE_REALTIME_DATABASE_COLLECTION_NAME.COLLECTION_TOP_PAGE,
    });
  }

  /**
   * DBから TopPage を取得します
   */
  async getTopPage(): Promise<TopPageRecord | null> {
    const dal = this.createFirebaseRealtimeDatabase();
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
  async upsertTopPage(data: TopPage, id?: string): Promise<TopPageRecord> {
    const dal = this.createFirebaseRealtimeDatabase();
    const is_hiring_visible = FirebaseRealtimeDatabase.convertBooleanToString(data.is_hiring_visible);
    const is_member_visible = FirebaseRealtimeDatabase.convertBooleanToString(data.is_member_visible);
    let newRecord: any;

    const oldRecord = await this.getTopPage();
    if (oldRecord) {
      newRecord = await dal.updateRecord({ ...oldRecord, ...data, is_hiring_visible, is_member_visible }, oldRecord.id);
    } else {
      newRecord = await dal.addRecord({ ...data, is_hiring_visible, is_member_visible }, id);
    }

    return {
      ...newRecord.recordBase,
      ...newRecord.data,
      is_hiring_visible: FirebaseRealtimeDatabase.convertStringToBoolean(newRecord.data.is_hiring_visible),
      is_member_visible: FirebaseRealtimeDatabase.convertStringToBoolean(newRecord.data.is_member_visible),
    };
  }
}
