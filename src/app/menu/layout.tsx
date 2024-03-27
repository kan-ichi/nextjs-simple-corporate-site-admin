'use client';
import Sidebar from '@/components/Sidebar';
import { useState } from 'react';

export default function MenuLayout({ children }: { children: React.ReactNode }) {
  const [collapsed, setCollapsed] = useState(false);

  const toggleCollapse = () => {
    setCollapsed(!collapsed);
  };

  return (
    <div className="flex h-screen">
      <Sidebar collapsed={collapsed} toggleCollapse={toggleCollapse} />
      <main className="flex-1 bg-gray-100">{children}</main>
    </div>
  );
}
