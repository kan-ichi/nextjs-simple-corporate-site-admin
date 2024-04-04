'use client';
import { useAppGlobalContextValue } from '@/common/contexts/AppGlobalContext';
import { MemberRecord } from '@/common/types/Member';
import { DbKeyUtils } from '@/common/utils/DbKeyUtils';
import { DalMember } from '@/features/DalMember';
import { ExclamationCircleOutlined } from '@ant-design/icons';
import { Button, Modal, Table, message } from 'antd';
import { useRouter } from 'next/navigation';
import { useCallback, useEffect, useRef, useState } from 'react';

export default function MemberListPage() {
  const [appGlobalContextValue, setAppGlobalContextValue] = useAppGlobalContextValue();
  const router = useRouter();
  const [memberList, setMemberList] = useState<MemberRecord[]>([]);
  const tableContainerRef = useRef<HTMLDivElement>(null);
  const [tableRowsHeight, setTableRowsHeight] = useState(0);

  useEffect(() => {
    const fetchMembers = async () => {
      try {
        const members = await new DalMember().getAllMember();
        setMemberList(members);
      } catch (error) {
        console.error('Failed to fetch members:', error);
      }
    };
    fetchMembers();
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
          await new DalMember().deleteMember(id);
          setMemberList(memberList.filter((member) => member.id !== id));
          message.success('メンバーが正常に削除されました');
        } catch (error) {
          console.error('Failed to delete member:', error);
          message.error('メンバーの削除に失敗しました');
        }
      },
    });
  };

  const columns = [
    {
      width: '20%',
      title: '名前',
      dataIndex: 'name',
      key: 'name',
    },
    {
      width: '20%',
      title: '役職',
      dataIndex: 'position',
      key: 'position',
    },
    {
      title: 'プロフィール',
      dataIndex: 'profile',
      key: 'profile',
      render: (text: string) => <div title={text}>{text.length > 100 ? `${text.slice(0, 100)}...` : text}</div>,
    },
    {
      width: '20%',
      title: '操作',
      key: 'action',
      render: (text: string, record: MemberRecord) => (
        <>
          <Button
            className="mr-2"
            type="primary"
            onClick={() => router.push(`/menu/members/details?id=${DbKeyUtils.convertDbKeyToBase62(record.id)}`)}
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
        <h1 className="text-3xl font-bold ml-10">メンバー</h1>
        <Button className="align-middle mr-10" type="primary" onClick={() => router.push('/menu/members/add')}>
          新規メンバー登録
        </Button>
      </div>
      <div className="overflow-y-auto" ref={tableContainerRef}>
        <Table
          scroll={{ y: tableRowsHeight }}
          dataSource={memberList}
          columns={columns}
          rowKey="id"
          pagination={{ pageSize: 10 }}
        />
      </div>
    </div>
  );
}
