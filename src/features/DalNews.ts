import { FIREBASE_REALTIME_DATABASE } from '@/common/constants/firebaseRealtimeDatabase';
import { News, NewsRecord } from '@/common/types/News';
import { FirebaseRealtimeDatabase } from '@/features/FirebaseRealtimeDatabase';

/**
 * News データアクセスレイヤー
 */
export module DalNews {
  /**
   * News をDBに追加し、追加したレコードを返します
   */
  export async function addNews(data: News): Promise<NewsRecord> {
    const record = await FirebaseRealtimeDatabase.addRecord(FIREBASE_REALTIME_DATABASE.COLLECTION_NAME_NEWS, data);
    return { ...record.recordBase, ...record.data };
  }

  /**
   * DBから News を全件取得します
   */
  export async function getAllNews(): Promise<NewsRecord[]> {
    const records = await FirebaseRealtimeDatabase.getAllRecords(FIREBASE_REALTIME_DATABASE.COLLECTION_NAME_NEWS);
    return records.map((record) => ({ ...record.recordBase, ...(record.data as News) }));
  }
}