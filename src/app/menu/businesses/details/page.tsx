'use client';
import { useAppGlobalContextValue } from '@/common/contexts/AppGlobalContext';
import { BusinessRecord } from '@/common/types/Business';
import { DbKeyUtils } from '@/common/utils/DbKeyUtils';
import UploadImage from '@/components/UploadImage';
import { DalBusiness } from '@/features/DalBusiness';
import { FirebaseStorage } from '@/features/FirebaseStorage';
import { ExclamationCircleOutlined } from '@ant-design/icons';
import { Button, Form, Input, Modal, message } from 'antd';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function BusinessDetailsPage() {
  const [appGlobalContextValue, setAppGlobalContextValue] = useAppGlobalContextValue();
  const [form] = Form.useForm();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [id, setId] = useState('');
  const [businessData, setBusinessData] = useState<BusinessRecord | null>(null);
  const [isImageFileAdded, setIsImageFileAdded] = useState(false);
  const [isImageFileDeleted, setIsImageFileDeleted] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);

  useEffect(() => {
    // ページ表示時に、パラメーターから id を取得
    const handleRouteChange = () => {
      const queryId = window.location.search.split('?id=')[1];
      const convertedId = DbKeyUtils.convertBase62ToDbKey(queryId);
      setId(convertedId);

      fetchBusinessData(convertedId);
    };
    handleRouteChange(); // 初期レンダリング時にIDを取得
    window.addEventListener('popstate', handleRouteChange); // ページ遷移時のイベントリスナー
    return () => window.removeEventListener('popstate', handleRouteChange); // クリーンアップ関数
  }, []);

  /**
   * Business を取得します
   */
  const fetchBusinessData = async (convertedId: string) => {
    setIsLoading(true);
    try {
      const business = await new DalBusiness().getBusinessById(convertedId);
      if (!business) {
        message.error('事業内容を取得できません');
        router.push('/menu/businesses');
        return;
      }
      setBusinessData(business);
      form.setFieldsValue(business);
    } catch (error) {
      console.error('Failed to fetch business data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdate = async (values: BusinessRecord) => {
    setIsLoading(true);
    const fileManager = new FirebaseStorage();
    let uploadedImageUrl = values.imagefile_url;
    try {
      if (isImageFileAdded && uploadedFile) {
        const fileName = DbKeyUtils.reGenerateDbKey(id);
        uploadedImageUrl = await fileManager.uploadImageFile(uploadedFile, fileName);
      }
      if (isImageFileDeleted) {
        uploadedImageUrl = '';
      }
      const updatedBusiness: BusinessRecord = {
        ...values,
        id,
        imagefile_url: uploadedImageUrl,
        logo_url: values.logo_url || '',
        service_url: values.service_url || '',
      };
      await new DalBusiness().updateBusiness(updatedBusiness);
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
          await new DalBusiness().deleteBusiness(id);
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
            existingImagefileUrl={businessData.imagefile_url}
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
