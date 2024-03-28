'use client';
import { Button, Form, Input } from 'antd';
import { useRouter } from 'next/navigation';

export default function Login() {
  const router = useRouter();

  const handleLogin = () => {
    // ログインロジックの実装
    router.push('/menu/top_page');
  };

  return (
    <div className="flex justify-center items-center h-screen bg-gray-100">
      <div className="bg-white p-8 rounded-md shadow-md">
        <h2 className="text-2xl font-bold mb-6">ログイン</h2>
        <Form onFinish={handleLogin} initialValues={{ username: 'admin', password: 'admin' }}>
          <Form.Item name="username" rules={[{ required: true, message: 'ユーザー名を入力してください' }]}>
            <Input placeholder="ユーザー名" />
          </Form.Item>
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
