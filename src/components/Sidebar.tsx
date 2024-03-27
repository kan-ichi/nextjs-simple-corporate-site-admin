'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

interface SidebarProps {
  collapsed: boolean;
}

export default function Sidebar({ collapsed }: SidebarProps) {
  const pathname = usePathname();

  return (
    <div className={`bg-gray-800 text-white ${collapsed ? 'w-16' : 'w-56'} transition-all duration-300`}>
      <nav>
        <ul>
          <li
            className={`${pathname === '/users' ? 'bg-gray-700' : ''} hover:bg-gray-700 transition-colors duration-300`}
          >
            <Link href="/news" className="flex items-center px-4 py-2">
              {!collapsed && <span>news List</span>}
            </Link>
          </li>
          <li
            className={`${
              pathname === '/products' ? 'bg-gray-700' : ''
            } hover:bg-gray-700 transition-colors duration-300`}
          >
            <Link href="/news" className="flex items-center px-4 py-2">
              {!collapsed && <span>news List</span>}
            </Link>
          </li>
        </ul>
      </nav>
    </div>
  );
}
