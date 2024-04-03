'use client';
import { useAppGlobalContextValue } from '@/common/contexts/AppGlobalContext';
import { CategoryRecord } from '@/common/types/Category';
import { NewsRecord } from '@/common/types/News';
import { DbKeyUtils } from '@/common/utils/DbKeyUtils';
import DatePickerJapanese from '@/components/DatePickerJapanese';
import UploadImage from '@/components/UploadImage';
import { DalCategory } from '@/features/DalCategory';
import { DalNews } from '@/features/DalNews';
import { FirebaseStorage } from '@/features/FirebaseStorage';
import { ExclamationCircleOutlined } from '@ant-design/icons';
import { Button, Form, Input, Modal, Select, message } from 'antd';
import dayjs from 'dayjs';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
const { Option } = Select;

export default function NewsDetailsPage() {
  const [appGlobalContextValue, setAppGlobalContextValue] = useAppGlobalContextValue();
  const [form] = Form.useForm();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [id, setId] = useState('');
  const [newsData, setNewsData] = useState<NewsRecord | null>(null);
  const [categoryRecords, setCategoryRecords] = useState<CategoryRecord[]>([]);
  const [isImageFileAdded, setIsImageFileAdded] = useState(false);
  const [isImageFileDeleted, setIsImageFileDeleted] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);

  useEffect(() => {
    // ページ表示時に、パラメーターから id を取得
    const handleRouteChange = () => {
      const queryId = window.location.search.split('?id=')[1];
      const convertedId = DbKeyUtils.convertBase62ToDbKey(queryId);
      setId(convertedId);

      fetchNewsData(convertedId);
      fetchCategories();
    };
    handleRouteChange(); // 初期レンダリング時にIDを取得
    window.addEventListener('popstate', handleRouteChange); // ページ遷移時のイベントリスナー
    return () => window.removeEventListener('popstate', handleRouteChange); // クリーンアップ関数
  }, []);

  /**
   * News を取得します
   */
  const fetchNewsData = async (convertedId: string) => {
    setIsLoading(true);
    try {
      const news = await new DalNews().getNewsById(convertedId);
      if (!news) {
        message.error('ニュースを取得できません');
        router.push('/menu/news');
        return;
      }
      setNewsData(news);
      form.setFieldsValue(news);
    } catch (error) {
      console.error('Failed to fetch news data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Category を取得します
   */
  const fetchCategories = async () => {
    try {
      const fetchedCategories = await new DalCategory().getAllCategory();
      setCategoryRecords(fetchedCategories);
    } catch (error) {
      console.error('Failed to fetch categories:', error);
    }
  };

  const handleUpdate = async (values: NewsRecord) => {
    setIsLoading(true);
    const fileManager = new FirebaseStorage();
    let uploadedImageUrl: string = (await fileManager.getImageFileURL(id)) || '';
    try {
      if (isImageFileAdded && uploadedFile) {
        uploadedImageUrl = await fileManager.uploadImageFile(uploadedFile, id);
      }
      if (isImageFileDeleted) {
        await fileManager.deleteImageFile(id);
        uploadedImageUrl = '';
      }
      const updatedNews: NewsRecord = {
        ...values,
        imagefile_url: uploadedImageUrl,
        id,
      };
      await new DalNews().updateNews(updatedNews);
      message.success('ニュースが正常に更新されました');
      router.push('/menu/news');
    } catch (error) {
      console.error('Failed to update news:', error);
      message.error('ニュースの更新に失敗しました');
    }
    setIsLoading(false);
  };

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
          await new FirebaseStorage().deleteImageFile(id);
          await new DalNews().deleteNews(id);
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
    <div className="p-8">
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
          <Form.Item name="category_id" label="カテゴリー">
            <Select
              value={newsData?.category_id || ''}
              onChange={(value) => form.setFieldsValue({ category_id: value })}
            >
              <Option value="">（選択してください）</Option>
              {categoryRecords.map((ategoryRecord) => (
                <Option key={ategoryRecord.id} value={ategoryRecord.id}>
                  {ategoryRecord.name}
                </Option>
              ))}
            </Select>
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
            existingFileName={id}
            isImageFileAddedCallback={(value: boolean) => setIsImageFileAdded(value)}
            isImageFileDeletedCallback={(value: boolean) => setIsImageFileDeleted(value)}
            fileUploadedCallback={(value: File | null) => setUploadedFile(value)}
          />
          <Form.Item className="mt-3">
            <Button className="m-1" type="primary" htmlType="submit" loading={isLoading}>
              更新
            </Button>
            <Button className="m-1" danger onClick={handleDelete} loading={isLoading}>
              削除
            </Button>
            <Button className="m-1" onClick={() => router.push('/menu/news')} type="default" loading={isLoading}>
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
