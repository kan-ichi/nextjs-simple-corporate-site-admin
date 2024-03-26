'use client';
import { NewsRecord } from '@/common/types/News';
import { DalNews } from '@/features/DalNews';
import { Button, DatePicker, Form, Input, Popconfirm, message } from 'antd';
import locale from 'antd/es/date-picker/locale/ja_JP';
import dayjs from 'dayjs';
import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function NewsDetailsPage() {
  const [form] = Form.useForm();
  const router = useRouter();
  const [newsData, setNewsData] = useState<NewsRecord | null>(null);
  const searchParams = useSearchParams();
  const id = searchParams.get('id') as string;

  useEffect(() => {
    const fetchNewsData = async () => {
      try {
        const news = await DalNews.getNewsById(id);
        // news?.release_date && (news.release_date = new Date(news.release_date));
        if (!news) {
          message.error('ニュースを取得できません');
          router.push('/news');
          return;
        }

        const newsWithDateRelease = {
          ...news,
          release_date: news.release_date ? news.release_date : undefined, // nullの場合はundefinedを渡す
          // release_date: undefined, // nullの場合はundefinedを渡す
          // release_date: new Date(),
        };
        setNewsData(newsWithDateRelease);
        form.setFieldsValue(newsWithDateRelease);
        // setNewsData(news);
        // form.setFieldsValue(news);
      } catch (error) {
        console.error('Failed to fetch news data:', error);
      }
    };
    fetchNewsData();
  }, []);

  const handleUpdate = async (values: NewsRecord) => {
    try {
      console.log(values);
      await DalNews.updateNews({ ...values, id: id });
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
            // initialValue={moment(newsData.release_date)}
            // getValueProps={(i) => ({ value: moment(i) })}
            //     defaultValue={moment(newsData.release_date)}
            // getValueProps={(value) => ({
            //   value: value ? moment(value) : null,
            // })}
            // getValueProps={(value) => ({
            //   value: value ? dayjs(value).toDate() : null,
            // })}
            // getValueProps={(value) => ({
            //   value: value ? dayjs(value).format() : null,
            // })}
            getValueProps={(value) => ({
              value: value ? dayjs(value) : null,
            })}
            rules={[
              {
                required: true,
                message: 'リリース日を入力してください',
                // type: 'object' as const,
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
              // bordered={false}
              // value={newsData?.release_date ? moment(newsData.release_date) : null}
              // onChange={(date, dateString) => {
              //   form.setFieldsValue({ release_date: date });
              // }}
              // value={dayjs(newsData?.release_date)}
              value={newsData?.release_date ? dayjs(newsData.release_date) : null}
              onChange={(date, dateString) => {
                form.setFieldsValue({ release_date: date ? date.toDate() : null });
              }}
            />
            {/* <Input /> */}
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
