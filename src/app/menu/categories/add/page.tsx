'use client';

import { Category } from '@/common/types/Category';
import { DalCategory } from '@/features/DalCategory';
import { Button, Form, Input, message } from 'antd';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

export default function AddCategoryPage() {
  const [form] = Form.useForm();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (values: Category) => {
    setIsLoading(true);
    try {
      await DalCategory.addCategory(values);
      message.success('カテゴリーが正常に登録されました');
      form.resetFields();
      router.push('/menu/categories');
    } catch (error) {
      console.error('Failed to add category:', error);
      message.error('カテゴリーの登録に失敗しました');
    }
    setIsLoading(false);
  };

  return (
    <div className="p-8">
      <h1>新規カテゴリー登録</h1>
      <Form form={form} onFinish={handleSubmit}>
        <Form.Item
          name="name"
          label="カテゴリー名"
          rules={[{ required: true, message: 'カテゴリー名を入力してください' }]}
        >
          <Input />
        </Form.Item>

        <Form.Item>
          <Button type="primary" htmlType="submit" loading={isLoading}>
            登録
          </Button>
          <Button className="ml-2" onClick={() => router.push('/menu/categories')} type="default">
            キャンセル
          </Button>
        </Form.Item>
      </Form>
    </div>
  );
}
