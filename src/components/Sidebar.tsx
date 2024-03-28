'use client';
import {
  FormOutlined,
  LogoutOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  NotificationOutlined,
} from '@ant-design/icons';
import { Modal } from 'antd';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useState } from 'react';

interface SidebarProps {
  collapsed: boolean;
  toggleCollapse: () => void;
}

export default function Sidebar({ collapsed, toggleCollapse }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleLogout = () => {
    setIsModalOpen(true);
  };

  const confirmLogout = () => {
    router.push('/');
    setIsModalOpen(false);
  };

  const cancelLogout = () => {
    setIsModalOpen(false);
  };

  return (
    <div
      className={`bg-gray-200 dark:bg-gray-800  ${
        collapsed ? 'w-16' : 'w-56'
      } transition-all duration-300 flex flex-col`}
    >
      <button
        className="flex items-center justify-center w-full py-2 bg-gray-200 dark:bg-gray-800 dark:text-white hover:bg-gray-300 dark:hover:bg-gray-700 transition-colors duration-300"
        onClick={toggleCollapse}
      >
        {collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
        {!collapsed && <span className="ml-2">折りたたむ</span>}
      </button>
      <nav className="flex-grow">
        <ul className="list-none pl-0">
          <li
            className={`${
              pathname === '/menu' ? 'bg-gray-400 dark:bg-gray-600' : ''
            } hover:bg-gray-300 dark:hover:bg-gray-700 transition-colors duration-300 ${
              collapsed ? 'justify-center' : ''
            }`}
            title={!collapsed ? 'メニュー' : ''}
          >
            <Link href="/menu/top_page" className="flex items-center px-4 py-2">
              <FormOutlined className={`${collapsed ? 'mx-auto' : 'mr-2'}`} />
              {!collapsed && <span>トップページ</span>}
            </Link>
          </li>
          <li
            className={`${
              pathname === '/menu/news' ? 'bg-gray-400 dark:bg-gray-600' : ''
            } hover:bg-gray-300 dark:hover:bg-gray-700 transition-colors duration-300 ${
              collapsed ? 'justify-center' : ''
            }`}
          >
            <Link href="/menu/news" className="flex items-center px-4 py-2">
              <NotificationOutlined className={`${collapsed ? 'mx-auto' : 'mr-2'}`} />
              {!collapsed && <span>ニュース一覧</span>}
            </Link>
          </li>
        </ul>
      </nav>
      <div className="mb-4">
        <li
          className={`${
            pathname === '/' ? 'bg-gray-400 dark:bg-gray-600' : ''
          } hover:bg-gray-300 dark:hover:bg-gray-700 transition-colors duration-300 ${
            collapsed ? 'justify-center' : ''
          }`}
          title={!collapsed ? 'ログアウト' : ''}
          onClick={handleLogout}
        >
          <div className="flex items-center px-4 py-2 cursor-pointer">
            <LogoutOutlined className={`${collapsed ? 'mx-auto' : 'mr-2'}`} />
            {!collapsed && <span>ログアウト</span>}
          </div>
        </li>
      </div>
      <Modal title="ログアウト" open={isModalOpen} onOk={confirmLogout} onCancel={cancelLogout}>
        <p>本当にログアウトしますか？</p>
      </Modal>
    </div>
  );
}
