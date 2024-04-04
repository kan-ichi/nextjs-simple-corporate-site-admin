'use client';
import { Button, Form, Input, Modal } from 'antd';
import { useRouter } from 'next/navigation';
import { USERNAME_PASSWORD_PAIRS } from '@/_DoNotCommit/env';

export default function Login() {
  const router = useRouter();

  const handleLogin = (values: { username: string; password: string }) => {
    const { username, password } = values;
    const foundUser = USERNAME_PASSWORD_PAIRS.find(
      (user: { username: string; password: string }) => user.username === username && user.password === password
    );
    if (foundUser) {
      router.push('/menu/news');
    } else {
      Modal.error({
        title: 'ログインエラー',
        content: 'ログインに失敗しました。ユーザー名またはパスワードが間違っています。',
      });
    }
  };

  return (
    <div className="flex justify-center items-center h-screen bg-gray-100">
      <div className="bg-white p-8 rounded-md shadow-md">
        <h2 className="text-2xl font-bold mb-6">ログイン</h2>
        <Form onFinish={handleLogin}>
          <span className="text-sm">単語「管理」を ローマ字で入力</span>
          <Form.Item name="username" rules={[{ required: true, message: 'ユーザー名を入力してください' }]}>
            <Input placeholder="ユーザー名" />
          </Form.Item>
          <span className="text-sm">単語「パスワード」を ローマ字で入力</span>
          <Form.Item name="password" rules={[{ required: true, message: 'パスワードを入力してください' }]}>
            <Input.Password placeholder="パスワード" />
          </Form.Item>
          <Button type="primary" htmlType="submit" block>
            ログイン
          </Button>
        </Form>
      </div>
    </div>
  );
}
