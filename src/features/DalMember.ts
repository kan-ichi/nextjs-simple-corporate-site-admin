import { FIREBASE_REALTIME_DATABASE_COLLECTION_NAME } from '@/common/constants/firebaseRealtimeDatabase';
import { Member, MemberRecord } from '@/common/types/Member';
import { FirebaseRealtimeDatabase } from '@/features/FirebaseRealtimeDatabase';

/**
 * コンストラクタ引数
 */
export interface ConstructorArguments {
  dataTreeName?: string;
  isProduction?: boolean;
}

/**
 * Member データアクセスレイヤー
 */
export class DalMember {
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
      collectionName: FIREBASE_REALTIME_DATABASE_COLLECTION_NAME.COLLECTION_NAME_MEMBERS,
    });
  }

  /**
   * Member をDBに追加し、追加したレコードを返します
   */
  async addMember(data: Member, id?: string): Promise<MemberRecord> {
    const dataMatchedToDb = this.convertModelToDbFormat(data);
    const dal = this.createFirebaseRealtimeDatabase();
    const record = await dal.addRecord(dataMatchedToDb, id);
    return { ...record.recordBase, ...record.data };
  }

  /**
   * DBから Member を取得します
   */
  async getMemberById(id: string): Promise<MemberRecord | undefined> {
    const dal = this.createFirebaseRealtimeDatabase();
    const record = await dal.getRecordById(id);
    return record ? { ...(record.data as Member), ...record.recordBase } : undefined;
  }

  /**
   * DBから Member を全件取得します
   */
  async getAllMember(): Promise<MemberRecord[]> {
    const dal = this.createFirebaseRealtimeDatabase();
    const records = await dal.getAllRecords();
    return records.map((record): MemberRecord => ({ ...(record.data as Member), ...record.recordBase }));
  }

  /**
   * DBの Member を更新します
   */
  async updateMember(data: MemberRecord): Promise<MemberRecord> {
    const dataMatchedToDb = this.convertModelToDbFormat(data);
    const dal = this.createFirebaseRealtimeDatabase();
    const record = await dal.updateRecord(dataMatchedToDb, dataMatchedToDb.id);
    return { ...record.recordBase, ...record.data };
  }

  /**
   * DBの Member を更新します（既存レコードが無ければ追加します）
   */
  async upsertMember(data: MemberRecord): Promise<MemberRecord> {
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
   * DBから Member を削除します
   */
  async deleteMember(id: string): Promise<void> {
    const dal = this.createFirebaseRealtimeDatabase();
    await dal.deleteRecord(id);
  }

  /**
   * モデルをDB登録用の形式に変換します
   */
  private convertModelToDbFormat(data: Member): any;
  private convertModelToDbFormat(data: MemberRecord): any;
  private convertModelToDbFormat(data: Member | MemberRecord): any {
    data.imagefile_url ??= '';
    return { ...data };
  }
}
