import { FirebaseRealtimeDatabase } from '@/features/FirebaseRealtimeDatabase';
import { PlusOutlined } from '@ant-design/icons';
import { Modal, Upload, message } from 'antd';
import { UploadFile } from 'antd/lib/upload/interface';
import { useState } from 'react';

interface UploadImageProps {
  initialImageFileList: UploadFile[];
  onImageFileListChange: (fileList: UploadFile[]) => void;
  onImageFileRemoved: () => void;
}

export default function UploadImage({
  initialImageFileList,
  onImageFileListChange,
  onImageFileRemoved,
}: UploadImageProps) {
  const [imageFileList, setImageFileList] = useState<UploadFile[]>(initialImageFileList);

  const handleRemove = (file: UploadFile) => {
    const updatedFileList = imageFileList.filter((f) => f.uid !== file.uid);
    setImageFileList(updatedFileList);
    onImageFileListChange(updatedFileList);
    if (updatedFileList.length === 0) {
      onImageFileRemoved();
    }
  };

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
        onImageFileListChange(newFileList);
      };
      reader.readAsDataURL(file);
    } else {
      setImageFileList([]);
      onImageFileListChange([]);
    }
  };

  const handleBeforeUpload = (file: File) => {
    const isValidType = file.type.startsWith('image/');
    if (!isValidType) {
      message.error('画像ファイルを選択してください');
      return isValidType || Upload.LIST_IGNORE;
    }

    const fileReader = new FileReader();
    fileReader.onload = () => {
      const base64String = fileReader.result as string;
      if (!FirebaseRealtimeDatabase.isWithin10MBLimit(base64String)) {
        Modal.error({
          title: 'エラー',
          content: '画像サイズが10MB以上のため、アップロードできません。',
        });
        return Upload.LIST_IGNORE; // Base64エンコーディングが完了したら処理を終了
      } else {
        handlePreviewImage(file); // 10MB以下の場合のみhandlePreviewImageを呼び出す
      }
    };
    fileReader.readAsDataURL(file);

    return Upload.LIST_IGNORE; // FileReaderの処理が完了するまで待機
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
