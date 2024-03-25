'use client';
import { NewsRecord } from '@/common/types/News';
import { FormatDateUtils } from '@/common/utils/FormatDateUtils';
import { DalNews } from '@/features/DalNews';
import { Button, Popconfirm, Table, message } from 'antd';
import { useRouter } from 'next/navigation';
import { useCallback, useEffect, useRef, useState } from 'react';

export default function NewsListPage() {
  const router = useRouter();
  const [newsList, setNewsList] = useState<NewsRecord[]>([]);
  const tableContainerRef = useRef<HTMLDivElement>(null);
  const [tableRowsHeight, setTableRowsHeight] = useState(0);

  const handleResize = useCallback(() => {
    const tableContainer = tableContainerRef.current;
    if (tableContainer) {
      const headerHeight = tableContainer.offsetTop;
      const remainingHeight = window.innerHeight - headerHeight;
      tableContainer.style.height = `${remainingHeight}px`;
      setTableRowsHeight(window.innerHeight - headerHeight - 120);
    }
  }, []);

  useEffect(() => {
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [handleResize]);

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
      width: '12%',
      title: '作成・更新',
      key: 'date',
      render: (text: string, record: NewsRecord) => (
        <>
          {FormatDateUtils.yyyyMMdd(record.createdAt ?? null)}
          <br />
          {FormatDateUtils.yyyyMMdd(record.updatedAt ?? null)}
        </>
      ),
    },
    {
      width: '30%',
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
      width: '20%',
      title: '操作',
      key: 'action',
      render: (text: string, record: NewsRecord) => (
        <>
          <Button className="mr-2" type="primary" onClick={() => router.push(`/news/details?id=${record.id}`)}>
            詳細表示・編集
          </Button>
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
    <div className="min-h-screen grid grid-rows-[auto_1fr]">
      <div className="mb-1 flex justify-between items-center">
        <h1 className="text-3xl font-bold ml-10">ニュース</h1>
        <Button className="align-middle mr-10" type="primary" onClick={() => router.push('/news/add')}>
          新規ニュース登録
        </Button>
      </div>
      <div className="overflow-y-auto" ref={tableContainerRef}>
        <Table
          scroll={{ y: tableRowsHeight }}
          dataSource={newsList}
          columns={columns}
          rowKey="id"
          pagination={{ pageSize: 10 }}
        />
      </div>
    </div>
  );
}
