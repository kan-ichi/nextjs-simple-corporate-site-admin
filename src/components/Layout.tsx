'use client';
import React, { useState } from 'react';
import Sidebar from '@/components/Sidebar';

export default function Layout({ children }: { children: React.ReactNode }) {
  const [collapsed, setCollapsed] = useState(false);

  const toggleSidebar = () => {
    setCollapsed(!collapsed);
  };

  return (
    <div className="flex h-screen">
      <Sidebar collapsed={collapsed} />
      <div className="flex-1 flex flex-col">
        <header className="bg-gray-800 text-white px-4 py-2 flex justify-between items-center">
          <div className="cursor-pointer" onClick={toggleSidebar}>
            {collapsed ? 'Show Sidebar' : 'Hide Sidebar'}
          </div>
        </header>
        <main className="flex-1 p-4 overflow-hidden">{children}</main>
      </div>
    </div>
  );
}
