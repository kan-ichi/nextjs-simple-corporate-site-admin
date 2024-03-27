import { ConfigProvider, DatePickerProps } from 'antd';
import 'antd/dist/reset.css';
import generateDatePicker from 'antd/es/date-picker/generatePicker';
import locale from 'antd/es/date-picker/locale/ja_JP';
import 'antd/es/date-picker/style/index';
import jaJP from 'antd/lib/locale/ja_JP';
import dayjs from 'dayjs';
import 'dayjs/locale/ja';
import dayjsGenerateConfig from 'rc-picker/lib/generate/dayjs';
dayjs.locale('ja');

const DatePicker = generateDatePicker<dayjs.Dayjs>(dayjsGenerateConfig);

export default function DatePickerJapanese(props: DatePickerProps) {
  return (
    <ConfigProvider locale={jaJP}>
      <DatePicker {...props} locale={locale} />
    </ConfigProvider>
  );
}
