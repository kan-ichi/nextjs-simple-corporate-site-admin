'use client';
import { useAppGlobalContextValue } from '@/common/contexts/AppGlobalContext';
import { TopPageRecord } from '@/common/types/TopPage';
import { DalTopPage } from '@/features/DalTopPage';
import { DeploymentManager } from '@/features/DeploymentManager';
import { LoadingOutlined, WarningOutlined } from '@ant-design/icons';
import { Button, Modal, Space } from 'antd';
import { useEffect, useState } from 'react';

export default function DeploymentPage() {
  const [appGlobalContextValue, setAppGlobalContextValue] = useAppGlobalContextValue();
  const [topPageRecord, setTopPageRecord] = useState<TopPageRecord | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [isLoadingModalOpen, setIsLoadingModalOpen] = useState(false);
  const [isDeployedModalOpen, setIsDeployedModalOpen] = useState(false);

  useEffect(() => {
    fetchTopPageRecord();
  }, []);

  const fetchTopPageRecord = async () => {
    try {
      const data = await new DalTopPage().getTopPage();
      setTopPageRecord(data);
    } catch (error) {
      console.error('Failed to fetch TopPage data:', error);
    }
  };

  const handleDeployToProduction = () => {
    setIsConfirmModalOpen(true);
  };

  const confirmDeployToProduction = async () => {
    setIsLoadingModalOpen(true);
    setIsLoading(true);
    await DeploymentManager.deployToProduction();
    setIsLoading(false);
    setIsLoadingModalOpen(false);
    setIsDeployedModalOpen(true);
  };

  return (
    <div className="h-screen overflow-y-auto flex flex-col items-center justify-center">
      <Space direction="vertical" size="large">
        <a href={`${topPageRecord?.staging_url}`} target="_blank" rel="noopener noreferrer">
          ステージング環境URL（新しいタブで開きます）
        </a>
        <Button type="primary" onClick={handleDeployToProduction} loading={isLoading}>
          本番環境に反映
        </Button>
        <a href={`${topPageRecord?.production_url}`} target="_blank" rel="noopener noreferrer">
          本番環境URL（新しいタブで開きます）
        </a>
      </Space>

      <Modal
        title={
          <div className="flex items-center">
            <WarningOutlined style={{ color: 'red', marginRight: '8px' }} />
            <span className="font-bold">本番環境に反映</span>
          </div>
        }
        open={isConfirmModalOpen}
        onOk={() => {
          setIsConfirmModalOpen(false);
          confirmDeployToProduction();
        }}
        onCancel={() => setIsConfirmModalOpen(false)}
        okText="反映する"
        cancelText="キャンセル"
      >
        <p>本当に本番環境に反映しますか？</p>
        <p>この操作は元に戻せません。</p>
      </Modal>

      <Modal
        title={
          <div className="flex items-center">
            <LoadingOutlined style={{ fontSize: 24, marginRight: '8px' }} spin />
            <span className="font-bold">デプロイ中</span>
          </div>
        }
        open={isLoadingModalOpen}
        footer={null}
        closable={false}
      >
        <p>デプロイが進行中です。しばらくお待ちください。</p>
      </Modal>

      <Modal
        title={
          <div className="flex items-center">
            <WarningOutlined style={{ color: 'green', marginRight: '8px' }} />
            <span className="font-bold">デプロイが完了しました。</span>
          </div>
        }
        open={isDeployedModalOpen}
        onOk={() => setIsDeployedModalOpen(false)}
        onCancel={() => setIsDeployedModalOpen(false)}
        okText="閉じる"
      >
        <p>デプロイが正常に完了しました。</p>
      </Modal>
    </div>
  );
}
