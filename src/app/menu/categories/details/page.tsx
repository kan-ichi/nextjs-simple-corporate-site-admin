'use client';
import { CategoryRecord } from '@/common/types/Category';
import { DbKeyUtils } from '@/common/utils/DbKeyUtils';
import { DalCategory } from '@/features/DalCategory';
import { ExclamationCircleOutlined } from '@ant-design/icons';
import { Button, Form, Input, Modal, message } from 'antd';
import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function CategoryDetailsPage() {
  const [form] = Form.useForm();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [categoryData, setCategoryData] = useState<CategoryRecord | null>(null);
  const searchParams = useSearchParams();
  const id = DbKeyUtils.convertBase62ToDbKey(searchParams.get('id') as string);

  useEffect(() => {
    const fetchCategoryData = async () => {
      try {
        const category = await DalCategory.getCategoryById(id);
        if (!category) {
          message.error('カテゴリーを取得できません');
          router.push('/menu/categories');
          return;
        }
        setCategoryData(category);
        form.setFieldsValue(category);
      } catch (error) {
        console.error('Failed to fetch category data:', error);
      }
    };
    fetchCategoryData();
  }, []);

  const handleUpdate = async (values: CategoryRecord) => {
    setIsLoading(true);
    try {
      const updatedCategory: CategoryRecord = {
        ...values,
        id,
      };
      await DalCategory.updateCategory(updatedCategory);
      message.success('カテゴリーが正常に更新されました');
      router.push('/menu/categories');
    } catch (error) {
      console.error('Failed to update category:', error);
      message.error('カテゴリーの更新に失敗しました');
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
          await DalCategory.deleteCategory(id);
          message.success('カテゴリーが正常に削除されました');
          router.push('/menu/categories');
        } catch (error) {
          console.error('Failed to delete category:', error);
          message.error('カテゴリーの削除に失敗しました');
        }
      },
    });
  };

  return (
    <div className="p-8">
      <h1>カテゴリー編集</h1>
      {categoryData ? (
        <Form form={form} onFinish={handleUpdate} initialValues={categoryData}>
          <Form.Item
            name="name"
            label="カテゴリー名"
            rules={[{ required: true, message: 'カテゴリー名を入力してください' }]}
          >
            <Input />
          </Form.Item>

          <Form.Item className="mt-3">
            <Button className="m-1" type="primary" htmlType="submit" loading={isLoading}>
              更新
            </Button>
            <Button className="m-1" danger onClick={handleDelete} loading={isLoading}>
              削除
            </Button>
            <Button className="m-1" onClick={() => router.push('/menu/categories')} type="default">
              キャンセル
            </Button>
          </Form.Item>
        </Form>
      ) : (
        <p>カテゴリーデータを読み込み中...</p>
      )}
    </div>
  );
}
