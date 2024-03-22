'use client';
import { Category } from '@/common/types/Category';
import { News, NewsRecord } from '@/common/types/News';
import { FormatDateUtils } from '@/common/utils/FormatDateUtils';
import { DalNews } from '@/features/DalNews';
import { useState } from 'react';

export default function Home() {
  const [news, setNews] = useState<NewsRecord[]>([]);

  const handleClick = async () => {
    const news: News = {
      title: 'title',
      description: 'description',
      content: 'content',
      thumbnail: {
        url: 'url',
        width: 100,
        height: 100,
      },
      category: {
        id: 'category-id',
        createdAt: new Date(),
        updatedAt: new Date(),
        name: 'category-name',
      },
    };
    await DalNews.addNews(news);
    const test = await DalNews.getAllNews();
    setNews(test);
  };
  return (
    <>
      <div className="flex flex-col">
        <button className="rounded bg-blue-500 p-2 text-white" onClick={() => handleClick()}>
          button
        </button>
        {news.map((item) => (
          <div key={item.id}>
            {item.id} {item.title}
          </div>
        ))}
      </div>
    </>
  );
}
