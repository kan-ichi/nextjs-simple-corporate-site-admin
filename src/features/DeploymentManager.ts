import { DalBusiness } from '@/features/DalBusiness';
import { DalCategory } from '@/features/DalCategory';
import { DalMember } from '@/features/DalMember';
import { DalMeta } from '@/features/DalMeta';
import { DalNews } from '@/features/DalNews';
import { DalTopPage } from '@/features/DalTopPage';
import { FirebaseStorage } from '@/features/FirebaseStorage';

/**
 * デプロイ管理
 */
export class DeploymentManager {
  /**
   * 全てのデータ・画像を本番にデプロイします
   * */
  async deployToProduction(): Promise<void> {
    await this.deployBusinessToProduction();
    await this.deployCategoryToProduction();
    await this.deployMemberToProduction();
    await this.deployMetaToProduction();
    await this.deployNewsToProduction();
    await this.deployTopPageToProduction();
    await this.adjustImageFile();
  }

  /**
   * Business を本番にデプロイします
   */
  private async deployBusinessToProduction(): Promise<void> {
    const productionDal = new DalBusiness({ isProduction: true });
    const stagingDal = new DalBusiness({ isProduction: false });

    const oldProductionRecords = await productionDal.getAllBusiness();
    const stagingRecords = await stagingDal.getAllBusiness();

    const allRecords = this.removeDuplicates([...stagingRecords, ...oldProductionRecords]);
    for (const record of allRecords) {
      const recordId = record.id;
      if (stagingRecords.some((r) => r.id === recordId)) {
        if (oldProductionRecords.some((r) => r.id === recordId)) {
          productionDal.updateBusiness(record);
        } else {
          productionDal.addBusiness(record, recordId);
        }
      } else {
        productionDal.deleteBusiness(recordId);
      }
    }
  }

  /**
   * Category を本番にデプロイします
   */
  private async deployCategoryToProduction(): Promise<void> {
    const productionDal = new DalCategory({ isProduction: true });
    const stagingDal = new DalCategory({ isProduction: false });

    const oldProductionRecords = await productionDal.getAllCategory();
    const stagingRecords = await stagingDal.getAllCategory();

    const allRecords = this.removeDuplicates([...stagingRecords, ...oldProductionRecords]);
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
  private async deployMemberToProduction(): Promise<void> {
    const productionDal = new DalMember({ isProduction: true });
    const stagingDal = new DalMember({ isProduction: false });

    const oldProductionRecords = await productionDal.getAllMember();
    const stagingRecords = await stagingDal.getAllMember();

    const allRecords = this.removeDuplicates([...stagingRecords, ...oldProductionRecords]);
    for (const record of allRecords) {
      const recordId = record.id;
      if (stagingRecords.some((r) => r.id === recordId)) {
        if (oldProductionRecords.some((r) => r.id === recordId)) {
          productionDal.updateMember(record);
        } else {
          productionDal.addMember(record, recordId);
        }
      } else {
        productionDal.deleteMember(recordId);
      }
    }
  }

  /**
   * Meta を本番にデプロイします
   */
  private async deployMetaToProduction(): Promise<void> {
    const productionDal = new DalMeta({ isProduction: true });
    const stagingDal = new DalMeta({ isProduction: false });

    const stagingRecord = await stagingDal.getMeta();
    stagingRecord && (await productionDal.upsertMeta(stagingRecord, stagingRecord.id));
  }

  /**
   * News を本番にデプロイします
   */
  private async deployNewsToProduction(): Promise<void> {
    const productionDal = new DalNews({ isProduction: true });
    const stagingDal = new DalNews({ isProduction: false });

    const oldProductionRecords = await productionDal.getAllNews();
    const stagingRecords = await stagingDal.getAllNews();

    const allRecords = this.removeDuplicates([...stagingRecords, ...oldProductionRecords]);
    for (const record of allRecords) {
      const recordId = record.id;
      if (stagingRecords.some((r) => r.id === recordId)) {
        if (oldProductionRecords.some((r) => r.id === recordId)) {
          productionDal.updateNews(record);
        } else {
          productionDal.addNews(record, recordId);
        }
      } else {
        productionDal.deleteNews(recordId);
      }
    }
  }

  /**
   * TopPage を本番にデプロイします
   */
  private async deployTopPageToProduction(): Promise<void> {
    const productionDal = new DalTopPage({ isProduction: true });
    const stagingDal = new DalTopPage({ isProduction: false });

    const stagingRecord = await stagingDal.getTopPage();
    stagingRecord && (await productionDal.upsertTopPage(stagingRecord, stagingRecord.id));
  }

  /**
   * 重複レコードを削除します（引数をスプレッド構文で指定した場合は、先勝ちになるので注意）
   */
  private removeDuplicates<T extends { id: string }>(records: T[]): T[] {
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
   * 各DBで使用している画像ファイルを検索し、それ以外の不要な画像ファイルを削除します
   */
  private async adjustImageFile() {
    /**
     * 現在ストレージに存在するすべての画像ファイル名のリスト
     */
    const allImageFileNames = await new FirebaseStorage().getAllImageFileNames();

    /**
     * アクティブな画像ファイル名のリスト
     */
    let activeImageFileNames = new Set<string>();

    /**
     * imagefile_url のファイル名を取得し、アクティブな画像ファイル名のリストに追加します
     */
    const processRecord = (record: { imagefile_url?: string }) => {
      if (record.imagefile_url) {
        activeImageFileNames.add(FirebaseStorage.convertUrlToFileName(record.imagefile_url));
      }
    };

    /**
     * DBを読み、ファイル名をアクティブな画像ファイル名のリストに追加します
     */
    {
      await new DalBusiness({ isProduction: true }).getAllBusiness().then((records) => records.forEach(processRecord));
      await new DalBusiness().getAllBusiness().then((records) => records.forEach(processRecord));
      await new DalMember({ isProduction: true }).getAllMember().then((records) => records.forEach(processRecord));
      await new DalMember().getAllMember().then((records) => records.forEach(processRecord));
      await new DalNews({ isProduction: true }).getAllNews().then((records) => records.forEach(processRecord));
      await new DalNews().getAllNews().then((records) => records.forEach(processRecord));
    }

    /**
     * 削除対象の画像ファイル名のリスト
     */
    const deleteImageFileNames = new Set([...allImageFileNames].filter((elem) => !activeImageFileNames.has(elem)));

    /**
     * 画像ファイルを削除します
     */
    deleteImageFileNames.forEach(async (fileName) => {
      await new FirebaseStorage().deleteImageFile(fileName);
    });
  }
}
