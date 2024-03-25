'use client';
import { NewsRecord } from '@/common/types/News';
import { DalNews } from '@/features/DalNews';
import { Button, Popconfirm, Table, message } from 'antd';
import Link from 'next/link';
import { useEffect, useState } from 'react';

export default function NewsListPage() {
  const [newsList, setNewsList] = useState<NewsRecord[]>([]);

  useEffect(() => {
    const fetchNews = async () => {
      try {
        const news = await DalNews.getAllNews();
        setNewsList(news);
      } catch (error) {
        console.error('Failed to fetch news:', error);
      }
    };

    fetchNews();
  }, []);

  const handleDelete = async (id: string) => {
    try {
      await DalNews.deleteNews(id);
      setNewsList(newsList.filter((news) => news.id !== id));
      message.success('ニュースが正常に削除されました');
    } catch (error) {
      console.error('Failed to delete news:', error);
      message.error('ニュースの削除に失敗しました');
    }
  };

  const columns = [
    {
      title: 'タイトル',
      dataIndex: 'title',
      key: 'title',
    },
    {
      title: '説明',
      dataIndex: 'description',
      key: 'description',
    },
    {
      title: '操作',
      key: 'action',
      render: (text: string, record: NewsRecord) => (
        <>
          <Link href={`/news/details?id=${record.id}`}>
            <Button type="primary" style={{ marginRight: 8 }}>
              詳細表示・編集
            </Button>
          </Link>
          <Popconfirm
            title="本当に削除しますか？"
            onConfirm={() => handleDelete(record.id)}
            okText="はい"
            cancelText="いいえ"
          >
            <Button danger>削除</Button>
          </Popconfirm>
        </>
      ),
    },
  ];

  return (
    <div>
      <h1>ニュース一覧</h1>
      <Link href="/news/add">
        <Button type="primary" style={{ marginBottom: 16 }}>
          新規ニュース登録
        </Button>
      </Link>
      <Table dataSource={newsList} columns={columns} rowKey="id" pagination={{ pageSize: 10 }} />
    </div>
  );
}
