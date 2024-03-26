import { RecordBase } from '@/common/types/RecordBase';
import { DbKeyUtils } from '@/common/utils/DbKeyUtils';
import { FormatDateUtils } from '@/common/utils/FormatDateUtils';
import { child, endAt, get, getDatabase, orderByKey, query, ref, remove, set } from 'firebase/database';
/**
 * Firebase Realtime Database 関連の機能
 */
export module FirebaseRealtimeDatabase {
  /**
   * データをDBに追加し、追加したレコードを返します
   */
  export async function addRecord<T>(collectionName: string, data: T): Promise<{ recordBase: RecordBase; data: T }> {
    const dbRef = ref(getDatabase(), collectionName);
    const recordId = DbKeyUtils.generateDbKey();
    const recordRef = child(dbRef, recordId);
    const createDateTime = convertDbKeyToDate(recordId);
    const addData = {
      ...data,
      updated_at: convertDateTimeStringToDbDateTimeString(createDateTime),
    };
    await set(recordRef, addData);
    return {
      recordBase: {
        id: recordId,
        created_at: createDateTime,
        updated_at: createDateTime,
      },
      data,
    };
  }

  /**
   * DBからレコードを取得します
   */
  export async function getRecordById<T>(
    collectionName: string,
    id: string
  ): Promise<{ recordBase: RecordBase; data: T } | null> {
    const dbRef = ref(getDatabase(), collectionName);
    const recordRef = child(dbRef, id);
    const recordSnapshot = await get(recordRef);
    if (recordSnapshot.exists()) {
      const recordData = recordSnapshot.val();
      return {
        recordBase: {
          id: id,
          created_at: convertDbKeyToDate(id),
          updated_at: convertStringToDateTime(recordData.updated_at),
        },
        data: recordData,
      };
    } else {
      return null;
    }
  }

  /**
   * DBからレコードを全件取得します
   */
  export async function getAllRecords<T>(collectionName: string): Promise<{ recordBase: RecordBase; data: T }[]> {
    const dbRef = ref(getDatabase(), collectionName);
    const recordsRef = query(dbRef, orderByKey());
    const recordsSnapshot = await get(recordsRef);
    if (recordsSnapshot.exists()) {
      const data = recordsSnapshot.val();
      return Object.entries(data).map(([id, value]) => ({
        data: value as T,
        recordBase: {
          id,
          created_at: convertDbKeyToDate(id),
          updated_at: convertStringToDateTime((value as any).updated_at),
        } as RecordBase,
      }));
    } else {
      return [];
    }
  }

  /**
   * DBのレコードを更新します
   */
  export async function updateRecord<T extends { id?: any }>(
    collectionName: string,
    data: T,
    id: string
  ): Promise<{ recordBase: RecordBase; data: T }> {
    const dbRef = ref(getDatabase(), collectionName);
    const recordRef = child(dbRef, id);
    const updateDateTime = new Date();
    const updateData = {
      ...data,
      updated_at: convertDateTimeStringToDbDateTimeString(updateDateTime),
    };
    const { id: _, ...updateDataWithoutId } = updateData; // 更新データ部分から項目「id」を除去
    await set(recordRef, updateDataWithoutId);
    return {
      recordBase: {
        id: id,
        created_at: convertDbKeyToDate(id),
        updated_at: updateDateTime,
      },
      data,
    };
  }

  /**
   * DBからレコードを削除します
   */
  export async function deleteRecord<T>(collectionName: string, id: string): Promise<string> {
    const dbRef = ref(getDatabase(), collectionName);
    const recordRef = child(dbRef, id);
    await remove(recordRef);
    return id;
  }

  /**
   * DBから古いレコードを削除します
   */
  export async function deleteOldRecordsFromDb<T>(collectionName: string, deletionDateTime: Date) {
    // 基準年月日のDBキーを生成
    const deletionDbKeyEndAt = `${DbKeyUtils.generateDbKeyDateTimePart(deletionDateTime)}${'z'.repeat(32)}`;
    // データベースから基準年月日以前のデータを取得し、削除
    const dbRef = ref(getDatabase(), collectionName);
    const oldRecordQuery = query(dbRef, orderByKey(), endAt(deletionDbKeyEndAt));
    const snapshot = await get(oldRecordQuery);
    snapshot.forEach((childSnapshot) => {
      remove(childSnapshot.ref);
    });
  }

  /**
   * DBのキーを日時に変換します
   */
  function convertDbKeyToDate(dbKey: string): Date {
    return DbKeyUtils.extractDateFromDbKey(dbKey) as Date;
  }

  /**
   * DBでは文字列として格納されていた値を日時に変換します
   */
  function convertStringToDateTime(dateString: string): Date | undefined;
  function convertStringToDateTime(dateTime: Date | undefined): Date | undefined;
  function convertStringToDateTime(dateString: string | Date | undefined): Date | undefined {
    if (!dateString) return undefined;
    if (dateString instanceof Date) return dateString;
    return isNaN(new Date(dateString).getTime()) ? undefined : new Date(dateString);
  }

  /**
   * 日時文字列／日付型をDB格納可能な文字列に変換します
   */
  export function convertDateTimeStringToDbDateTimeString(dateTimeString: string): string;
  export function convertDateTimeStringToDbDateTimeString(dateTimeString: Date | undefined): string;
  export function convertDateTimeStringToDbDateTimeString(dateTimeString: string | Date | undefined): string {
    if (!dateTimeString) return '';
    // スラッシュ文字を Firebase Realtime Database に格納できない制約があるので、ハイフン文字に変換する必要がある
    if (dateTimeString instanceof Date) {
      return FormatDateUtils.yyyy_MM_dd_hhmmssfff(dateTimeString);
    }
    return dateTimeString.replaceAll('/', '-');
  }
}
