/**
 * 日付フォーマット関連ユーティリティ
 */
export module FormatDateUtils {
  /**
   * 日付を YYYY/MM/DD HH:mm:SS 文字列にフォーマットします。
   */
  export function yyyyMMddhhmmss(date: Date | null): string {
    if (date === null) return '';
    const options: Intl.DateTimeFormatOptions = {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false,
    };
    const formattedDate = new Intl.DateTimeFormat('ja-JP', options).format(date);
    return formattedDate;
  }

  /**
   * 日付を MM/DD 文字列にフォーマットします。
   */
  export function mMDD(date: Date | null): string {
    if (date === null) return '';
    const options: Intl.DateTimeFormatOptions = {
      month: '2-digit',
      day: '2-digit',
      hour12: false,
    };
    const formattedDate = new Intl.DateTimeFormat('ja-JP', options).format(date);
    return formattedDate;
  }

  /**
   * 日付を HH:mm 文字列にフォーマットします。
   */
  export function hHmm(date: Date | null): string {
    if (date === null) return '';
    const options: Intl.DateTimeFormatOptions = {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    };
    const formattedDate = new Intl.DateTimeFormat('ja-JP', options).format(date);
    return formattedDate;
  }
}
