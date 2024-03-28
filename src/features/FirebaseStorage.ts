import { deleteObject, getDownloadURL, getStorage, ref, uploadBytesResumable } from 'firebase/storage';

/**
 * Firebase Storage 関連の機能
 */
export module FirebaseStorage {
  /**
   * ファイルを Firebase Storage の images ディレクトリにアップロードします
   */
  export async function uploadImageFile(file: File, fileName: string): Promise<string> {
    try {
      const fileRef = ref(getStorage(), `/images/${fileName}`);
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
  export async function getImageFileURL(fileName: string): Promise<string | null> {
    const fileRef = ref(getStorage(), `/images/${fileName}`);
    try {
      return await getDownloadURL(fileRef);
    } catch (error) {
      // 'any' 型への型アサーションを使用してエラーオブジェクトの型を明示的に指定します。
      const errorCode = (error as any).code;
      if (errorCode === 'storage/object-not-found') {
        // ファイルが存在しない場合、nullを返します。
        return null;
      } else {
        // その他のエラーの場合、エラーをスローします。
        console.error('Error getting FileURL: ', error);
        throw error;
      }
    }
  }

  /**
   * ファイルを Firebase Storage の images ディレクトリから削除します
   */
  export async function deleteImageFile(fileName: string) {
    try {
      const fileRef = ref(getStorage(), `/images/${fileName}`);
      await deleteObject(fileRef);
    } catch (error) {
      console.error('Error deleting file: ', error);
      throw error;
    }
  }
}
