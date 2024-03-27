'use client';
import { NewsRecord } from '@/common/types/News';
import UploadImage from '@/components/UploadImage';
import { DalNews } from '@/features/DalNews';
import { Button, DatePicker, Form, Input, Popconfirm, message } from 'antd';
import locale from 'antd/es/date-picker/locale/ja_JP';
import { UploadFile } from 'antd/lib/upload/interface';
import dayjs from 'dayjs';
import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function NewsDetailsPage() {
  const [form] = Form.useForm();
  const router = useRouter();
  const [newsData, setNewsData] = useState<NewsRecord | null>(null);
  const searchParams = useSearchParams();
  const id = searchParams.get('id') as string;
  const [imageFileList, setImageFileList] = useState<UploadFile[]>([]);
  const [imageFileRemoved, setImageFileRemoved] = useState(false);

  useEffect(() => {
    const fetchNewsData = async () => {
      try {
        const news = await DalNews.getNewsById(id);
        if (!news) {
          message.error('ニュースを取得できません');
          router.push('/news');
          return;
        }
        setNewsData(news);
        form.setFieldsValue(news);
        setImageFileList(
          news.image_b64
            ? [
                {
                  uid: '-1',
                  name: 'preview.png',
                  status: 'done',
                  url: `data:image/png;base64,${news.image_b64}`,
                },
              ]
            : []
        );
        setImageFileRemoved(!news.image_b64);
      } catch (error) {
        console.error('Failed to fetch news data:', error);
      }
    };
    fetchNewsData();
  }, []);

  const handleImageFileListChange = (newImageFileList: UploadFile[]) => {
    setImageFileList(newImageFileList);
  };

  const handleImageFileRemoved = () => {
    setImageFileRemoved(true);
  };

  const handleUpdate = async (values: NewsRecord) => {
    try {
      let image_b64 = undefined;
      if (imageFileList.length > 0 && imageFileList[0].url) {
        image_b64 = imageFileList[0].url.split(',')[1];
      } else if (imageFileRemoved) {
        image_b64 = '';
      }
      const updatedNews: NewsRecord = {
        ...values,
        id,
        image_b64,
      };
      await DalNews.updateNews(updatedNews);
      message.success('ニュースが正常に更新されました');
      router.push('/news');
    } catch (error) {
      console.error('Failed to update news:', error);
      message.error('ニュースの更新に失敗しました');
    }
  };

  const handleDelete = async () => {
    try {
      await DalNews.deleteNews(id);
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
            <DatePicker
              locale={locale}
              format="YYYY/MM/DD"
              value={newsData?.release_date ? dayjs(newsData.release_date) : null}
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
            onImageFileRemoved={handleImageFileRemoved}
          />
          <Form.Item className="mt-3">
            <Button className="m-1" type="primary" htmlType="submit">
              更新
            </Button>
            <Popconfirm title="本当に削除しますか？" onConfirm={handleDelete} okText="はい" cancelText="いいえ">
              <Button className="m-1" danger>
                削除
              </Button>
            </Popconfirm>
            <Button className="m-1" onClick={() => router.push('/news')} type="default">
              キャンセル
            </Button>
          </Form.Item>
        </Form>
      ) : (
        <p>ニュースデータを読み込み中...</p>
      )}
    </div>
  );
}
