'use client';
import { NewsRecord } from '@/common/types/News';
import { DalNews } from '@/features/DalNews';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  IconButton,
  Pagination,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from '@mui/material';
import Link from 'next/link';
import { useEffect, useState } from 'react';

export default function NewsListPage() {
  const [newsList, setNewsList] = useState<NewsRecord[]>([]);
  const [page, setPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [newsToDelete, setNewsToDelete] = useState<NewsRecord | null>(null);

  useEffect(() => {
    const fetchNews = async () => {
      try {
        const news = await DalNews.getAllNews();
        setNewsList(news);
      } catch (error) {
        console.error('Failed to fetch news:', error);
      }
    };
    fetchNews();
  }, []);

  const handleDelete = async () => {
    try {
      if (newsToDelete) {
        await DalNews.deleteNews(newsToDelete.id);
        setNewsList(newsList.filter((news) => news.id !== newsToDelete.id));
        setDeleteDialogOpen(false);
        setNewsToDelete(null);
      }
    } catch (error) {
      console.error('Failed to delete news:', error);
    }
  };

  const handleChangePage = (event: React.ChangeEvent<unknown>, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(1);
  };

  const totalPages = Math.ceil(newsList.length / rowsPerPage);
  const paginatedNews = newsList.slice((page - 1) * rowsPerPage, page * rowsPerPage);

  return (
    <div className="flex flex-col h-screen">
      <div id="header" className="py-4">
        <Typography variant="h4" component="h1">
          ニュース一覧
        </Typography>
        <Link href="/news/add">
          <Button variant="contained" color="primary">
            新規ニュース登録
          </Button>
        </Link>
      </div>

      <div id="main" className="flex-grow overflow-auto">
        <TableContainer component={Paper}>
          <Table stickyHeader>
            <TableHead>
              <TableRow>
                <TableCell>タイトル</TableCell>
                <TableCell>説明</TableCell>
                <TableCell>操作</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {paginatedNews.map((news) => (
                <TableRow key={news.id}>
                  <TableCell>{news.title}</TableCell>
                  <TableCell>{news.description}</TableCell>
                  <TableCell>
                    <Link href={`/news/details?id=${news.id}`}>
                      <IconButton aria-label="編集">
                        <EditIcon />
                      </IconButton>
                    </Link>
                    <IconButton
                      aria-label="削除"
                      onClick={() => {
                        setNewsToDelete(news);
                        setDeleteDialogOpen(true);
                      }}
                    >
                      <DeleteIcon />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </div>

      <div id="footer" className="py-4">
        <Pagination count={totalPages} page={page} onChange={handleChangePage} />
      </div>

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
    </div>
  );
}
