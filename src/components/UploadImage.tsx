import { FirebaseRealtimeDatabase } from '@/features/FirebaseRealtimeDatabase';
import { FirebaseStorage } from '@/features/FirebaseStorage';
import { PlusOutlined } from '@ant-design/icons';
import { Modal, Progress, Upload, message } from 'antd';
import { UploadFile } from 'antd/lib/upload/interface';
import { useEffect, useState } from 'react';

interface UploadImageProps {
  id: string;
  initialImageFileList: UploadFile[];
  onImageFileListChange: (fileList: UploadFile[]) => void;
  onImageFileRemoved: () => void;
}

export default function UploadImage({
  id,
  initialImageFileList,
  onImageFileListChange,
  onImageFileRemoved,
}: UploadImageProps) {
  const [imageFileList, setImageFileList] = useState<UploadFile[]>(initialImageFileList);
  const [existingImageUrl, setExistingImageUrl] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  useEffect(() => {
    // 既存の画像ファイルのURLを取得
    FirebaseStorage.getImageFileURL(id)
      .then(setExistingImageUrl)
      .catch(() => setExistingImageUrl(null));
  }, [id]);

  const handleRemove = (file: UploadFile) => {
    const updatedFileList = imageFileList.filter((f) => f.uid !== file.uid);
    if (updatedFileList.length === 0) {
      // 既存の画像ファイルを削除
      FirebaseStorage.deleteImageFile(id);
      setExistingImageUrl(null);
    }
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
        // FirebaseStorage.uploadImageFile(file, id)
        //   .on('state_changed', (snapshot) => {
        //     const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
        //     setUploadProgress(progress);
        //   })
        //   .then(() => {
        //     setUploading(false);
        //     setUploadProgress(0);
        //     getImageFileURL(id).then(setExistingImageUrl);
        //   })
        //   .catch((error) => {
        //     setUploading(false);
        //     setUploadProgress(0);
        //     console.error('Upload failed:', error);
        //   });
        await FirebaseStorage.uploadImageFile(file, id);
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
      {existingImageUrl ? (
        <img src={existingImageUrl} alt="Existing Image" style={{ maxWidth: '100%' }} />
      ) : uploading ? (
        <Progress type="circle" percent={uploadProgress} />
      ) : (
        <div>
          <PlusOutlined />
          <div style={{ marginTop: 8 }}>画像をアップロード</div>
        </div>
      )}
    </Upload>
  );
}
