import { FIREBASE_REALTIME_DATABASE_COLLECTION_NAME } from '@/common/constants/firebaseRealtimeDatabase';
import { Member, MemberRecord } from '@/common/types/Member';
import { FirebaseRealtimeDatabase } from '@/features/FirebaseRealtimeDatabase';

/**
 * Member データアクセスレイヤー
 */
export module DalMember {
  /**
   * Firebase Realtime Database DBコレクション名
   */
  const COLLECTION_NAME = FIREBASE_REALTIME_DATABASE_COLLECTION_NAME.COLLECTION_NAME_MEMBERS;

  /**
   * Member をDBに追加し、追加したレコードを返します
   */
  export async function addMember(data: Member): Promise<MemberRecord> {
    const dal = new FirebaseRealtimeDatabase({ collectionName: COLLECTION_NAME });
    const record = await dal.addRecord(data);
    return { ...record.recordBase, ...record.data };
  }

  /**
   * DBから Member を取得します
   */
  export async function getMemberById(id: string): Promise<MemberRecord | undefined> {
    const dal = new FirebaseRealtimeDatabase({ collectionName: COLLECTION_NAME });
    const record = await dal.getRecordById(id);
    return record ? { ...(record.data as Member), ...record.recordBase } : undefined;
  }

  /**
   * DBから Member を全件取得します
   */
  export async function getAllMember(): Promise<MemberRecord[]> {
    const dal = new FirebaseRealtimeDatabase({ collectionName: COLLECTION_NAME });
    const records = await dal.getAllRecords();
    return records.map((record): MemberRecord => ({ ...(record.data as Member), ...record.recordBase }));
  }

  /**
   * DBの Member を更新します
   */
  export async function updateMember(data: MemberRecord): Promise<MemberRecord> {
    const dal = new FirebaseRealtimeDatabase({ collectionName: COLLECTION_NAME });
    const record = await dal.updateRecord(data, data.id);
    return { ...record.recordBase, ...record.data };
  }

  /**
   * DBから Member を削除します
   */
  export async function deleteMember(id: string): Promise<void> {
    const dal = new FirebaseRealtimeDatabase({ collectionName: COLLECTION_NAME });
    await dal.deleteRecord(id);
  }
}
