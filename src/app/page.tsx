'use client';
import { NewsRecord } from '@/common/types/News';
import { DalNews } from '@/features/DalNews';
import { useState, useEffect } from 'react';
import { Form, Input, Button, Upload, message, Table, Popconfirm } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, SaveOutlined } from '@ant-design/icons';
import { ColumnsType } from 'antd/es/table';

export default function Home() {
  const [form] = Form.useForm();
  const [newsData, setNewsData] = useState<NewsRecord[]>([]);
  const [editingKey, setEditingKey] = useState('');
  const [isNewRow, setIsNewRow] = useState(false);

  useEffect(() => {
    fetchNewsData();
  }, []);

  const fetchNewsData = async () => {
    try {
      const data = await DalNews.getAllNews();
      setNewsData(data);
    } catch (error) {
      message.error('ニュースの取得に失敗しました');
    }
  };

  const isEditing = (record: NewsRecord) => editingKey === record.id;

  const edit = (record: NewsRecord) => {
    form.setFieldsValue({ ...record });
    setEditingKey(record.id);
    setIsNewRow(false);
  };

  const cancel = () => {
    setEditingKey('');
    setIsNewRow(false);
  };

  const save = async (id: string) => {
    try {
      const row = await form.validateFields();
      const newData = [...newsData];
      const index = newData.findIndex((item) => id === item.id);

      if (index > -1) {
        const updatedItem = await DalNews.updateNews({ ...newData[index], ...row });
        newData.splice(index, 1, updatedItem);
      } else {
        const newItem = await DalNews.addNews(row);
        newData.push(newItem);
      }

      setNewsData(newData);
      setEditingKey('');
      setIsNewRow(false);
    } catch (errInfo) {
      console.log('Validate Failed:', errInfo);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await DalNews.deleteNews(id);
      const newData = newsData.filter((item) => item.id !== id);
      setNewsData(newData);
      message.success('ニュースが削除されました');
    } catch (error) {
      message.error('ニュースの削除に失敗しました');
    }
  };

  const handleCreateNew = () => {
    setEditingKey('');
    setIsNewRow(true);
    form.resetFields();
  };

  const columns: ColumnsType<NewsRecord> = [
    {
      title: 'タイトル',
      dataIndex: 'title',
      key: 'title',
      render: (text, record) => (
        <EditableCell
          editing={isEditing(record) || isNewRow}
          dataIndex="title"
          title="タイトル"
          inputType="text"
          record={record}
          index={0}
        >
          {text}
        </EditableCell>
      ),
    },
    {
      title: '説明',
      dataIndex: 'description',
      key: 'description',
      render: (text, record) => (
        <EditableCell
          editing={isEditing(record) || isNewRow}
          dataIndex="description"
          title="説明"
          inputType="text"
          record={record}
          index={0}
        >
          {text}
        </EditableCell>
      ),
    },
    {
      title: '本文',
      dataIndex: 'content',
      key: 'content',
      render: (text, record) => (
        <EditableCell
          editing={isEditing(record) || isNewRow}
          dataIndex="content"
          title="本文"
          inputType="textarea"
          record={record}
          index={0}
        >
          {text}
        </EditableCell>
      ),
    },
    {
      title: '操作',
      key: 'action',
      render: (_, record: NewsRecord) => {
        const editable = isEditing(record);
        return editable ? (
          <span>
            <Button onClick={() => save(record.id)} style={{ marginRight: 8 }}>
              保存
            </Button>
            <Popconfirm title="キャンセルしますか？" onConfirm={cancel}>
              <Button>キャンセル</Button>
            </Popconfirm>
          </span>
        ) : isNewRow ? (
          <Button onClick={() => save('')} icon={<SaveOutlined />}>
            登録
          </Button>
        ) : (
          <>
            <Button onClick={() => edit(record)} style={{ marginRight: 8 }} icon={<EditOutlined />}>
              編集
            </Button>
            <Popconfirm title="本当に削除しますか？" onConfirm={() => handleDelete(record.id)}>
              <Button icon={<DeleteOutlined />} danger>
                削除
              </Button>
            </Popconfirm>
          </>
        );
      },
    },
  ];

  return (
    <div>
      <Form form={form} component={false}>
        <Table
          bordered
          dataSource={newsData}
          columns={columns}
          rowClassName={(record, index) => (isEditing(record) || isNewRow ? 'editable-row' : '')}
          pagination={{
            onChange: cancel,
          }}
        />
      </Form>
      <Button type="primary" onClick={handleCreateNew} style={{ marginBottom: 16 }}>
        新規作成
      </Button>
    </div>
  );
}

interface EditableCellProps extends React.HTMLAttributes<HTMLElement> {
  editing: boolean;
  dataIndex: string;
  title: string;
  inputType: 'text' | 'textarea';
  record: NewsRecord;
  index: number;
  children: React.ReactNode;
}

const EditableCell: React.FC<EditableCellProps> = ({
  editing,
  dataIndex,
  title,
  inputType,
  record,
  index,
  children,
  ...restProps
}) => {
  const inputNode = inputType === 'text' ? <Input /> : <Input.TextArea />;
  return (
    <td {...restProps}>
      {editing ? (
        <Form.Item
          name={dataIndex}
          style={{
            margin: 0,
          }}
          rules={[
            {
              required: true,
              message: `${title}を入力してください`,
            },
          ]}
        >
          {inputNode}
        </Form.Item>
      ) : (
        children
      )}
    </td>
  );
};
