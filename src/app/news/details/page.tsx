'use client';
import { NewsRecord } from '@/common/types/News';
import { DalNews } from '@/features/DalNews';
import { PlusOutlined } from '@ant-design/icons';
import { Button, DatePicker, Form, Input, Popconfirm, Upload, message } from 'antd';
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
  const [previewImage, setPreviewImage] = useState<string | null>(null);

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
      } catch (error) {
        console.error('Failed to fetch news data:', error);
      }
    };
    fetchNewsData();
  }, []);

  const handleUpdate = async (values: NewsRecord) => {
    try {
      // const { fileList } = (values as any).image || {};
      // let base64Image: string | undefined;

      // console.log(fileList);

      // if (fileList && fileList.length > 0) {
      //   const file = fileList[0].originFileObj;
      //   if (file) {
      //     base64Image = await convertToBase64(file);
      //   }
      // }
      // const fileList = (values as any).image[0].thumbUrl;
      // const base64Image = previewImage ?? (await convertToBase64(previewImage));

      console.log(previewImage);

      const updatedNews: NewsRecord = {
        ...values,
        id,
        image_id: previewImage ?? values.image_id,
      };

      await DalNews.updateNews(updatedNews);
      message.success('ニュースが正常に更新されました');
      router.push('/news');
    } catch (error) {
      console.error('Failed to update news:', error);
      message.error('ニュースの更新に失敗しました');
    }
  };

  // ファイルを Base64 エンコーディングする関数
  const convertToBase64 = (file: File): Promise<string> =>
    new Promise((resolve, reject) => {
      const fileReader = new FileReader();
      fileReader.readAsDataURL(file);
      fileReader.onload = () => {
        if (typeof fileReader.result === 'string') {
          resolve(fileReader.result.split(',')[1]);
        } else {
          reject(new Error('Failed to convert file to base64'));
        }
      };
      fileReader.onerror = () => {
        reject(new Error('Failed to read file'));
      };
    });

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
          {/* <Form.Item
            name="image"
            label="画像"
            valuePropName="fileList"
            getValueFromEvent={(e) => {
              if (Array.isArray(e)) {
                return e;
              }
              return e?.fileList;
            }}
          > */}
          <Upload
            // name="image"
            listType="picture-card"
            // listType="picture"
            maxCount={1}
            // showUploadList={false}
            showUploadList={{
              showPreviewIcon: true,
              showRemoveIcon: true,
              showDownloadIcon: true,
            }}
            beforeUpload={(file) => {
              const isValidType = file.type.startsWith('image/');
              if (!isValidType) {
                message.error('画像ファイルを選択してください');
              } else {
                setPreviewImage(URL.createObjectURL(file));
              }
              return isValidType || Upload.LIST_IGNORE;
            }}
            onChange={(info) => {
              if (info.file.status === 'uploading') {
                // uploading...
              }
              if (info.file.status === 'done') {
                // upload success
              }
              if (info.file.status === 'error') {
                message.error('アップロードに失敗しました');
              }
            }}
          >
            {/* {previewImage ? (
                <img src={previewImage} alt="preview" style={{ maxWidth: '100%', maxHeight: 300 }} />
              ) : ( */}
            <div>
              <PlusOutlined />
              <div style={{ marginTop: 8 }}>画像をアップロード</div>
            </div>
            {/* )} */}
          </Upload>
          {/* </Form.Item> */}
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
