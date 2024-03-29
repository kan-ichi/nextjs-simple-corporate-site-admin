'use client';
import { Business, BusinessRecord } from '@/common/types/Business';
import { DbKeyUtils } from '@/common/utils/DbKeyUtils';
import UploadImage from '@/components/UploadImage';
import { DalBusiness } from '@/features/DalBusiness';
import { FirebaseStorage } from '@/features/FirebaseStorage';
import { ExclamationCircleOutlined } from '@ant-design/icons';
import { Button, Form, Input, Modal, message } from 'antd';
import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function BusinessDetailsPage() {
  const [form] = Form.useForm();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [businessData, setBusinessData] = useState<BusinessRecord | null>(null);
  const searchParams = useSearchParams();
  const id = DbKeyUtils.convertBase62ToDbKey(searchParams.get('id') as string);
  const [isImageFileAdded, setIsImageFileAdded] = useState(false);
  const [isImageFileDeleted, setIsImageFileDeleted] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);

  useEffect(() => {
    const fetchBusinessData = async () => {
      try {
        const business = await DalBusiness.getBusinessById(id);
        if (!business) {
          message.error('事業内容を取得できません');
          router.push('/menu/businesses');
          return;
        }
        setBusinessData(business);
        form.setFieldsValue(business);
      } catch (error) {
        console.error('Failed to fetch business data:', error);
      }
    };
    fetchBusinessData();
  }, []);

  const handleUpdate = async (values: BusinessRecord) => {
    setIsLoading(true);
    let uploadedImageUrl: string = values.imagefile_url || '';
    try {
      if (isImageFileAdded && uploadedFile) {
        uploadedImageUrl = await FirebaseStorage.uploadImageFile(uploadedFile, id);
      }
      if (isImageFileDeleted) {
        await FirebaseStorage.deleteImageFile(id);
        uploadedImageUrl = '';
      }
      const updatedBusiness: BusinessRecord = {
        ...values,
        id,
        imagefile_url: uploadedImageUrl,
        logo_url: values.logo_url || '',
        service_url: values.service_url || '',
      };
      await DalBusiness.updateBusiness(updatedBusiness);
      message.success('事業内容が正常に更新されました');
      router.push('/menu/businesses');
    } catch (error) {
      console.error('Failed to update business:', error);
      message.error('事業内容の更新に失敗しました');
    }
    setIsLoading(false);
  };

  const handleDelete = async () => {
    Modal.confirm({
      title: '本当に削除しますか？',
      icon: <ExclamationCircleOutlined />,
      content: '削除すると元に戻すことはできません',
      okText: 'はい',
      okType: 'danger',
      cancelText: 'いいえ',
      maskClosable: true,
      onOk: async () => {
        try {
          FirebaseStorage.deleteImageFile(id);
          await DalBusiness.deleteBusiness(id);
          message.success('事業内容が正常に削除されました');
          router.push('/menu/businesses');
        } catch (error) {
          console.error('Failed to delete business:', error);
          message.error('事業内容の削除に失敗しました');
        }
      },
    });
  };

  return (
    <div className="p-8">
      <h1>事業内容編集</h1>
      {businessData ? (
        <Form form={form} onFinish={handleUpdate} initialValues={businessData}>
          <Form.Item name="logo_url" label="サービスロゴURL">
            <Input />
          </Form.Item>
          <Form.Item
            name="description"
            label="事業内容説明"
            rules={[{ required: true, message: '事業内容説明を入力してください' }]}
          >
            <Input.TextArea rows={4} />
          </Form.Item>
          <Form.Item name="service_url" label="サービスURL">
            <Input />
          </Form.Item>
          <UploadImage
            existingFileName={id}
            isImageFileAddedCallback={(value: boolean) => setIsImageFileAdded(value)}
            isImageFileDeletedCallback={(value: boolean) => setIsImageFileDeleted(value)}
            fileUploadedCallback={(value: File | null) => setUploadedFile(value)}
          />
          <Form.Item className="mt-3">
            <Button className="m-1" type="primary" htmlType="submit" loading={isLoading}>
              更新
            </Button>
            <Button className="m-1" danger onClick={handleDelete} loading={isLoading}>
              削除
            </Button>
            <Button className="m-1" onClick={() => router.push('/menu/businesses')} type="default" loading={isLoading}>
              キャンセル
            </Button>
          </Form.Item>
        </Form>
      ) : (
        <p>事業内容データを読み込み中...</p>
      )}
    </div>
  );
}
