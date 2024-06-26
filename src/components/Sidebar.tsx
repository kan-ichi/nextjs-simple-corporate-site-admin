'use client';
import { FirebaseAuthentication } from '@/features/FirebaseAuthentication';
import {
  AppstoreOutlined,
  BookOutlined,
  FormOutlined,
  LogoutOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  NotificationOutlined,
  SolutionOutlined,
  SyncOutlined,
  TeamOutlined,
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

  const confirmLogout = async () => {
    await FirebaseAuthentication.logoutAndDeleteCurrentUser();
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
        title={collapsed ? '展開する' : '折りたたむ'}
      >
        {collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
        {!collapsed && <span className="ml-2">折りたたむ</span>}
      </button>
      <nav className="flex-grow">
        <ul className="list-none pl-0">
          <li
            className={`${
              pathname === '/menu/meta/' ? 'bg-gray-400 dark:bg-gray-600' : 'hover:bg-gray-300 dark:hover:bg-gray-700'
            } transition-colors duration-300 ${collapsed ? 'justify-center' : ''}`}
            title="メタ情報編集"
          >
            <Link href="/menu/meta" className="flex items-center px-4 py-2">
              <AppstoreOutlined className={`${collapsed ? 'mx-auto' : 'mr-2'}`} />
              {!collapsed && <span>メタ情報編集</span>}
            </Link>
          </li>
          <li
            className={`${
              pathname === '/menu/top_page/'
                ? 'bg-gray-400 dark:bg-gray-600'
                : 'hover:bg-gray-300 dark:hover:bg-gray-700'
            } transition-colors duration-300 ${collapsed ? 'justify-center' : ''}`}
            title="トップページ編集"
          >
            <Link href="/menu/top_page" className="flex items-center px-4 py-2">
              <FormOutlined className={`${collapsed ? 'mx-auto' : 'mr-2'}`} />
              {!collapsed && <span>トップページ編集</span>}
            </Link>
          </li>
          <li
            className={`${
              pathname === '/menu/businesses/'
                ? 'bg-gray-400 dark:bg-gray-600'
                : 'hover:bg-gray-300 dark:hover:bg-gray-700'
            } transition-colors duration-300 ${collapsed ? 'justify-center' : ''}`}
            title="事業内容一覧・編集"
          >
            <Link href="/menu/businesses" className="flex items-center px-4 py-2">
              <SolutionOutlined className={`${collapsed ? 'mx-auto' : 'mr-2'}`} />
              {!collapsed && <span>事業内容一覧・編集</span>}
            </Link>
          </li>
          <li
            className={`${
              pathname === '/menu/categories/'
                ? 'bg-gray-400 dark:bg-gray-600'
                : 'hover:bg-gray-300 dark:hover:bg-gray-700'
            } transition-colors duration-300 ${collapsed ? 'justify-center' : ''}`}
            title="カテゴリー一覧・編集"
          >
            <Link href="/menu/categories" className="flex items-center px-4 py-2">
              <BookOutlined className={`${collapsed ? 'mx-auto' : 'mr-2'}`} />
              {!collapsed && <span>カテゴリー一覧・編集</span>}
            </Link>
          </li>
          <li
            className={`${
              pathname === '/menu/news/' ? 'bg-gray-400 dark:bg-gray-600' : 'hover:bg-gray-300 dark:hover:bg-gray-700'
            } transition-colors duration-300 ${collapsed ? 'justify-center' : ''}`}
            title="ニュース一覧・編集"
          >
            <Link href="/menu/news" className="flex items-center px-4 py-2">
              <NotificationOutlined className={`${collapsed ? 'mx-auto' : 'mr-2'}`} />
              {!collapsed && <span>ニュース一覧・編集</span>}
            </Link>
          </li>
          <li
            className={`${
              pathname === '/menu/members/'
                ? 'bg-gray-400 dark:bg-gray-600'
                : 'hover:bg-gray-300 dark:hover:bg-gray-700'
            } transition-colors duration-300 ${collapsed ? 'justify-center' : ''}`}
            title="メンバー一覧・編集"
          >
            <Link href="/menu/members" className="flex items-center px-4 py-2">
              <TeamOutlined className={`${collapsed ? 'mx-auto' : 'mr-2'}`} />
              {!collapsed && <span>メンバー一覧・編集</span>}
            </Link>
          </li>
          <li
            className={`${
              pathname === '/menu/deployment/'
                ? 'bg-gray-400 dark:bg-gray-600'
                : 'hover:bg-gray-300 dark:hover:bg-gray-700'
            } transition-colors duration-300 ${collapsed ? 'justify-center' : ''}`}
            title="本番環境に反映"
          >
            <Link href="/menu/deployment" className="flex items-center px-4 py-2">
              <SyncOutlined className={`${collapsed ? 'mx-auto' : 'mr-2'}`} />
              {!collapsed && <span>本番環境に反映</span>}
            </Link>
          </li>
        </ul>
      </nav>
      <div className="mb-4">
        <li
          className={`hover:bg-gray-300 dark:hover:bg-gray-700 transition-colors duration-300 ${
            collapsed ? 'justify-center' : ''
          }`}
          title="ログアウト"
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
