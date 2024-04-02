'use client';
import { useAppGlobalContextValue } from '@/common/contexts/AppGlobalContext';
import { TopPage, TopPageRecord } from '@/common/types/TopPage';
import { DalTopPage } from '@/features/DalTopPage';
import { Button, Form, Input, Switch, message } from 'antd';
import { useEffect, useState } from 'react';

export default function TopPageForm() {
  const [appGlobalContextValue, setAppGlobalContextValue] = useAppGlobalContextValue();
  const [form] = Form.useForm();
  const [isHiringVisible, setIsHiringVisible] = useState(false);
  const [isMemberVisible, setIsMemberVisible] = useState(false);
  const [topPageData, setTopPageData] = useState<TopPageRecord | null>(null);

  useEffect(() => {
    fetchTopPageData();
  }, []);

  const fetchTopPageData = async () => {
    try {
      const data = await new DalTopPage().getTopPage();
      if (data) {
        setTopPageData(data);
        form.setFieldsValue(data);
        setIsHiringVisible(data.is_hiring_visible);
        setIsMemberVisible(data.is_member_visible);
      }
    } catch (error) {
      console.error('Failed to fetch TopPage data:', error);
    }
  };

  const handleSubmit = async (values: TopPage & { is_hiring_visible: boolean; is_member_visible: boolean }) => {
    try {
      await new DalTopPage().upsertTopPage({
        ...values,
        is_hiring_visible: isHiringVisible,
        is_member_visible: isMemberVisible,
      });
      message.success('トップページデータが正常に登録されました');
      form.resetFields();
      fetchTopPageData();
    } catch (error) {
      console.error('Failed to add TopPage data:', error);
      message.error('トップページデータの登録に失敗しました');
    }
  };

  return (
    <div className="h-screen overflow-y-auto">
      <div className="p-8">
        <h1 className="text-2xl font-bold mb-4">トップページ編集</h1>
        <Form form={form} onFinish={handleSubmit} initialValues={topPageData || {}}>
          <Form.Item
            name="production_url"
            label="本番環境URL"
            rules={[{ required: true, message: '本番環境URLを入力してください' }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            name="staging_url"
            label="ステージング環境URL"
            rules={[{ required: true, message: 'ステージング環境URLを入力してください' }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            name="header_title"
            label="ヘッダータイトル"
            rules={[{ required: true, message: 'ヘッダータイトルを入力してください' }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            name="top_title"
            label="トップタイトル"
            rules={[{ required: true, message: 'トップタイトルを入力してください' }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            name="top_description"
            label="トップ補足文"
            rules={[{ required: true, message: 'トップ補足文を入力してください' }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            name="business_overview"
            label="事業概要"
            rules={[{ required: true, message: '事業概要を入力してください' }]}
          >
            <Input.TextArea rows={3} />
          </Form.Item>
          <Form.Item
            name="about_us"
            label="私たちについて"
            rules={[{ required: true, message: '私たちについてを入力してください' }]}
          >
            <Input.TextArea rows={2} />
          </Form.Item>
          <Form.Item
            name="company_name"
            label="会社名"
            rules={[{ required: true, message: '会社名を入力してください' }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            name="establishment_date"
            label="設立日"
            rules={[{ required: true, message: '設立日を入力してください' }]}
          >
            <Input />
          </Form.Item>
          <Form.Item name="location" label="所在地" rules={[{ required: true, message: '所在地を入力してください' }]}>
            <Input />
          </Form.Item>
          <Form.Item
            name="representative_name"
            label="代表者名"
            rules={[{ required: true, message: '代表者名を入力してください' }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            name="capital_stock"
            label="資本金"
            rules={[{ required: true, message: '資本金を入力してください' }]}
          >
            <Input />
          </Form.Item>
          <Form.Item name="is_hiring_visible" valuePropName="checked">
            <Switch checked={isHiringVisible} onChange={(checked) => setIsHiringVisible(checked)} />
            <span className="ml-2">採用情報を表示する</span>
          </Form.Item>
          {isHiringVisible && (
            <Form.Item
              name="hiring_message"
              label="採用メッセージ"
              rules={[{ required: true, message: '採用メッセージを入力してください' }]}
            >
              <Input.TextArea rows={3} />
            </Form.Item>
          )}
          <Form.Item name="is_member_visible" valuePropName="checked">
            <Switch checked={isMemberVisible} onChange={(checked) => setIsMemberVisible(checked)} />
            <span className="ml-2">メンバー紹介を表示する</span>
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit">
              保存
            </Button>
          </Form.Item>
        </Form>
      </div>
    </div>
  );
}
