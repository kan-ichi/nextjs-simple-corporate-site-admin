'use client';
import { CategoryRecord } from '@/common/types/Category';
import { News } from '@/common/types/News';
import DatePickerJapanese from '@/components/DatePickerJapanese';
import UploadImage from '@/components/UploadImage';
import { DalCategory } from '@/features/DalCategory';
import { DalNews } from '@/features/DalNews';
import { FirebaseStorage } from '@/features/FirebaseStorage';
import { Button, Form, Input, Select, message } from 'antd';
import dayjs from 'dayjs';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
const { Option } = Select;

export default function AddNewsPage() {
  const [form] = Form.useForm();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [categoryRecords, setCategoryRecords] = useState<CategoryRecord[]>([]);
  const [isImageFileAdded, setIsImageFileAdded] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);

  useEffect(() => {
    const fetchCategories = async () => {
      const fetchedCategories = await DalCategory.getAllCategory();
      setCategoryRecords(fetchedCategories);
    };
    fetchCategories();
  }, []);

  const handleSubmit = async (values: News) => {
    setIsLoading(true);
    try {
      const addedRecord = await DalNews.addNews(values);
      if (isImageFileAdded && uploadedFile) {
        await FirebaseStorage.uploadImageFile(uploadedFile, addedRecord.id);
      }
      message.success('ニュースが正常に登録されました');
      form.resetFields();
      router.push('/menu/news');
    } catch (error) {
      console.error('Failed to add news:', error);
      message.error('ニュースの登録に失敗しました');
    }
    setIsLoading(false);
  };

  return (
    <div className="p-8">
      <h1>新規ニュース登録</h1>
      <Form form={form} onFinish={handleSubmit}>
        <Form.Item
          name="release_date"
          label="リリース日"
          getValueProps={(value) => ({
            value: value ? dayjs(value) : null,
          })}
          rules={[
            {
              required: true,
              message: 'リリース日を入力してください',
            },
            {
              validator: (_, value) => {
                if (!value) {
                  return Promise.resolve();
                }
                const dayJsValue = dayjs(value);
                if (dayJsValue.isValid()) {
                  return Promise.resolve();
                }
                return Promise.reject(new Error('不正な日付形式です'));
              },
            },
          ]}
        >
          <DatePickerJapanese
            format="YYYY/MM/DD"
            onChange={(date, dateString) => {
              form.setFieldsValue({ release_date: date ? date.toDate() : null });
            }}
          />
        </Form.Item>
        <Form.Item name="category_id" label="カテゴリー">
          <Select>
            <Option value="">（選択してください）</Option>
            {categoryRecords.map((category) => (
              <Option key={category.id} value={category.id}>
                {category.name}
              </Option>
            ))}
          </Select>
        </Form.Item>
        <Form.Item name="title" label="タイトル" rules={[{ required: true, message: 'タイトルを入力してください' }]}>
          <Input />
        </Form.Item>
        <Form.Item name="description" label="説明" rules={[{ required: true, message: '説明を入力してください' }]}>
          <Input.TextArea rows={4} />
        </Form.Item>
        <Form.Item name="content" label="内容" rules={[{ required: true, message: '内容を入力してください' }]}>
          <Input.TextArea rows={6} />
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
          <Button className="ml-2" onClick={() => router.push('/menu/news')} type="default" loading={isLoading}>
            キャンセル
          </Button>
        </Form.Item>
      </Form>
    </div>
  );
}
