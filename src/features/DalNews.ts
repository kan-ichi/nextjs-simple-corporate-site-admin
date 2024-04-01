import { FIREBASE_REALTIME_DATABASE_COLLECTION_NAME } from '@/common/constants/firebaseRealtimeDatabase';
import { News, NewsRecord } from '@/common/types/News';
import { FirebaseRealtimeDatabase } from '@/features/FirebaseRealtimeDatabase';

/**
 * News データアクセスレイヤー
 */
export module DalNews {
  /**
   * Firebase Realtime Database DBコレクション名
   */
  const COLLECTION_NAME = FIREBASE_REALTIME_DATABASE_COLLECTION_NAME.COLLECTION_NAME_NEWS;

  /**
   * News をDBに追加し、追加したレコードを返します
   */
  export async function addNews(data: News): Promise<NewsRecord> {
    const dal = new FirebaseRealtimeDatabase({ collectionName: COLLECTION_NAME });
    const record = await dal.addRecord({
      ...data,
      release_date: FirebaseRealtimeDatabase.convertDateTimeStringToDbDateTimeString(data.release_date),
    });
    return {
      ...record.recordBase,
      ...record.data,
    };
  }

  /**
   * DBから News を取得します
   */
  export async function getNewsById(id: string): Promise<NewsRecord | undefined> {
    const dal = new FirebaseRealtimeDatabase({ collectionName: COLLECTION_NAME });
    const record = await dal.getRecordById(id);
    return record ? { ...(record.data as News), ...record.recordBase } : undefined;
  }

  /**
   * DBから News を全件取得します
   */
  export async function getAllNews(): Promise<NewsRecord[]> {
    const dal = new FirebaseRealtimeDatabase({ collectionName: COLLECTION_NAME });
    const records = await dal.getAllRecords();
    return records.map((record): NewsRecord => ({ ...(record.data as News), ...record.recordBase }));
  }

  /**
   * DBの News を更新します
   */
  export async function updateNews(data: NewsRecord): Promise<NewsRecord> {
    const dal = new FirebaseRealtimeDatabase({ collectionName: COLLECTION_NAME });
    const record = await dal.updateRecord(
      { ...data, release_date: FirebaseRealtimeDatabase.convertDateTimeStringToDbDateTimeString(data.release_date) },
      data.id
    );
    return {
      ...record.recordBase,
      ...record.data,
    };
  }

  /**
   * DBから News を削除します
   */
  export async function deleteNews(id: string): Promise<void> {
    const dal = new FirebaseRealtimeDatabase({ collectionName: COLLECTION_NAME });
    await dal.deleteRecord(id);
  }
}
