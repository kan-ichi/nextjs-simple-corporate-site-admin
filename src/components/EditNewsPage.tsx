'use client';
import { NewsRecord } from '@/common/types/News';
import { DalNews } from '@/features/DalNews';
import { Button, Form, Input, message } from 'antd';
import { useParams, useRouter } from 'next/navigation';
import React, { useEffect, useState } from 'react';

export interface EditNewsPageProps {
  newsId: string;
}

const EditNewsPage: React.FC<EditNewsPageProps> = ({ newsId }) => {
  const [form] = Form.useForm();
  const router = useRouter();
  const [newsData, setNewsData] = useState<NewsRecord | null>(null);

  useEffect(() => {
    const fetchNewsData = async () => {
      try {
        if (newsId) {
          const news = await DalNews.getNewsById(newsId);
          if (!news) {
            message.error('ニュースを取得できません');
            router.push('/news');
            return;
          }
          setNewsData(news);
          form.setFieldsValue(news);
        }
      } catch (error) {
        console.error('Failed to fetch news data:', error);
      }
    };
    fetchNewsData();
  }, [newsId, form]);

  const handleUpdate = async (values: NewsRecord) => {
    try {
      await DalNews.updateNews({ ...values, id: newsId });
      message.success('ニュースが正常に更新されました');
      router.push('/news');
    } catch (error) {
      console.error('Failed to update news:', error);
      message.error('ニュースの更新に失敗しました');
    }
  };

  const handleDelete = async () => {
    try {
      await DalNews.deleteNews(newsId);
      message.success('ニュースが正常に削除されました');
      router.push('/news');
    } catch (error) {
      console.error('Failed to delete news:', error);
      message.error('ニュースの削除に失敗しました');
    }
  };

  return (
    <div>
      <h1>ニュース編集</h1>
      {newsData ? (
        <Form form={form} onFinish={handleUpdate} initialValues={newsData}>
          <Form.Item name="title" label="タイトル" rules={[{ required: true, message: 'タイトルを入力してください' }]}>
            <Input />
          </Form.Item>
          <Form.Item name="description" label="説明" rules={[{ required: true, message: '説明を入力してください' }]}>
            <Input.TextArea rows={4} />
          </Form.Item>
          <Form.Item name="content" label="内容" rules={[{ required: true, message: '内容を入力してください' }]}>
            <Input.TextArea rows={6} />
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit" style={{ marginRight: 8 }}>
              更新
            </Button>
            <Button danger onClick={handleDelete}>
              削除
            </Button>
            <Button className="ml-2" onClick={() => router.push('/news')} type="default">
              キャンセル
            </Button>
          </Form.Item>
        </Form>
      ) : (
        <p>ニュースデータを読み込み中...</p>
      )}
    </div>
  );
};

export default EditNewsPage;
