'use client';
import { useAppGlobalContextValue } from '@/common/contexts/AppGlobalContext';
import { Business } from '@/common/types/Business';
import UploadImage from '@/components/UploadImage';
import { DalBusiness } from '@/features/DalBusiness';
import { FirebaseStorage } from '@/features/FirebaseStorage';
import { Button, Form, Input, message } from 'antd';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

export default function AddBusinessPage() {
  const [appGlobalContextValue, setAppGlobalContextValue] = useAppGlobalContextValue();
  const [form] = Form.useForm();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [isImageFileAdded, setIsImageFileAdded] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);

  const handleSubmit = async (values: Business) => {
    setIsLoading(true);
    try {
      const businessData: Business = {
        ...values,
        logo_url: values.logo_url || '',
        service_url: values.service_url || '',
      };
      const addedRecord = await new DalBusiness().addBusiness(businessData);
      if (isImageFileAdded && uploadedFile) {
        const uploadedImageUrl = await FirebaseStorage.uploadImageFile(uploadedFile, addedRecord.id);
        await new DalBusiness().updateBusiness({
          ...addedRecord,
          imagefile_url: uploadedImageUrl,
        });
      }

      message.success('事業内容が正常に登録されました');
      form.resetFields();
      router.push('/menu/businesses');
    } catch (error) {
      console.error('事業内容の登録に失敗しました:', error);
      message.error('事業内容の登録に失敗しました');
    }

    setIsLoading(false);
  };

  return (
    <div className="p-8">
      <h1>事業内容登録</h1>
      <Form form={form} onFinish={handleSubmit}>
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
          isImageFileAddedCallback={(value: boolean) => setIsImageFileAdded(value)}
          isImageFileDeletedCallback={() => {}}
          fileUploadedCallback={(value: File | null) => setUploadedFile(value)}
        />
        <Form.Item>
          <Button type="primary" htmlType="submit" loading={isLoading}>
            登録
          </Button>
          <Button className="ml-2" onClick={() => router.push('/menu/businesses')} type="default" loading={isLoading}>
            キャンセル
          </Button>
        </Form.Item>
      </Form>
    </div>
  );
}
