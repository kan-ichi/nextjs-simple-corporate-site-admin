'use client';
import { MemberRecord } from '@/common/types/Member';
import { DbKeyUtils } from '@/common/utils/DbKeyUtils';
import UploadImage from '@/components/UploadImage';
import { DalMember } from '@/features/DalMember';
import { FirebaseStorage } from '@/features/FirebaseStorage';
import { ExclamationCircleOutlined } from '@ant-design/icons';
import { Button, Form, Input, Modal, message } from 'antd';
import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function MemberDetailsPage() {
  const [form] = Form.useForm();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [memberData, setMemberData] = useState<MemberRecord | null>(null);
  const searchParams = useSearchParams();
  const id = DbKeyUtils.convertBase62ToDbKey(searchParams.get('id') as string);
  const [isImageFileAdded, setIsImageFileAdded] = useState(false);
  const [isImageFileDeleted, setIsImageFileDeleted] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);

  useEffect(() => {
    const fetchMemberData = async () => {
      try {
        const member = await DalMember.getMemberById(id);
        if (!member) {
          message.error('メンバーを取得できません');
          router.push('/menu/members');
          return;
        }
        setMemberData(member);
        form.setFieldsValue(member);
      } catch (error) {
        console.error('Failed to fetch member data:', error);
      }
    };
    fetchMemberData();
  }, []);

  const handleUpdate = async (values: MemberRecord) => {
    setIsLoading(true);
    try {
      if (isImageFileAdded && uploadedFile) {
        await FirebaseStorage.uploadImageFile(uploadedFile, id);
      }
      if (isImageFileDeleted) {
        await FirebaseStorage.deleteImageFile(id);
      }
      const updatedMember: MemberRecord = {
        ...values,
        id,
      };
      await DalMember.updateMember(updatedMember);
      message.success('メンバーが正常に更新されました');
      router.push('/menu/members');
    } catch (error) {
      console.error('Failed to update member:', error);
      message.error('メンバーの更新に失敗しました');
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
          await DalMember.deleteMember(id);
          message.success('メンバーが正常に削除されました');
          router.push('/menu/members');
        } catch (error) {
          console.error('Failed to delete member:', error);
          message.error('メンバーの削除に失敗しました');
        }
      },
    });
  };

  return (
    <div className="p-8">
      <h1>メンバー編集</h1>
      {memberData ? (
        <Form form={form} onFinish={handleUpdate} initialValues={memberData}>
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
            <Button className="m-1" onClick={() => router.push('/menu/members')} type="default" loading={isLoading}>
              キャンセル
            </Button>
          </Form.Item>
        </Form>
      ) : (
        <p>メンバーデータを読み込み中...</p>
      )}
    </div>
  );
}