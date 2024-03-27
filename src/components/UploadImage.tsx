import { PlusOutlined } from '@ant-design/icons';
import { Upload, message } from 'antd';
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
    } else {
      handlePreviewImage(file);
    }
    return isValidType || Upload.LIST_IGNORE;
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