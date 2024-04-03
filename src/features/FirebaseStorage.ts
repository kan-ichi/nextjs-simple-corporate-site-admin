import { FIREBASE_REALTIME_DATABASE_DATA_TREE_NAME } from '@/common/constants/firebaseRealtimeDatabase';
import {
  StorageReference,
  deleteObject,
  getDownloadURL,
  getStorage,
  ref,
  uploadBytesResumable,
} from 'firebase/storage';

/**
 * コンストラクタ引数
 */
export interface ConstructorArguments {
  dataTreeName?: string;
  isProduction?: boolean;
}

/**
 * Firebase Storage 関連の機能
 */
export class FirebaseStorage {
  private options?: ConstructorArguments;
  constructor(options?: ConstructorArguments) {
    this.options = options;
  }

  /**
   * ファイルを Firebase Storage の images ディレクトリにアップロードします
   */
  async uploadImageFile(file: File, fileName: string): Promise<string> {
    try {
      const storage = getStorage();
      const fileRef = ref(storage, this.getDataFullTreeName(fileName));
      // メタデータを設定する
      const metadata = {
        contentType: file.type, // ファイルの種類を指定する
      };
      // ファイルのアップロードとメタデータの設定を同時に行う
      const uploadTask = uploadBytesResumable(fileRef, file, metadata);
      await uploadTask;
      const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
      return downloadURL;
    } catch (error) {
      console.error('Error uploading file: ', error);
      throw error;
    }
  }

  /**
   * ファイルの URL を Firebase Storage の images ディレクトリから取得します
   */
  async getImageFileURL(fileName: string): Promise<string | null> {
    try {
      const storage = getStorage();
      const fileRef = ref(storage, this.getDataFullTreeName(fileName));
      return await getDownloadURL(fileRef);
    } catch (error) {
      // 'any' 型への型アサーションを使用してエラーオブジェクトの型を明示的に指定
      const errorCode = (error as any).code;
      if (errorCode === 'storage/object-not-found') {
        // ファイルが存在しない場合、nullを返す
        return null;
      } else {
        // その他のエラーの場合、エラーをスローする
        console.error('Error getting FileURL: ', error);
        throw error;
      }
    }
  }

  /**
   * ファイルを Firebase Storage の images ディレクトリから削除します
   */
  async deleteImageFile(fileName: string) {
    try {
      const storage = getStorage();
      const fileRef = ref(storage, this.getDataFullTreeName(fileName));
      await deleteObject(fileRef);
    } catch (error) {
      // 'any' 型への型アサーションを使用してエラーオブジェクトの型を明示的に指定
      const errorCode = (error as any).code;
      if (errorCode === 'storage/object-not-found') {
        // ファイルが存在しない場合、何もしない
        return;
      } else {
        // その他のエラーの場合、エラーをスローする
        console.error('Error deleting file: ', error);
        throw error;
      }
    }
  }

  /**
   * 各状態を判定し StorageReference を生成します。
   */
  private createFileRef(fileName: string): StorageReference {
    const storage = getStorage();
    return ref(storage, this.getDataFullTreeName(fileName));
  }

  /**
   * 各状態を判定し、データツリー名を取得します
   */
  private getDataFullTreeName(fileName: string): string {
    if (this.options?.dataTreeName) {
      return `${this.options.dataTreeName}/${fileName}`;
    } else if (this.options?.isProduction) {
      return `${FIREBASE_REALTIME_DATABASE_DATA_TREE_NAME.DATA_TREE_NAME_PRODUCTION}/images/${fileName}`;
    } else {
      return `${FIREBASE_REALTIME_DATABASE_DATA_TREE_NAME.DATA_TREE_NAME_STAGING}/images/${fileName}`;
    }
  }
}
