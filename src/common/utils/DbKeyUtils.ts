/**
 * DBキー関連機能を提供するユーティリティ
 */
export module DbKeyUtils {
  /**
   * DBキーを生成します。
   */
  export function generateDbKey() {
    const guidPart = window.crypto.randomUUID().replace(/\-/g, '');
    return `${generateDbKeyDateTimePart(new Date())}${guidPart}`;
  }

  /**
   * DBキーの日時部分を生成します。
   **/
  export function generateDbKeyDateTimePart(date: Date) {
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    const hour = date.getHours().toString().padStart(2, '0');
    const minute = date.getMinutes().toString().padStart(2, '0');
    const second = date.getSeconds().toString().padStart(2, '0');
    const tenMillisecond = date.getMilliseconds().toString().padStart(3, '0').slice(0, 2);
    return `${year}${month}${day}${hour}${minute}${second}${tenMillisecond}`;
  }

  /**
   * DBキーから日時を抽出します。
   */
  export function extractDateFromDbKey(dbKey: string): Date | null {
    // 正しいDBキーのフォーマットかどうかを確認
    const dbKeyRegex = /^(\d{16})([0-9A-Fa-f]{32})$/;
    const match = dbKey.match(dbKeyRegex);
    if (match) {
      const dateString = match[1]; // DBキーの日時部分
      const year = parseInt(dateString.substring(0, 4), 10);
      const month = parseInt(dateString.substring(4, 6), 10) - 1; // 月は0-indexed
      const day = parseInt(dateString.substring(6, 8), 10);
      const hour = parseInt(dateString.substring(8, 10), 10);
      const minute = parseInt(dateString.substring(10, 12), 10);
      const second = parseInt(dateString.substring(12, 14), 10);
      const tenMillisecond = parseInt(dateString.substring(14, 16), 10);
      return new Date(year, month, day, hour, minute, second, tenMillisecond * 10);
    } else {
      // 不正なフォーマットの場合はnullを返す
      return null;
    }
  }
}
