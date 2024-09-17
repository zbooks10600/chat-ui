import { IconRefresh } from '@tabler/icons-react';
import { FC } from 'react';

import { useTranslation } from 'next-i18next';

interface Props {
  onRegenerate: () => void;
}

export const Regenerate: FC<Props> = ({ onRegenerate }) => {
  const { t } = useTranslation('chat');
  return (
    <div className="fixed bottom-4 left-0 right-0 ml-auto mr-auto w-full px-2 sm:absolute sm:bottom-8 sm:left-[280px] sm:w-1/2 lg:left-[200px]">
      <div className="mb-4 text-center text-white">
        {t('Sorry, there was an error.')}
      </div>
      <button
        className="flex h-12 gap-2 w-full items-center justify-center rounded-lg border border-[#62fa01] bg-[#1c282a] text-sm font-semibold text-white hover:bg-[#010c04]/90"
        onClick={onRegenerate}
      >
        <IconRefresh color="#ffffff" />
        <div>{t('Regenerate response')}</div>
      </button>
    </div>
  );
};
