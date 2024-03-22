'use client';
import { NewsRecord } from '@/common/types/News';
import { DalNews } from '@/features/DalNews';
import { PlusOutlined } from '@ant-design/icons';
import { Button, Form, Input, Upload, message } from 'antd';
import { useState } from 'react';

export default function Home() {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [news, setNews] = useState<NewsRecord>({} as NewsRecord);

  const onFinish = async () => {
    setLoading(true);
    try {
      await DalNews.addNews(news);
      message.success('ニュースが登録されました');
      form.resetFields();
    } catch (error) {
      message.error('ニュースの登録に失敗しました');
    } finally {
      setLoading(false);
    }
  };
  return (
    <Form form={form} name="news-form" onFinish={onFinish}>
      <Form.Item name="title" label="タイトル" rules={[{ required: true, message: 'タイトルを入力してください' }]}>
        <Input onChange={(e) => setNews({ ...news, title: e.target.value })} />
      </Form.Item>

      <Form.Item name="description" label="説明" rules={[{ required: true, message: '説明を入力してください' }]}>
        <Input.TextArea onChange={(e) => setNews({ ...news, description: e.target.value })} />
      </Form.Item>

      <Form.Item name="content" label="本文" rules={[{ required: true, message: '本文を入力してください' }]}>
        <Input.TextArea onChange={(e) => setNews({ ...news, content: e.target.value })} />
      </Form.Item>

      <Form.Item name="thumbnail" label="サムネイル">
        <Upload listType="picture">
          <Button icon={<PlusOutlined />}>アップロード</Button>
        </Upload>
      </Form.Item>

      <Form.Item>
        <Button type="primary" htmlType="submit" loading={loading}>
          登録
        </Button>
      </Form.Item>
    </Form>
  );
}
