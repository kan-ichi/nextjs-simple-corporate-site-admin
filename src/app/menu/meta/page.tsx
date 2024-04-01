'use client';
import { useAppGlobalContextValue } from '@/common/contexts/AppGlobalContext';
import { Meta, MetaRecord } from '@/common/types/Meta';
import { DalMeta } from '@/features/DalMeta';
import { Button, Form, Input, message } from 'antd';
import { useEffect, useState } from 'react';

export default function MetaForm() {
  const [appGlobalContextValue, setAppGlobalContextValue] = useAppGlobalContextValue();
  const [form] = Form.useForm();
  const [metaData, setMetaData] = useState<MetaRecord | null>(null);

  useEffect(() => {
    fetchMetaData();
  }, []);

  const fetchMetaData = async () => {
    try {
      const data = await new DalMeta().getMeta();
      if (data) {
        setMetaData(data);
        form.setFieldsValue(data);
      }
    } catch (error) {
      console.error('Failed to fetch Meta data:', error);
    }
  };

  const handleSubmit = async (values: Meta) => {
    try {
      await new DalMeta().upsertMeta({
        ...values,
        title: values.title || '',
        description: values.description || '',
        og_title: values.og_title || '',
        og_description: values.og_description || '',
        og_image_url: values.og_image_url || '',
        canonical_tag: values.canonical_tag || '',
      });
      message.success('メタ情報が正常に登録されました');
      form.resetFields();
      fetchMetaData();
    } catch (error) {
      console.error('Failed to add Meta data:', error);
      message.error('メタ情報の登録に失敗しました');
    }
  };

  return (
    <div className="h-screen overflow-y-auto">
      <div className="p-8">
        <h1 className="text-2xl font-bold mb-4">メタ情報編集</h1>
        <Form form={form} onFinish={handleSubmit} initialValues={metaData || {}}>
          <Form.Item name="title" label="タイトル">
            <Input />
          </Form.Item>
          <Form.Item name="description" label="説明">
            <Input.TextArea rows={2} />
          </Form.Item>
          <Form.Item name="og_title" label="ページのタイトル（og:title）">
            <Input />
          </Form.Item>
          <Form.Item name="og_description" label="ページの説明文（og:description）">
            <Input.TextArea rows={2} />
          </Form.Item>
          <Form.Item name="og_image_url" label="サムネイル画像のURL（og:image_url">
            <Input.TextArea rows={2} />
          </Form.Item>
          <Form.Item name="canonical_tag" label="Canonicalタグ">
            <Input.TextArea rows={2} />
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
