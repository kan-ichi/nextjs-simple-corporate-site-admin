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
      const dal = new DalBusiness();
      const addedRecord = await dal.addBusiness(values);
      if (isImageFileAdded && uploadedFile) {
        const uploadedImageUrl = await new FirebaseStorage().uploadImageFile(uploadedFile, addedRecord.id);
        await dal.updateBusiness({ ...addedRecord, imagefile_url: uploadedImageUrl });
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
