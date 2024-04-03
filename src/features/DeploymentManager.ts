import { DalBusiness } from '@/features/DalBusiness';
import { DalCategory } from '@/features/DalCategory';
import { DalMember } from '@/features/DalMember';
import { DalMeta } from '@/features/DalMeta';
import { DalNews } from '@/features/DalNews';
import { DalTopPage } from '@/features/DalTopPage';
import { FirebaseStorage } from '@/features/FirebaseStorage';
import { UploadFile } from 'antd';

/**
 * デプロイ管理
 */
export module DeploymentManager {
  const productionFileManager = new FirebaseStorage({ isProduction: true });

  /**
   * 全てのデータを本番にデプロイします
   * */
  export async function deployToProduction(): Promise<void> {
    await deployBusinessToProduction();
    await deployCategoryToProduction();
    await deployMemberToProduction();
    await deployMetaToProduction();
    await deployNewsToProduction();
    await deployTopPageToProduction();
  }

  /**
   * Business を本番にデプロイします
   */
  async function deployBusinessToProduction(): Promise<void> {
    const productionDal = new DalBusiness({ isProduction: true });
    const stagingDal = new DalBusiness({ isProduction: false });

    const oldProductionRecords = await productionDal.getAllBusiness();
    const stagingRecords = await stagingDal.getAllBusiness();

    const allRecords = removeDuplicates([...stagingRecords, ...oldProductionRecords]);
    for (const record of allRecords) {
      const recordId = record.id;
      if (stagingRecords.some((r) => r.id === recordId)) {
        if (oldProductionRecords.some((r) => r.id === recordId)) {
          productionDal.updateBusiness(record);
        } else {
          productionDal.addBusiness(record, recordId);
        }
        const uploadFile = createUploadFile(record);
        if (uploadFile) {
          const file = convertUploadFileToFile(uploadFile);
          await productionFileManager.uploadImageFile(file, file.fileName);
        } else {
          await productionFileManager.deleteImageFile(recordId);
        }
      } else {
        await productionFileManager.deleteImageFile(recordId);
        productionDal.deleteBusiness(recordId);
      }
    }
  }

  /**
   * Category を本番にデプロイします
   */
  async function deployCategoryToProduction(): Promise<void> {
    const productionDal = new DalCategory({ isProduction: true });
    const stagingDal = new DalCategory({ isProduction: false });

    const oldProductionRecords = await productionDal.getAllCategory();
    const stagingRecords = await stagingDal.getAllCategory();

    const allRecords = removeDuplicates([...stagingRecords, ...oldProductionRecords]);
    for (const record of allRecords) {
      const recordId = record.id;
      if (stagingRecords.some((r) => r.id === recordId)) {
        if (oldProductionRecords.some((r) => r.id === recordId)) {
          productionDal.updateCategory(record);
        } else {
          productionDal.addCategory(record, recordId);
        }
      } else {
        productionDal.deleteCategory(recordId);
      }
    }
  }

  /**
   * Member を本番にデプロイします
   */
  async function deployMemberToProduction(): Promise<void> {
    const productionDal = new DalMember({ isProduction: true });
    const stagingDal = new DalMember({ isProduction: false });

    const oldProductionRecords = await productionDal.getAllMember();
    const stagingRecords = await stagingDal.getAllMember();

    const allRecords = removeDuplicates([...stagingRecords, ...oldProductionRecords]);
    for (const record of allRecords) {
      const recordId = record.id;
      if (stagingRecords.some((r) => r.id === recordId)) {
        if (oldProductionRecords.some((r) => r.id === recordId)) {
          productionDal.updateMember(record);
        } else {
          productionDal.addMember(record, recordId);
        }
        const uploadFile = createUploadFile(record);
        if (uploadFile) {
          const file = convertUploadFileToFile(uploadFile);
          await productionFileManager.uploadImageFile(file, file.fileName);
        } else {
          await productionFileManager.deleteImageFile(recordId);
        }
      } else {
        await productionFileManager.deleteImageFile(recordId);
        productionDal.deleteMember(recordId);
      }
    }
  }

  /**
   * Meta を本番にデプロイします
   */
  async function deployMetaToProduction(): Promise<void> {
    const productionDal = new DalMeta({ isProduction: true });
    const stagingDal = new DalMeta({ isProduction: false });

    const stagingRecord = await stagingDal.getMeta();
    stagingRecord && (await productionDal.upsertMeta(stagingRecord, stagingRecord.id));
  }

  /**
   * News を本番にデプロイします
   */
  async function deployNewsToProduction(): Promise<void> {
    const productionDal = new DalNews({ isProduction: true });
    const stagingDal = new DalNews({ isProduction: false });

    const oldProductionRecords = await productionDal.getAllNews();
    const stagingRecords = await stagingDal.getAllNews();

    const allRecords = removeDuplicates([...stagingRecords, ...oldProductionRecords]);
    for (const record of allRecords) {
      const recordId = record.id;
      if (stagingRecords.some((r) => r.id === recordId)) {
        if (oldProductionRecords.some((r) => r.id === recordId)) {
          productionDal.updateNews(record);
        } else {
          productionDal.addNews(record, recordId);
        }
        const uploadFile = createUploadFile(record);
        if (uploadFile) {
          const file = convertUploadFileToFile(uploadFile);
          await productionFileManager.uploadImageFile(file, file.fileName);
        } else {
          await productionFileManager.deleteImageFile(recordId);
        }
      } else {
        await productionFileManager.deleteImageFile(recordId);
        productionDal.deleteNews(recordId);
      }
    }
  }

  /**
   * TopPage を本番にデプロイします
   */
  async function deployTopPageToProduction(): Promise<void> {
    const productionDal = new DalTopPage({ isProduction: true });
    const stagingDal = new DalTopPage({ isProduction: false });

    const stagingRecord = await stagingDal.getTopPage();
    stagingRecord && (await productionDal.upsertTopPage(stagingRecord, stagingRecord.id));
  }

  /**
   * 重複レコードを削除します（引数をスプレッド構文で指定した場合は、先勝ちになるので注意）
   */
  function removeDuplicates<T extends { id: string }>(records: T[]): T[] {
    const result: T[] = [];
    const idSet = new Set<string>();

    for (const record of records) {
      if (!idSet.has(record.id)) {
        idSet.add(record.id);
        result.push(record);
      }
    }

    return result;
  }

  /**
   * レコードから、UploadFile を生成します
   */
  function createUploadFile(stagingRecord: { id: string; imagefile_url?: string }): UploadFile | null {
    if (!stagingRecord.imagefile_url) return null;
    return {
      uid: stagingRecord.id,
      name: stagingRecord.id,
      status: 'done',
      url: stagingRecord.imagefile_url,
    };
  }

  /**
   * UploadFile を File と その名前 に変換します
   */
  function convertUploadFileToFile(uploadFile: UploadFile): File & { fileName: string } {
    return {
      ...(uploadFile.originFileObj as File),
      fileName: uploadFile.name,
    };
  }
}
