'use client';
import { News } from '@/common/types/News';
import { DalNews } from '@/features/DalNews';
import { Box, Button, TextField, Typography } from '@mui/material';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

export default function AddNewsPage() {
  const router = useRouter();
  const [formData, setFormData] = useState<News>({
    title: '',
    description: '',
    content: '',
  });

  const handleChange = (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = event.target;
    setFormData((prevFormData) => ({
      ...prevFormData,
      [name]: value,
    }));
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    try {
      await DalNews.addNews(formData);
      alert('ニュースが正常に登録されました');
      setFormData({
        title: '',
        description: '',
        content: '',
      });
      router.push('/news');
    } catch (error) {
      console.error('Failed to add news:', error);
      alert('ニュースの登録に失敗しました');
    }
  };

  return (
    <Box>
      <Typography variant="h4" component="h1" gutterBottom>
        新規ニュース登録
      </Typography>
      <Box component="form" onSubmit={handleSubmit}>
        <TextField
          fullWidth
          margin="normal"
          label="タイトル"
          name="title"
          value={formData.title}
          onChange={handleChange}
          required
        />
        <TextField
          fullWidth
          multiline
          rows={4}
          margin="normal"
          label="説明"
          name="description"
          value={formData.description}
          onChange={handleChange}
          required
        />
        <TextField
          fullWidth
          multiline
          rows={6}
          margin="normal"
          label="内容"
          name="content"
          value={formData.content}
          onChange={handleChange}
          required
        />
        <Box display="flex" justifyContent="space-between" marginTop={2}>
          <Button type="submit" variant="contained" color="primary">
            登録
          </Button>
          <Button variant="outlined" color="inherit" onClick={() => router.push('/news')}>
            キャンセル
          </Button>
        </Box>
      </Box>
    </Box>
  );
}
