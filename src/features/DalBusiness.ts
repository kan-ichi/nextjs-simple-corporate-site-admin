import { FIREBASE_REALTIME_DATABASE_COLLECTION_NAME } from '@/common/constants/firebaseRealtimeDatabase';
import { Business, BusinessRecord } from '@/common/types/Business';
import { FirebaseRealtimeDatabase } from '@/features/FirebaseRealtimeDatabase';

/**
 * コンストラクタ引数
 */
export interface ConstructorArguments {
  dataTreeName?: string;
  isProduction?: boolean;
}

/**
 * Business データアクセスレイヤー
 */
export class DalBusiness {
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
      collectionName: FIREBASE_REALTIME_DATABASE_COLLECTION_NAME.COLLECTION_NAME_BUSINESSES,
    });
  }

  /**
   * Business をDBに追加し、追加したレコードを返します
   */
  async addBusiness(data: Business, id?: string): Promise<BusinessRecord> {
    const dataMatchedToDb = this.convertModelToDbFormat(data);
    const dal = this.createFirebaseRealtimeDatabase();
    const record = await dal.addRecord(dataMatchedToDb, id);
    return { ...record.recordBase, ...record.data };
  }

  /**
   * DBから Business を取得します
   */
  async getBusinessById(id: string): Promise<BusinessRecord | undefined> {
    const dal = this.createFirebaseRealtimeDatabase();
    const record = await dal.getRecordById(id);
    return record ? { ...(record.data as Business), ...record.recordBase } : undefined;
  }

  /**
   * DBから Business を全件取得します
   */
  async getAllBusiness(): Promise<BusinessRecord[]> {
    const dal = this.createFirebaseRealtimeDatabase();
    const records = await dal.getAllRecords();
    return records.map((record): BusinessRecord => ({ ...(record.data as Business), ...record.recordBase }));
  }

  /**
   * DBの Business を更新します
   */
  async updateBusiness(data: BusinessRecord): Promise<BusinessRecord> {
    const dataMatchedToDb = this.convertModelToDbFormat(data);
    const dal = this.createFirebaseRealtimeDatabase();
    const record = await dal.updateRecord(dataMatchedToDb, dataMatchedToDb.id);
    return { ...record.recordBase, ...record.data };
  }

  /**
   * DBの Business を更新します（既存レコードが無ければ追加します）
   */
  async upsertBusiness(data: BusinessRecord): Promise<BusinessRecord> {
    const dataMatchedToDb = this.convertModelToDbFormat(data);
    const dal = this.createFirebaseRealtimeDatabase();
    const currentRecord = await dal.getRecordById(dataMatchedToDb.id);
    let record = null;
    if (currentRecord) {
      record = await dal.updateRecord(dataMatchedToDb, dataMatchedToDb.id);
    } else {
      record = await dal.addRecord(dataMatchedToDb);
    }
    return { ...record.recordBase, ...record.data };
  }

  /**
   * DBから Business を削除します
   */
  async deleteBusiness(id: string): Promise<void> {
    const dal = this.createFirebaseRealtimeDatabase();
    await dal.deleteRecord(id);
  }

  /**
   * モデルをDB登録用の形式に変換します
   */
  private convertModelToDbFormat(data: Business): any;
  private convertModelToDbFormat(data: BusinessRecord): any;
  private convertModelToDbFormat(data: Business | BusinessRecord): any {
    data.imagefile_url ??= '';
    data.logo_url ??= '';
    data.service_url ??= '';
    return { ...data };
  }
}
