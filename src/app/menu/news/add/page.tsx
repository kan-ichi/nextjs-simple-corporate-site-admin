'use client';
import { News } from '@/common/types/News';
import DatePickerJapanese from '@/components/DatePickerJapanese';
import UploadImage from '@/components/UploadImage';
import { DalNews } from '@/features/DalNews';
import { Button, Form, Input, UploadFile, message } from 'antd';
import dayjs from 'dayjs';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

export default function AddNewsPage() {
  const [form] = Form.useForm();
  const router = useRouter();
  const [imageFileList, setImageFileList] = useState<UploadFile[]>([]);

  const handleImageFileListChange = (newImageFileList: UploadFile[]) => {
    setImageFileList(newImageFileList);
  };

  const handleCropImageComplete = (croppedAreaPixels: { width: number; height: number }) => {
    // トリミングされた画像の縦横サイズを使った処理を行う
    console.log(`Cropped image size: ${croppedAreaPixels.width} x ${croppedAreaPixels.height} pixels`);
  };

  const handleSubmit = async (values: News) => {
    let image_b64 = undefined;
    if (imageFileList.length > 0 && imageFileList[0].url) {
      image_b64 = imageFileList[0].url.split(',')[1];
    }
    try {
      await DalNews.addNews(image_b64 ? { ...values, image_b64 } : values);
      message.success('ニュースが正常に登録されました');
      form.resetFields();
      router.push('/menu/news');
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
          initialImageFileList={imageFileList}
          onImageFileListChange={handleImageFileListChange}
          onImageFileRemoved={() => {}}
          onCropImageComplete={handleCropImageComplete}
        />
        <Form.Item>
          <Button type="primary" htmlType="submit">
            登録
          </Button>
          <Button className="ml-2" onClick={() => router.push('/menu/news')} type="default">
            キャンセル
          </Button>
        </Form.Item>
      </Form>
    </div>
  );
}
