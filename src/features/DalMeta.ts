import { FIREBASE_REALTIME_DATABASE_COLLECTION_NAME } from '@/common/constants/firebaseRealtimeDatabase';
import { Meta, MetaRecord } from '@/common/types/Meta';
import { FirebaseRealtimeDatabase } from '@/features/FirebaseRealtimeDatabase';

/**
 * コンストラクタ引数
 */
export interface ConstructorArguments {
  dataTreeName?: string;
  isProduction?: boolean;
}

/**
 * Meta データアクセスレイヤー
 */
export class DalMeta {
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
      collectionName: FIREBASE_REALTIME_DATABASE_COLLECTION_NAME.COLLECTION_META,
    });
  }

  /**
   * DBから Meta を取得します
   */
  async getMeta(): Promise<MetaRecord | null> {
    const dal = this.createFirebaseRealtimeDatabase();
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
  async upsertMeta(data: Meta): Promise<MetaRecord> {
    let newRecord: any;
    const oldRecord = await this.getMeta();
    const dal = this.createFirebaseRealtimeDatabase();
    if (oldRecord) {
      newRecord = await dal.updateRecord({ ...oldRecord, ...data }, oldRecord.id);
    } else {
      newRecord = await dal.addRecord({ ...data });
    }
    return { ...newRecord.recordBase, ...newRecord.data };
  }
}
