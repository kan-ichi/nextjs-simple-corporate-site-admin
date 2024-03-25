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
    const createDateTime = DbKeyUtils.extractDateFromDbKey(recordId) as Date;
    const addData = {
      ...data,
      updatedAt: FormatDateUtils.yyyy_MM_dd_hhmmssfff(createDateTime),
    };
    await set(recordRef, addData);
    return {
      recordBase: {
        id: recordId,
        createdAt: createDateTime,
        updatedAt: createDateTime,
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
          createdAt: DbKeyUtils.extractDateFromDbKey(id) as Date,
          updatedAt: isNaN(new Date(recordData.updatedAt).getTime()) ? undefined : new Date(recordData.updatedAt),
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
          createdAt: DbKeyUtils.extractDateFromDbKey(id) as Date,
          updatedAt: isNaN(new Date((value as any).updatedAt).getTime())
            ? undefined
            : new Date((value as any).updatedAt),
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
      updatedAt: FormatDateUtils.yyyy_MM_dd_hhmmssfff(updateDateTime),
    };
    const { id: _, ...updateDataWithoutId } = updateData;
    await set(recordRef, updateDataWithoutId);
    return {
      recordBase: {
        id: id,
        createdAt: DbKeyUtils.extractDateFromDbKey(id) as Date,
        updatedAt: updateDateTime,
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
}
