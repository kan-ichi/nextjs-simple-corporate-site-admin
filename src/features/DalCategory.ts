import { FIREBASE_REALTIME_DATABASE_COLLECTION_NAME } from '@/common/constants/firebaseRealtimeDatabase';
import { Category, CategoryRecord } from '@/common/types/Category';
import { FirebaseRealtimeDatabase } from '@/features/FirebaseRealtimeDatabase';

/**
 * コンストラクタ引数
 */
export interface ConstructorArguments {
  dataTreeName?: string;
  isProduction?: boolean;
}

/**
 * Category データアクセスレイヤー
 */
export class DalCategory {
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
      collectionName: FIREBASE_REALTIME_DATABASE_COLLECTION_NAME.COLLECTION_NAME_CATEGORIES,
    });
  }

  /**
   * Category をDBに追加し、追加したレコードを返します
   */
  async addCategory(data: Category): Promise<CategoryRecord> {
    const dal = this.createFirebaseRealtimeDatabase();
    const record = await dal.addRecord(data);
    return { ...record.recordBase, ...record.data };
  }

  /**
   * DBから Category を取得します
   */
  async getCategoryById(id: string): Promise<CategoryRecord | undefined> {
    const dal = this.createFirebaseRealtimeDatabase();
    const record = await dal.getRecordById(id);
    return record ? { ...(record.data as Category), ...record.recordBase } : undefined;
  }

  /**
   * DBから Category を全件取得します
   */
  async getAllCategory(): Promise<CategoryRecord[]> {
    const dal = this.createFirebaseRealtimeDatabase();
    const records = await dal.getAllRecords();
    return records.map((record): CategoryRecord => ({ ...(record.data as Category), ...record.recordBase }));
  }

  /**
   * DBの Category を更新します
   */
  async updateCategory(data: CategoryRecord): Promise<CategoryRecord> {
    const dal = this.createFirebaseRealtimeDatabase();
    const record = await dal.updateRecord(data, data.id);
    return { ...record.recordBase, ...record.data };
  }

  /**
   * DBから Category を削除します
   */
  async deleteCategory(id: string): Promise<void> {
    const dal = this.createFirebaseRealtimeDatabase();
    await dal.deleteRecord(id);
  }
}
