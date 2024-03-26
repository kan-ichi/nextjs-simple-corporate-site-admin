'use client';
import { News } from '@/common/types/News';
import { DalNews } from '@/features/DalNews';
import { Button, DatePicker, Form, Input, message } from 'antd';
import { useRouter } from 'next/navigation';

export default function AddNewsPage() {
  const [form] = Form.useForm();
  const router = useRouter();

  const handleSubmit = async (values: News) => {
    try {
      await DalNews.addNews(values);
      message.success('ニュースが正常に登録されました');
      form.resetFields();
      router.push('/news');
    } catch (error) {
      console.error('Failed to add news:', error);
      message.error('ニュースの登録に失敗しました');
    }
  };

  return (
    <div>
      <h1>新規ニュース登録</h1>
      <Form form={form} onFinish={handleSubmit}>
        <Form.Item
          name="release_date"
          label="リリース日"
          rules={[{ required: true, message: 'リリース日を入力してください' }]}
        >
          <DatePicker />
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
        <Form.Item>
          <Button type="primary" htmlType="submit">
            登録
          </Button>
          <Button className="ml-2" onClick={() => router.push('/news')} type="default">
            キャンセル
          </Button>
        </Form.Item>
      </Form>
    </div>
  );
}
