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
      return this.restoreModelFromDbFormat(records[0]);
    } else {
      return null;
    }
  }

  /**
   * DBの TopPage を更新します
   */
  async upsertTopPage(data: TopPage, id?: string): Promise<TopPageRecord> {
    const dataMatchedToDb = this.convertModelToDbFormat(data);
    const dal = this.createFirebaseRealtimeDatabase();
    let newRecord: any;
    const oldRecord = await this.getTopPage();
    if (oldRecord) {
      newRecord = await dal.updateRecord({ ...oldRecord, ...dataMatchedToDb }, oldRecord.id);
    } else {
      newRecord = await dal.addRecord({ ...dataMatchedToDb }, id);
    }

    return this.restoreModelFromDbFormat(newRecord);
  }

  /**
   * モデルをDB登録用の形式に変換します
   */
  private convertModelToDbFormat(data: TopPage): any {
    data.hiring_message ??= '';
    data.hiring_url ??= '';
    return {
      ...data,
      is_hiring_visible: FirebaseRealtimeDatabase.convertBooleanToString(data.is_hiring_visible),
      is_member_visible: FirebaseRealtimeDatabase.convertBooleanToString(data.is_member_visible),
    };
  }

  /**
   * DBから取得した形式を元のモデルに戻します
   */
  private restoreModelFromDbFormat(data: any): TopPageRecord {
    return {
      ...data.recordBase,
      ...data.data,
      is_hiring_visible: FirebaseRealtimeDatabase.convertStringToBoolean(data.data.is_hiring_visible),
      is_member_visible: FirebaseRealtimeDatabase.convertStringToBoolean(data.data.is_member_visible),
    };
  }
}
