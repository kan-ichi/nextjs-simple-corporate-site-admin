import { FIREBASE_REALTIME_DATABASE_DATA_TREE_NAME } from '@/common/constants/firebaseRealtimeDatabase';
import { RecordBase } from '@/common/types/RecordBase';
import { DbKeyUtils } from '@/common/utils/DbKeyUtils';
import { FormatDateUtils } from '@/common/utils/FormatDateUtils';
import { child, endAt, get, getDatabase, orderByKey, query, ref, remove, set } from 'firebase/database';

/**
 * コンストラクタ引数
 */
export interface ConstructorArguments {
  dataTreeName?: string;
  isProduction?: boolean;
  collectionName: string;
}

/**
 * Firebase Realtime Database データ操作クラス
 */
export class FirebaseRealtimeDatabase {
  private options: ConstructorArguments;
  constructor(options: ConstructorArguments) {
    this.options = options;
  }

  /**
   * データをDBに追加し、追加したレコードを返します
   */
  async addRecord<T>(data: T): Promise<{ recordBase: RecordBase; data: T }> {
    const dbRef = ref(getDatabase(), this.getDataFullTreeName(this.options));
    const recordId = DbKeyUtils.generateDbKey();
    const recordRef = child(dbRef, recordId);
    const createDateTime = FirebaseRealtimeDatabase.convertDbKeyToDate(recordId);
    const addData = {
      ...data,
      updated_at: FirebaseRealtimeDatabase.convertDateTimeStringToDbDateTimeString(createDateTime),
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
  async getRecordById<T>(id: string): Promise<{ recordBase: RecordBase; data: T } | null> {
    const dbRef = ref(getDatabase(), this.getDataFullTreeName(this.options));
    const recordRef = child(dbRef, id);
    const recordSnapshot = await get(recordRef);
    if (recordSnapshot.exists()) {
      const recordData = recordSnapshot.val();
      return {
        recordBase: {
          id: id,
          created_at: FirebaseRealtimeDatabase.convertDbKeyToDate(id),
          updated_at: FirebaseRealtimeDatabase.convertStringToDateTime(recordData.updated_at),
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
  async getAllRecords<T>(): Promise<{ recordBase: RecordBase; data: T }[]> {
    const dbRef = ref(getDatabase(), this.getDataFullTreeName(this.options));
    const recordsRef = query(dbRef, orderByKey());
    const recordsSnapshot = await get(recordsRef);
    if (recordsSnapshot.exists()) {
      const data = recordsSnapshot.val();
      return Object.entries(data).map(([id, value]) => ({
        data: value as T,
        recordBase: {
          id,
          created_at: FirebaseRealtimeDatabase.convertDbKeyToDate(id),
          updated_at: FirebaseRealtimeDatabase.convertStringToDateTime((value as any).updated_at),
        } as RecordBase,
      }));
    } else {
      return [];
    }
  }

  /**
   * DBのレコードを更新します
   */
  async updateRecord<T extends { id?: any }>(data: T, id: string): Promise<{ recordBase: RecordBase; data: T }> {
    const dbRef = ref(getDatabase(), this.getDataFullTreeName(this.options));
    const recordRef = child(dbRef, id);
    const updateDateTime = new Date();
    const updateData = {
      ...data,
      updated_at: FirebaseRealtimeDatabase.convertDateTimeStringToDbDateTimeString(updateDateTime),
    };
    const { id: _, ...updateDataWithoutId } = updateData; // 更新データ部分から項目「id」を除去
    await set(recordRef, updateDataWithoutId);
    return {
      recordBase: {
        id: id,
        created_at: FirebaseRealtimeDatabase.convertDbKeyToDate(id),
        updated_at: updateDateTime,
      },
      data,
    };
  }

  /**
   * DBからレコードを削除します
   */
  async deleteRecord<T>(id: string): Promise<string> {
    const dbRef = ref(getDatabase(), this.getDataFullTreeName(this.options));
    const recordRef = child(dbRef, id);
    await remove(recordRef);
    return id;
  }

  /**
   * DBから古いレコードを削除します
   */
  async deleteOldRecordsFromDb<T>(deletionDateTime: Date) {
    // 基準年月日のDBキーを生成
    const deletionDbKeyEndAt = `${DbKeyUtils.generateDbKeyDateTimePart(deletionDateTime)}${'z'.repeat(32)}`;
    // データベースから基準年月日以前のデータを取得し、削除
    const dbRef = ref(getDatabase(), this.getDataFullTreeName(this.options));
    const oldRecordQuery = query(dbRef, orderByKey(), endAt(deletionDbKeyEndAt));
    const snapshot = await get(oldRecordQuery);
    snapshot.forEach((childSnapshot) => {
      remove(childSnapshot.ref);
    });
  }

  /**
   * 各状態を判定し、データツリー名を取得します
   */
  getDataFullTreeName(options: ConstructorArguments): string {
    if (options.dataTreeName) {
      return `${options.dataTreeName}/${options.collectionName}`;
    } else if (options.isProduction) {
      return `${FIREBASE_REALTIME_DATABASE_DATA_TREE_NAME.DATA_TREE_NAME_PRODUCTION}/${options.collectionName}`;
    } else {
      return `${FIREBASE_REALTIME_DATABASE_DATA_TREE_NAME.DATA_TREE_NAME_STAGING}/${options.collectionName}`;
    }
  }
}

/**
 * Firebase Realtime Database 関連の関数
 */
export module FirebaseRealtimeDatabase {
  /**
   * DBのキーを日時に変換します
   */
  export function convertDbKeyToDate(dbKey: string): Date {
    return DbKeyUtils.extractDateFromDbKey(dbKey) as Date;
  }

  /**
   * DBでは文字列として格納されていた値を日時に変換します
   */
  export function convertStringToDateTime(dateString: string): Date | undefined;
  export function convertStringToDateTime(dateTime: Date | undefined): Date | undefined;
  export function convertStringToDateTime(dateString: string | Date | undefined): Date | undefined {
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

  /**
   * boolean をDB格納可能な文字列に変換します
   */
  export function convertBooleanToString(value: boolean): string;
  export function convertBooleanToString(value: string): string;
  export function convertBooleanToString(value: boolean | string): string {
    return value ? 'true' : 'false';
  }
  /**
   * DBでは文字列として格納されていた値を boolean に変換します
   */

  export function convertStringToBoolean(value: string): boolean;
  export function convertStringToBoolean(value: boolean): boolean;
  export function convertStringToBoolean(value: string | boolean): boolean {
    return value === 'true';
  }

  /**
   * 文字列が10MB以下であるかを判定します（項目に格納できる最大サイズが10MB）
   */
  export function isWithin10MBLimit(input: string): boolean {
    // 文字列をUTF-8バイト配列にエンコード
    const utf8Bytes = new TextEncoder().encode(input);
    // UTF-8バイト配列の長さが10MB以下であるかを判定
    return utf8Bytes.length <= 10485760; // 10MB (10485760 bytes)
  }
}
