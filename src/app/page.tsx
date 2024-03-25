'use client';
import { NewsRecord } from '@/common/types/News';
import { DalNews } from '@/features/DalNews';
import Link from 'next/link';
import { useState, useEffect } from 'react';

export default function Home() {
  return (
    <div>
      <Link href="/news">ニュース一覧</Link>
    </div>
  );
}
