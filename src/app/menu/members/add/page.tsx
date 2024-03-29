'use client';
import { Member } from '@/common/types/Member';
import UploadImage from '@/components/UploadImage';
import { DalMember } from '@/features/DalMember';
import { FirebaseStorage } from '@/features/FirebaseStorage';
import { Button, Form, Input, message } from 'antd';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

export default function AddMemberPage() {
  const [form] = Form.useForm();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [isImageFileAdded, setIsImageFileAdded] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);

  const handleSubmit = async (values: Member) => {
    setIsLoading(true);
    try {
      const addedRecord = await DalMember.addMember(values);
      if (isImageFileAdded && uploadedFile) {
        const uploadedImageUrl = await FirebaseStorage.uploadImageFile(uploadedFile, addedRecord.id);
        await DalMember.updateMember({ ...addedRecord, imagefile_url: uploadedImageUrl });
      }
      message.success('メンバーが正常に登録されました');
      form.resetFields();
      router.push('/menu/members');
    } catch (error) {
      console.error('Failed to add member:', error);
      message.error('メンバーの登録に失敗しました');
    }
    setIsLoading(false);
  };

  return (
    <div className="p-8">
      <h1>メンバー登録</h1>
      <Form form={form} onFinish={handleSubmit}>
        <Form.Item name="name" label="名前" rules={[{ required: true, message: '名前を入力してください' }]}>
          <Input />
        </Form.Item>
        <Form.Item name="position" label="役職" rules={[{ required: true, message: '役職を入力してください' }]}>
          <Input />
        </Form.Item>
        <Form.Item
          name="profile"
          label="プロフィール"
          rules={[{ required: true, message: 'プロフィールを入力してください' }]}
        >
          <Input.TextArea rows={4} />
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
          <Button className="ml-2" onClick={() => router.push('/menu/members')} type="default" loading={isLoading}>
            キャンセル
          </Button>
        </Form.Item>
      </Form>
    </div>
  );
}
