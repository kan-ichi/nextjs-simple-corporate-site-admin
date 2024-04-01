import { FIREBASE_REALTIME_DATABASE_COLLECTION_NAME } from '@/common/constants/firebaseRealtimeDatabase';
import { AppGlobalContextValue } from '@/common/contexts/AppGlobalContext';
import { Member, MemberRecord } from '@/common/types/Member';
import { FirebaseRealtimeDatabase } from '@/features/FirebaseRealtimeDatabase';

/**
 * コンストラクタ引数
 */
export interface ConstructorArguments {
  dataTreeName?: string;
  appGlobalContextValue?: AppGlobalContextValue;
}

/**
 * Member データアクセスレイヤー
 */
export class DalMember {
  private options: ConstructorArguments;
  constructor(options: ConstructorArguments) {
    this.options = options;
  }

  /**
   * Firebase Realtime Database データ操作クラスを生成します
   */
  createFirebaseRealtimeDatabase() {
    return new FirebaseRealtimeDatabase({
      dataTreeName: this.options?.dataTreeName,
      appGlobalContextValue: this.options?.appGlobalContextValue,
      collectionName: FIREBASE_REALTIME_DATABASE_COLLECTION_NAME.COLLECTION_NAME_MEMBERS,
    });
  }

  /**
   * Member をDBに追加し、追加したレコードを返します
   */
  async addMember(data: Member): Promise<MemberRecord> {
    const dal = this.createFirebaseRealtimeDatabase();
    const record = await dal.addRecord(data);
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
    const dal = this.createFirebaseRealtimeDatabase();
    const record = await dal.updateRecord(data, data.id);
    return { ...record.recordBase, ...record.data };
  }

  /**
   * DBから Member を削除します
   */
  async deleteMember(id: string): Promise<void> {
    const dal = this.createFirebaseRealtimeDatabase();
    await dal.deleteRecord(id);
  }
}
