'use client';
import { CategoryRecord } from '@/common/types/Category';
import { DbKeyUtils } from '@/common/utils/DbKeyUtils';
import { DalCategory } from '@/features/DalCategory';
import { ExclamationCircleOutlined } from '@ant-design/icons';
import { Button, Modal, Table, message } from 'antd';
import { useRouter } from 'next/navigation';
import { useCallback, useEffect, useRef, useState } from 'react';

export default function CategoryListPage() {
  const router = useRouter();
  const [categoryList, setCategoryList] = useState<CategoryRecord[]>([]);
  const tableContainerRef = useRef<HTMLDivElement>(null);
  const [tableRowsHeight, setTableRowsHeight] = useState(0);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const categories = await DalCategory.getAllCategory();
        setCategoryList(categories);
      } catch (error) {
        console.error('Failed to fetch categories:', error);
      }
    };
    fetchCategories();
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
          await DalCategory.deleteCategory(id);
          setCategoryList(categoryList.filter((category) => category.id !== id));
          message.success('カテゴリーが正常に削除されました');
        } catch (error) {
          console.error('Failed to delete category:', error);
          message.error('カテゴリーの削除に失敗しました');
        }
      },
    });
  };

  const columns = [
    {
      width: '80%',
      title: 'カテゴリー名',
      dataIndex: 'name',
      key: 'name',
    },
    {
      width: '20%',
      title: '操作',
      key: 'action',
      render: (text: string, record: CategoryRecord) => (
        <>
          <Button
            className="mr-2"
            type="primary"
            onClick={() => router.push(`/menu/categories/details?id=${DbKeyUtils.convertDbKeyToBase62(record.id)}`)}
          >
            編集
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
        <h1 className="text-3xl font-bold ml-10">カテゴリー</h1>
        <Button className="align-middle mr-10" type="primary" onClick={() => router.push('/menu/categories/add')}>
          新規カテゴリー登録
        </Button>
      </div>
      <div className="overflow-y-auto" ref={tableContainerRef}>
        <Table
          scroll={{ y: tableRowsHeight }}
          dataSource={categoryList}
          columns={columns}
          rowKey="id"
          pagination={{ pageSize: 10 }}
        />
      </div>
    </div>
  );
}
