import { RecordBase } from './RecordBase';

/**
 * トップページの型定義
 */
export interface TopPage {
  production_url: string;
  staging_url: string;
  header_title: string;
  top_title: string;
  top_description: string;
  business_overview: string;
  about_us: string;
  company_name: string;
  establishment_date: string;
  location: string;
  representative_name: string;
  capital_stock: string;
  is_hiring_visible: boolean;
  hiring_message?: string;
  hiring_url?: string;
  is_member_visible: boolean;
}

/**
 * トップページの型定義（DB用）
 */
export interface TopPageRecord extends RecordBase, TopPage {}
