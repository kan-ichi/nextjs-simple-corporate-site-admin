'use client';
import { NewsRecord } from '@/common/types/News';
import { DbKeyUtils } from '@/common/utils/DbKeyUtils';
import DatePickerJapanese from '@/components/DatePickerJapanese';
import UploadImage from '@/components/UploadImage';
import { DalNews } from '@/features/DalNews';
import { FirebaseStorage } from '@/features/FirebaseStorage';
import { ExclamationCircleOutlined } from '@ant-design/icons';
import { Button, Form, Input, Modal, message } from 'antd';
import { RcFile, UploadFile } from 'antd/lib/upload';
import dayjs from 'dayjs';
import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function NewsDetailsPage() {
  const [form] = Form.useForm();
  const router = useRouter();
  const [newsData, setNewsData] = useState<NewsRecord | null>(null);
  const searchParams = useSearchParams();
  const id = DbKeyUtils.convertBase62ToDbKey(searchParams.get('id') as string);
  const [imageFileList, setImageFileList] = useState<UploadFile[]>([]);
  const [imageFileRemoved, setImageFileRemoved] = useState(false);

  useEffect(() => {
    const fetchNewsData = async () => {
      try {
        const news = await DalNews.getNewsById(id);
        if (!news) {
          message.error('ニュースを取得できません');
          router.push('/menu/news');
          return;
        }
        setNewsData(news);
        form.setFieldsValue(news);
        const file = await FirebaseStorage.getImageFile(id);
        if (file) {
          const rcFile = createRcFile(file);
          setImageFileList([
            {
              uid: '-1',
              name: 'preview.png',
              status: 'done',
              originFileObj: rcFile,
            },
          ]);
          setImageFileRemoved(false);
        } else {
          setImageFileList([]);
          setImageFileRemoved(true);
        }
      } catch (error) {
        console.error('Failed to fetch news data:', error);
      }
    };
    fetchNewsData();
  }, []);

  function createRcFile(file: File): RcFile {
    const rcFile: RcFile = {
      ...file,
      uid: '-1',
      lastModifiedDate: new Date(),
    };

    return rcFile;
  }

  const handleImageFileListChange = (newImageFileList: UploadFile[]) => {
    setImageFileList(newImageFileList);
  };

  const handleImageFileRemoved = () => {
    setImageFileRemoved(true);
  };

  const handleUpdate = async (values: NewsRecord) => {
    try {
      if (imageFileList.length > 0 && imageFileList[0].url) {
        const file = createFileFromBase64(imageFileList[0].url);
        await FirebaseStorage.uploadImageFile(file, id);
      } else if (imageFileRemoved) {
        await FirebaseStorage.deleteImageFile(id);
      }
      const updatedNews: NewsRecord = {
        ...values,
        id,
      };
      await DalNews.updateNews(updatedNews);
      message.success('ニュースが正常に更新されました');
      router.push('/menu/news');
    } catch (error) {
      console.error('Failed to update news:', error);
      message.error('ニュースの更新に失敗しました');
    }
  };

  function createFileFromBase64(base64String: string): File {
    const binaryString = window.atob(base64String.split(',')[1]);
    const bytes = new Uint8Array(binaryString.length);
    for (let i = 0; i < binaryString.length; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }
    return new File([bytes], 'image.png', { type: 'image/png' });
  }

  const handleDelete = async () => {
    Modal.confirm({
      title: '本当に削除しますか？',
      icon: <ExclamationCircleOutlined />,
      content: '削除すると元に戻すことはできません',
      okText: 'はい',
      okType: 'danger',
      cancelText: 'いいえ',
      maskClosable: true,
      onOk: async () => {
        try {
          await DalNews.deleteNews(id);
          message.success('ニュースが正常に削除されました');
          router.push('/menu/news');
        } catch (error) {
          console.error('Failed to delete news:', error);
          message.error('ニュースの削除に失敗しました');
        }
      },
    });
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
            <DatePickerJapanese
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
            id={id}
            initialImageFileList={imageFileList}
            onImageFileListChange={handleImageFileListChange}
            onImageFileRemoved={handleImageFileRemoved}
          />
          <Form.Item className="mt-3">
            <Button className="m-1" type="primary" htmlType="submit">
              更新
            </Button>
            <Button className="m-1" danger onClick={handleDelete}>
              削除
            </Button>
            <Button className="m-1" onClick={() => router.push('/menu/news')} type="default">
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
