import { FirebaseRealtimeDatabase } from '@/features/FirebaseRealtimeDatabase';
import { FirebaseStorage } from '@/features/FirebaseStorage';
import { PlusOutlined } from '@ant-design/icons';
import { Modal, Spin, Upload, message } from 'antd';
import { UploadFile } from 'antd/lib/upload/interface';
import { useEffect, useState } from 'react';

interface UploadImageProps {
  fileName: string;
  isImageFileExistCallback?: (isExist: boolean) => void;
}

export default function UploadImage({ fileName, isImageFileExistCallback }: UploadImageProps) {
  const [imageFileList, setImageFileList] = useState<UploadFile[]>(new Array());
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    // 既存の画像ファイルを取得しますS
    FirebaseStorage.getImageFileURL(fileName).then((url) => {
      if (url) {
        setImageFileList([
          {
            uid: '-1',
            name: fileName,
            status: 'done',
            url: url,
          },
        ]);
      }
    });
  }, [fileName]);

  /**
   * プレビュー領域から画像ファイルを削除し、削除した旨をコールバック関数に通知します
   */
  const handleRemove = (file: UploadFile) => {
    const updatedFileList = imageFileList.filter((f) => f.uid !== file.uid);
    if (updatedFileList.length === 0) {
      isImageFileExistCallback?.(false);
    }
    setImageFileList(updatedFileList);
  };

  /**
   * 画像をプレビュー領域に表示します
   */
  const handlePreviewImage = (file: File | null) => {
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        const newFileList: UploadFile[] = [
          {
            uid: '-1',
            name: file.name,
            status: 'done',
            url: reader.result as string,
          },
        ];
        setImageFileList(newFileList);
      };
      reader.readAsDataURL(file);
    } else {
      setImageFileList([]);
    }
  };

  /**
   * 画像をアップロードし、アップロードした画像をプレビュー領域に表示します
   */
  const handleBeforeUpload = (file: File) => {
    const isValidType = file.type.startsWith('image/');
    if (!isValidType) {
      message.error('画像ファイルを選択してください');
      return isValidType || Upload.LIST_IGNORE;
    }

    const fileReader = new FileReader();
    fileReader.onload = async () => {
      const base64String = fileReader.result as string;
      if (!FirebaseRealtimeDatabase.isWithin10MBLimit(base64String)) {
        Modal.error({
          title: 'エラー',
          content: '画像サイズが10MB以上のため、アップロードできません。',
        });
        return Upload.LIST_IGNORE;
      } else {
        setUploading(true);
        await FirebaseStorage.uploadImageFile(file, fileName);
        setUploading(false);
        handlePreviewImage(file);
      }
    };
    fileReader.readAsDataURL(file);

    return Upload.LIST_IGNORE;
  };

  return (
    <Upload
      listType="picture-card"
      maxCount={1}
      showUploadList={{
        showPreviewIcon: true,
        showRemoveIcon: true,
      }}
      onRemove={handleRemove}
      beforeUpload={handleBeforeUpload}
      fileList={imageFileList}
    >
      {uploading ? (
        <Spin size="large" />
      ) : (
        <div>
          <PlusOutlined />
          <div style={{ marginTop: 8 }}>画像をアップロード</div>
        </div>
      )}
    </Upload>
  );
}
