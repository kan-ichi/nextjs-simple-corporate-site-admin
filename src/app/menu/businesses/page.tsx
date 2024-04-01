'use client';
import { useAppGlobalContextValue } from '@/common/contexts/AppGlobalContext';
import { BusinessRecord } from '@/common/types/Business';
import { DbKeyUtils } from '@/common/utils/DbKeyUtils';
import { DalBusiness } from '@/features/DalBusiness';
import { FirebaseStorage } from '@/features/FirebaseStorage';
import { ExclamationCircleOutlined } from '@ant-design/icons';
import { Button, Modal, Table, message } from 'antd';
import { useRouter } from 'next/navigation';
import { useCallback, useEffect, useRef, useState } from 'react';

export default function BusinessListPage() {
  const [appGlobalContextValue] = useAppGlobalContextValue();
  const router = useRouter();
  const [businessList, setBusinessList] = useState<BusinessRecord[]>([]);
  const tableContainerRef = useRef<HTMLDivElement>(null);
  const [tableRowsHeight, setTableRowsHeight] = useState(0);

  useEffect(() => {
    const fetchBusinesses = async () => {
      try {
        const businesses = await new DalBusiness({ appGlobalContextValue }).getAllBusiness();
        setBusinessList(businesses);
      } catch (error) {
        console.error('Failed to fetch businesses:', error);
      }
    };
    fetchBusinesses();
  }, []);

  const handleResize = useCallback(() => {
    const tableContainer = tableContainerRef.current;
    if (tableContainer) {
      const headerHeight = tableContainer.offsetTop;
      const remainingHeight = window.innerHeight - headerHeight;
      tableContainer.style.height = `${remainingHeight}px`;
      setTableRowsHeight(window.innerHeight - headerHeight - 100);
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
          await new DalBusiness({ appGlobalContextValue }).deleteBusiness(id);
          setBusinessList(businessList.filter((business) => business.id !== id));
          message.success('事業内容が正常に削除されました');
        } catch (error) {
          console.error('Failed to delete business:', error);
          message.error('事業内容の削除に失敗しました');
        }
      },
    });
  };

  const columns = [
    {
      width: '20%',
      title: 'サービスロゴ',
      dataIndex: 'logo_url',
      key: 'logo_url',
      render: (text: string | undefined) =>
        text ? <img src={text} alt="Logo" style={{ maxWidth: '100px', maxHeight: '100px' }} /> : '',
    },
    {
      title: '事業内容説明',
      dataIndex: 'description',
      key: 'description',
      render: (text: string) => <div title={text}>{text.length > 100 ? `${text.slice(0, 100)}...` : text}</div>,
    },
    {
      width: '10%',
      title: 'サービスURL',
      dataIndex: 'service_url',
      key: 'service_url',
      render: (text: string | undefined) =>
        text ? (
          <a href={text} target="_blank" rel="noopener noreferrer">
            {text}
          </a>
        ) : (
          ''
        ),
    },
    {
      width: '20%',
      title: '操作',
      key: 'action',
      render: (text: string, record: BusinessRecord) => (
        <>
          <Button
            className="mr-2"
            type="primary"
            onClick={() => router.push(`/menu/businesses/details?id=${DbKeyUtils.convertDbKeyToBase62(record.id)}`)}
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
        <h1 className="text-3xl font-bold ml-10">事業内容</h1>
        <Button className="align-middle mr-10" type="primary" onClick={() => router.push('/menu/businesses/add')}>
          新規事業内容登録
        </Button>
      </div>
      <div className="overflow-y-auto" ref={tableContainerRef}>
        <Table
          scroll={{ y: tableRowsHeight }}
          dataSource={businessList}
          columns={columns}
          rowKey="id"
          pagination={{ pageSize: 10 }}
        />
      </div>
    </div>
  );
}
