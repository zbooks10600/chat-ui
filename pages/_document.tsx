import { useTranslation } from 'next-i18next';
import { DocumentProps, Head, Html, Main, NextScript } from 'next/document';

import { APP_NAME } from '@/utils/app/const';

import i18nextConfig from '../next-i18next.config';

type Props = DocumentProps & {
  // add custom document props
};

const { t } = useTranslation('chat');
const APP_NAME_TRANSLATED = t('APP_NAME');

export default function Document(props: Props) {
  const currentLocale =
    props.__NEXT_DATA__.locale ?? i18nextConfig.i18n.defaultLocale;
  return (
    <Html lang={currentLocale}>
      <Head>
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta
          name="apple-mobile-web-app-title"
          content={APP_NAME_TRANSLATED}
        ></meta>
      </Head>
      <body>
        <Main />
        <NextScript />
      </body>
    </Html>
  );
}
