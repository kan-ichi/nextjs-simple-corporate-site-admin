import { FIREBASE_REALTIME_DATABASE_COLLECTION_NAME } from '@/common/constants/firebaseRealtimeDatabase';
import { AppGlobalContextValue } from '@/common/contexts/AppGlobalContext';
import { News, NewsRecord } from '@/common/types/News';
import { FirebaseRealtimeDatabase } from '@/features/FirebaseRealtimeDatabase';

/**
 * コンストラクタ引数
 */
export interface ConstructorArguments {
  dataTreeName?: string;
  appGlobalContextValue?: AppGlobalContextValue;
}

/**
 * News データアクセスレイヤー
 */
export class DalNews {
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
      collectionName: FIREBASE_REALTIME_DATABASE_COLLECTION_NAME.COLLECTION_NAME_NEWS,
    });
  }

  /**
   * News をDBに追加し、追加したレコードを返します
   */
  async addNews(data: News): Promise<NewsRecord> {
    const dal = this.createFirebaseRealtimeDatabase();
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
  async getNewsById(id: string): Promise<NewsRecord | undefined> {
    const dal = this.createFirebaseRealtimeDatabase();
    const record = await dal.getRecordById(id);
    return record ? { ...(record.data as News), ...record.recordBase } : undefined;
  }

  /**
   * DBから News を全件取得します
   */
  async getAllNews(): Promise<NewsRecord[]> {
    const dal = this.createFirebaseRealtimeDatabase();
    const records = await dal.getAllRecords();
    return records.map((record): NewsRecord => ({ ...(record.data as News), ...record.recordBase }));
  }

  /**
   * DBの News を更新します
   */
  async updateNews(data: NewsRecord): Promise<NewsRecord> {
    const dal = this.createFirebaseRealtimeDatabase();
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
  async deleteNews(id: string): Promise<void> {
    const dal = this.createFirebaseRealtimeDatabase();
    await dal.deleteRecord(id);
  }
}
