import { StorageError, deleteObject, getDownloadURL, getStorage, ref, uploadBytesResumable } from 'firebase/storage';

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
      // アップロード状況を監視する
      uploadTask.on(
        'state_changed',
        (snapshot) => {
          const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
          console.log(`Upload is ${progress}% done`);
        },
        (error) => {
          console.error('Error uploading file: ', error);
          throw error;
        }
      );
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
  export async function getImageFileURL(fileName: string): Promise<string> {
    try {
      const fileRef = ref(getStorage(), `/images/${fileName}`);
      return await getDownloadURL(fileRef);
    } catch (error) {
      console.error('Error getting FileURL: ', error);
      throw error;
    }
  }

  /**
   * ファイルを Firebase Storage の images ディレクトリから取得します
   */
  export async function getImageFile(fileName: string): Promise<File | null> {
    try {
      const fileRef = ref(getStorage(), `/images/${fileName}`);
      const downloadURL = await getDownloadURL(fileRef);
      console.log(`Download URL: ${downloadURL}`);
      const response = await fetch(downloadURL);
      const blob = await response.blob();
      const file = new File([blob], fileName);
      return file;
    } catch (error) {
      if (error instanceof StorageError && error.code === 'object-not-found') {
        return null;
      } else {
        console.error('Error getting file: ', error);
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
