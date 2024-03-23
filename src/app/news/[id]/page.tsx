import { initializeFirebaseApp } from '@/common/lib/firebase';
import EditNewsPage, { EditNewsPageProps } from '@/components/EditNewsPage';
import { DalNews } from '@/features/DalNews';

initializeFirebaseApp();

const getStaticParams = async () => {
  const news = await DalNews.getAllNews();
  return news.map((news) => ({
    id: news.id.toString(),
  }));
};

export async function generateStaticParams() {
  try {
    return await getStaticParams();
  } catch (error) {
    console.error('Failed to fetch news data:', error);
    return [];
  }
}

const NewsDetailPage: React.FC<{ params: { id: string } }> = ({ params }) => {
  const props: EditNewsPageProps = {
    newsId: params.id,
  };

  return <EditNewsPage {...props} />;
};

export default NewsDetailPage;
