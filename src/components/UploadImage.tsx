import { PlusOutlined } from '@ant-design/icons';
import { Upload, message, Modal } from 'antd';
import { UploadFile } from 'antd/lib/upload/interface';
import React, { useState } from 'react';
import ReactCrop, { Crop } from 'react-image-crop';
import 'react-image-crop/dist/ReactCrop.css';

interface UploadImageProps {
  initialImageFileList: UploadFile[];
  onImageFileListChange: (fileList: UploadFile[]) => void;
  onImageFileRemoved: () => void;
  onCropImageComplete: (croppedAreaPixels: { width: number; height: number }) => void;
}

export default function UploadImage({
  initialImageFileList,
  onImageFileListChange,
  onImageFileRemoved,
  onCropImageComplete,
}: UploadImageProps) {
  const [imageFileList, setImageFileList] = useState<UploadFile[]>(initialImageFileList);
  const [upImg, setUpImg] = useState<string | null>(null);
  const [crop, setCrop] = useState<Crop>({
    unit: '%',
    x: 0,
    y: 0,
    width: 30,
    height: 16.6667, // 16:9のアスペクト比を維持するために計算
  });
  const [isModalVisible, setIsModalVisible] = useState(false);

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
        setUpImg(reader.result as string);
        setIsModalVisible(true);
      };
      reader.readAsDataURL(file);
    } else {
      setImageFileList([]);
      onImageFileListChange([]);
      setUpImg(null);
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

  const onCropChange = (c: Crop) => {
    setCrop(c);
  };

  const onCropComplete = (croppedArea: any, croppedAreaPixels: any) => {
    onCropImageComplete(croppedAreaPixels);
  };

  const handleOk = () => {
    setIsModalVisible(false);
  };

  const handleCancel = () => {
    setIsModalVisible(false);
  };

  return (
    <>
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
      <Modal title="画像のクロップ" visible={isModalVisible} onOk={handleOk} onCancel={handleCancel}>
        {upImg && (
          <ReactCrop crop={crop} onChange={onCropChange} onComplete={onCropComplete}>
            <img src={upImg} alt="Crop" />
          </ReactCrop>
        )}
      </Modal>
    </>
  );
}

// antd-img-crop を使用する場合
// import { PlusOutlined } from '@ant-design/icons';
// import { Upload, message } from 'antd';
// import { UploadFile } from 'antd/lib/upload/interface';
// import { useState } from 'react';
// import ImgCrop from 'antd-img-crop';

// interface UploadImageProps {
//   initialImageFileList: UploadFile[];
//   onImageFileListChange: (fileList: UploadFile[]) => void;
//   onImageFileRemoved: () => void;
// }

// export default function UploadImage({
//   initialImageFileList,
//   onImageFileListChange,
//   onImageFileRemoved,
// }: UploadImageProps) {

//   const [imageFileList, setImageFileList] = useState<UploadFile[]>(initialImageFileList);
//   const handleRemove = (file: UploadFile) => {
//     const updatedFileList = imageFileList.filter((f) => f.uid !== file.uid);
//     setImageFileList(updatedFileList);
//     onImageFileListChange(updatedFileList);
//     if (updatedFileList.length === 0) {
//       onImageFileRemoved();
//     }
//   };
//   const handlePreviewImage = (file: File | null) => {
//     if (file) {
//       const reader = new FileReader();
//       reader.onload = () => {
//         const newFileList: UploadFile[] = [
//           {
//             uid: '-1',
//             name: file.name,
//             status: 'done',
//             url: reader.result as string,
//           },
//         ];
//         setImageFileList(newFileList);
//         onImageFileListChange(newFileList);
//       };
//       reader.readAsDataURL(file);
//     } else {
//       setImageFileList([]);
//       onImageFileListChange([]);
//     }
//   };
//   const handleBeforeUpload = (file: File) => {
//     const isValidType = file.type.startsWith('image/');
//     if (!isValidType) {
//       message.error('画像ファイルを選択してください');
//     } else {
//       handlePreviewImage(file);
//     }
//     return isValidType || Upload.LIST_IGNORE;
//   };
//   return (
//     <ImgCrop>
//       <Upload
//         listType="picture-card"
//         maxCount={1}
//         showUploadList={{
//           showPreviewIcon: true,
//           showRemoveIcon: true,
//         }}
//         onRemove={handleRemove}
//         beforeUpload={handleBeforeUpload}
//         fileList={imageFileList}
//       >
//         <div>
//           <PlusOutlined />
//           <div style={{ marginTop: 8 }}>画像をアップロード</div>
//         </div>
//       </Upload>
//     </ImgCrop>
//   );
// }
