'use client';
import { NewsRecord } from '@/common/types/News';
import { DalNews } from '@/features/DalNews';
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  TextField,
  Typography,
} from '@mui/material';
import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function NewsDetailsPage() {
  const router = useRouter();
  const [newsData, setNewsData] = useState<NewsRecord | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  const searchParams = useSearchParams();
  const id = searchParams.get('id') as string;

  useEffect(() => {
    const fetchNewsData = async () => {
      try {
        const news = await DalNews.getNewsById(id);
        if (!news) {
          alert('ニュースを取得できません');
          router.push('/news');
          return;
        }
        setNewsData(news);
      } catch (error) {
        console.error('Failed to fetch news data:', error);
      }
    };
    fetchNewsData();
  }, []);

  const handleUpdate = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const updatedNews = {
      id,
      title: form.get('title') as string,
      description: form.get('description') as string,
      content: form.get('content') as string,
    };
    try {
      await DalNews.updateNews(updatedNews);
      alert('ニュースが正常に更新されました');
      router.push('/news');
    } catch (error) {
      console.error('Failed to update news:', error);
      alert('ニュースの更新に失敗しました');
    }
  };

  const handleDelete = async () => {
    try {
      await DalNews.deleteNews(id);
      alert('ニュースが正常に削除されました');
      router.push('/news');
    } catch (error) {
      console.error('Failed to delete news:', error);
      alert('ニュースの削除に失敗しました');
    }
  };

  return (
    <Box>
      <Typography variant="h4" component="h1" gutterBottom>
        ニュース編集
      </Typography>
      {newsData ? (
        <Box component="form" onSubmit={handleUpdate}>
          <TextField fullWidth margin="normal" label="タイトル" name="title" defaultValue={newsData.title} required />
          <TextField
            fullWidth
            multiline
            rows={4}
            margin="normal"
            label="説明"
            name="description"
            defaultValue={newsData.description}
            required
          />
          <TextField
            fullWidth
            multiline
            rows={6}
            margin="normal"
            label="内容"
            name="content"
            defaultValue={newsData.content}
            required
          />
          <Box display="flex" justifyContent="space-between" marginTop={2}>
            <Button type="submit" variant="contained" color="primary">
              更新
            </Button>
            <Button variant="outlined" color="inherit" onClick={() => setDeleteDialogOpen(true)}>
              削除
            </Button>
            <Button variant="outlined" color="inherit" onClick={() => router.push('/news')}>
              キャンセル
            </Button>
          </Box>
        </Box>
      ) : (
        <Typography>ニュースデータを読み込み中...</Typography>
      )}
      <Dialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <DialogTitle id="alert-dialog-title">確認</DialogTitle>
        <DialogContent>
          <DialogContentText id="alert-dialog-description">本当に削除しますか？</DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)} color="primary">
            キャンセル
          </Button>
          <Button onClick={handleDelete} color="primary" autoFocus>
            削除
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
