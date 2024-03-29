import { FIREBASE_REALTIME_DATABASE } from '@/common/constants/firebaseRealtimeDatabase';
import { Member, MemberRecord } from '@/common/types/Member';
import { FirebaseRealtimeDatabase } from '@/features/FirebaseRealtimeDatabase';

/**
 * Member データアクセスレイヤー
 */
export module DalMember {
  /**
   * Member をDBに追加し、追加したレコードを返します
   */
  export async function addMember(data: Member): Promise<MemberRecord> {
    const record = await FirebaseRealtimeDatabase.addRecord(FIREBASE_REALTIME_DATABASE.COLLECTION_NAME_MEMBERS, data);
    return {
      ...record.recordBase,
      ...record.data,
    };
  }

  /**
   * DBから Member を取得します
   */
  export async function getMemberById(id: string): Promise<MemberRecord | undefined> {
    const record = await FirebaseRealtimeDatabase.getRecordById(FIREBASE_REALTIME_DATABASE.COLLECTION_NAME_MEMBERS, id);
    return record
      ? {
          ...(record.data as Member),
          ...record.recordBase,
        }
      : undefined;
  }

  /**
   * DBから Member を全件取得します
   */
  export async function getAllMember(): Promise<MemberRecord[]> {
    const records = await FirebaseRealtimeDatabase.getAllRecords(FIREBASE_REALTIME_DATABASE.COLLECTION_NAME_MEMBERS);
    return records.map(
      (record): MemberRecord => ({
        ...(record.data as Member),
        ...record.recordBase,
      })
    );
  }

  /**
   * DBの Member を更新します
   */
  export async function updateMember(data: MemberRecord): Promise<MemberRecord> {
    const record = await FirebaseRealtimeDatabase.updateRecord(
      FIREBASE_REALTIME_DATABASE.COLLECTION_NAME_MEMBERS,
      data,
      data.id
    );
    return {
      ...record.recordBase,
      ...record.data,
    };
  }

  /**
   * DBから Member を削除します
   */
  export async function deleteMember(id: string): Promise<void> {
    await FirebaseRealtimeDatabase.deleteRecord(FIREBASE_REALTIME_DATABASE.COLLECTION_NAME_MEMBERS, id);
  }
}
