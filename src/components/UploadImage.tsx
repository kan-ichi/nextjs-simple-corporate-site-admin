import { FirebaseRealtimeDatabase } from '@/features/FirebaseRealtimeDatabase';
import { FirebaseStorage } from '@/features/FirebaseStorage';
import { PlusOutlined } from '@ant-design/icons';
import { Modal, Upload, message } from 'antd';
import { UploadFile } from 'antd/lib/upload/interface';
import { useEffect, useState } from 'react';

interface UploadImageProps {
  existingFileName?: string;
  isImageFileAddedCallback: (isImageFileAdded: boolean) => void;
  isImageFileDeletedCallback: (isImageFileDeleted: boolean) => void;
  fileUploadedCallback: (uploadedFile: File | null) => void;
}

export default function UploadImage({
  existingFileName,
  isImageFileAddedCallback,
  isImageFileDeletedCallback,
  fileUploadedCallback,
}: UploadImageProps) {
  const [imageFileList, setImageFileList] = useState<UploadFile[]>(new Array());

  // 既存の画像ファイルを表示します
  useEffect(() => {
    if (!existingFileName) return;
    FirebaseStorage.getImageFileURL(existingFileName).then((url) => {
      if (url) {
        setImageFileList([
          {
            uid: '-1',
            name: existingFileName,
            status: 'done',
            url: url,
          },
        ]);
      }
    });
  }, [existingFileName]);

  /**
   * プレビュー領域から画像ファイルを削除し、削除した旨をコールバック関数に通知します
   */
  const handleRemove = (file: UploadFile) => {
    const updatedFileList = imageFileList.filter((f) => f.uid !== file.uid);
    if (updatedFileList.length === 0) {
      isImageFileDeletedCallback(true);
      isImageFileAddedCallback(false);
      fileUploadedCallback(null);
    }
    setImageFileList(updatedFileList);
  };

  /**
   * 画像アップロードをコールバック関数に通知し、アップロードした画像をプレビュー領域に表示します
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
        isImageFileAddedCallback(true);
        isImageFileDeletedCallback(false);
        fileUploadedCallback(file);
        previewImage(file);
      }
    };
    fileReader.readAsDataURL(file);

    return Upload.LIST_IGNORE;
  };

  /**
   * 画像をプレビュー領域に表示します
   */
  const previewImage = (file: File | null) => {
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
      <div>
        <PlusOutlined />
        <div style={{ marginTop: 8 }}>画像をアップロード</div>
      </div>
    </Upload>
  );
}
