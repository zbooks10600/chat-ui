import { IconSquareToggle } from '@tabler/icons-react';
import { useContext } from 'react';

import HomeContext from '@/pages/api/home/home.context';

import { SidebarButton } from '../../Sidebar/SidebarButton';
import ChatbarContext from '../Chatbar.context';
import { ClearConversations } from './ClearConversations';

export const ChatbarSettings = () => {
  const {
    state: { conversations, rag },
    dispatch,
  } = useContext(HomeContext);

  const { handleClearConversations } = useContext(ChatbarContext);

  return (
    <div className="flex flex-col items-center space-y-1 border-t border-white/20 pt-1 text-sm">
      {conversations.length > 0 ? (
        <ClearConversations onClearConversations={handleClearConversations} />
      ) : null}

      <SidebarButton
        text={rag ? 'Disable RAG' : 'Enable RAG'}
        icon={<IconSquareToggle size={18} />}
        onClick={() => dispatch({ field: 'rag', value: !rag })}
      />
    </div>
  );
};
