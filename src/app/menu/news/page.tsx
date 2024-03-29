'use client';
import { NewsRecord } from '@/common/types/News';
import { DbKeyUtils } from '@/common/utils/DbKeyUtils';
import { FormatDateUtils } from '@/common/utils/FormatDateUtils';
import { DalNews } from '@/features/DalNews';
import { FirebaseStorage } from '@/features/FirebaseStorage';
import { ExclamationCircleOutlined } from '@ant-design/icons';
import { Button, Modal, Table, message } from 'antd';
import { useRouter } from 'next/navigation';
import { useCallback, useEffect, useRef, useState } from 'react';

export default function NewsListPage() {
  const router = useRouter();
  const [newsList, setNewsList] = useState<NewsRecord[]>([]);
  const tableContainerRef = useRef<HTMLDivElement>(null);
  const [tableRowsHeight, setTableRowsHeight] = useState(0);

  useEffect(() => {
    const fetchNews = async () => {
      try {
        let news = await DalNews.getAllNews();
        news.sort((a, b) => new Date(a.release_date).getTime() - new Date(b.release_date).getTime());
        setNewsList(news);
      } catch (error) {
        console.error('Failed to fetch news:', error);
      }
    };
    fetchNews();
  }, []);

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

  const handleDelete = async (id: string) => {
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
          await FirebaseStorage.deleteImageFile(id);
          await DalNews.deleteNews(id);
          setNewsList(newsList.filter((news) => news.id !== id));
          message.success('ニュースが正常に削除されました');
        } catch (error) {
          console.error('Failed to delete news:', error);
          message.error('ニュースの削除に失敗しました');
        }
      },
    });
  };

  const columns = [
    {
      width: '10%',
      title: 'リリース日',
      key: 'date',
      align: 'center' as const,
      render: (text: string, record: NewsRecord) => <>{FormatDateUtils.yyyyMMdd(record.release_date)}</>,
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
      render: (text: string) => <div title={text}>{text.length > 100 ? `${text.slice(0, 100)}...` : text}</div>,
    },
    {
      width: '20%',
      title: '操作',
      key: 'action',
      render: (text: string, record: NewsRecord) => (
        <>
          <Button
            className="mr-2"
            type="primary"
            onClick={() => router.push(`/menu/news/details?id=${DbKeyUtils.convertDbKeyToBase62(record.id)}`)}
          >
            詳細表示・編集
          </Button>
          <Button danger onClick={() => handleDelete(record.id)}>
            削除
          </Button>
        </>
      ),
    },
  ];

  return (
    <div className="min-h-screen grid grid-rows-[auto_1fr]">
      <div className="mb-1 flex justify-between items-center">
        <h1 className="text-3xl font-bold ml-10">ニュース</h1>
        <Button className="align-middle mr-10" type="primary" onClick={() => router.push('/menu/news/add')}>
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
