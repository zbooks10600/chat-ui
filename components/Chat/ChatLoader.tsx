import { IconRobot } from '@tabler/icons-react';
import { FC } from 'react';
import Image from 'next/image';
import logoImage from '/public/logo.png';

interface Props {}

export const ChatLoader: FC<Props> = () => {
  return (
    <div
      className="group border-b border-black/10 bg-[#1c282a] text-[#62fa01]"
      style={{ overflowWrap: 'anywhere' }}
    >
      <div className="m-auto flex gap-4 p-4 text-base md:max-w-2xl md:gap-6 md:py-6 lg:max-w-2xl lg:px-0 xl:max-w-3xl">
        <div className="min-w-[40px] text-right font-bold">
          <Image src={logoImage} alt="Assistant" width={40} height={40} />
        </div>
        <span className="animate-pulse cursor-default mt-1 text-[#62fa01]">▍</span>
      </div>
    </div>
  );
};