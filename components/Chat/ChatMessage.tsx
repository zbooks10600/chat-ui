import { ChatNode } from '@/types/chat';
import {
  IconCheck,
  IconCopy,
  IconEdit,
  IconUser,
  IconRobot,
} from '@tabler/icons-react';
import { useTranslation } from 'next-i18next';
import {
  FC,
  memo,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import rehypeMathjax from 'rehype-mathjax';
import { v4 as uuidv4 } from 'uuid';
import remarkGfm from 'remark-gfm';
import remarkMath from 'remark-math';
import { CodeBlock } from '../Markdown/CodeBlock';
import { MemoizedReactMarkdown } from '../Markdown/MemoizedReactMarkdown';
import { ConversationContext } from '@/utils/contexts/conversaionContext';
import { getCurrentUnixTime } from '@/utils/app/chatRoomUtils';

interface Props {
  chatNode: ChatNode;
  messageIndex: number;
  onEditMessage: (chatNode: ChatNode, messageIndex: number) => void;
}

export const ChatMessage: FC<Props> = memo(
  ({ chatNode, messageIndex, onEditMessage }) => {
    const { t } = useTranslation('chat');
    const [isEditing, setIsEditing] = useState<boolean>(false);
    const [isTyping, setIsTyping] = useState<boolean>(false);
    const [messageContent, setMessageContent] = useState(
      chatNode.message.content,
    );
    const [messagedCopied, setMessageCopied] = useState(false);

    const { selectedConversation, actions } = useContext(ConversationContext);

    const totalPages = useMemo(() => {
      return chatNode.parentMessageId
        ? selectedConversation?.mapping[chatNode.parentMessageId]?.children
            ?.length ?? 0
        : 0;
    }, [chatNode]);

    const currentPage = useMemo(() => {
      return (
        (chatNode.parentMessageId
          ? selectedConversation?.mapping[
              chatNode.parentMessageId
            ]?.children?.indexOf(chatNode.id) ?? 0
          : 0) + 1
      );
    }, [chatNode]);

    const textareaRef = useRef<HTMLTextAreaElement>(null);

    const toggleEditing = () => {
      setIsEditing(!isEditing);
    };

    const handleInputChange = (
      event: React.ChangeEvent<HTMLTextAreaElement>,
    ) => {
      setMessageContent(event.target.value);
      if (textareaRef.current) {
        textareaRef.current.style.height = 'inherit';
        textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
      }
    };

    const handleEditMessage = () => {
      if (chatNode.message.content != messageContent) {
        const nodeId = uuidv4();
        onEditMessage(
          {
            id: nodeId,
            message: {
              id: nodeId,
              role: chatNode.message.role,
              content: messageContent,
              create_time: getCurrentUnixTime(),
            },
            parentMessageId: chatNode.parentMessageId,
            children: [],
          },
          messageIndex,
        );
      }
      setIsEditing(false);
    };

    const handlePressEnter = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
      if (e.key === 'Enter' && !isTyping && !e.shiftKey) {
        e.preventDefault();
        handleEditMessage();
      }
    };

    const copyOnClick = () => {
      if (!navigator.clipboard) return;

      navigator.clipboard.writeText(chatNode.message.content).then(() => {
        setMessageCopied(true);
        setTimeout(() => {
          setMessageCopied(false);
        }, 2000);
      });
    };

    useEffect(() => {
      if (textareaRef.current) {
        textareaRef.current.style.height = 'inherit';
        textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
      }
    }, [isEditing]);

    return (
      <div
        className={`group px-4 ${
          chatNode.message.role === 'assistant'
            ? 'border-b border-black/10 bg-gray-50 text-gray-800 dark:border-gray-900/50 dark:bg-[#444654] dark:text-gray-100'
            : 'border-b border-black/10 bg-white text-gray-800 dark:border-gray-900/50 dark:bg-[#343541] dark:text-gray-100'
        }`}
        style={{ overflowWrap: 'anywhere' }}
      >
        <div className="relative m-auto flex gap-4 p-4 text-base md:max-w-2xl md:gap-6 md:py-6 lg:max-w-2xl lg:px-0 xl:max-w-3xl">
          <div className="min-w-[40px] text-right font-bold">
            {/* switch page */}
            <div className="flex flex-col">
              <div>
                {chatNode.message.role === 'assistant' ? (
                  <IconRobot size={30} />
                ) : (
                  <IconUser size={30} />
                )}
              </div>
              {totalPages > 1 && (
                <div className="flex justify-between text-xs font-normal absolute left-[-60px] top-[30px]">
                  <button
                    disabled={currentPage == 1}
                    className={(currentPage == 1 ? 'text-slate-500' : '') + ' pr-1'}
                    onClick={() => actions.clickSwitchNode(messageIndex, -1)}
                  >
                    &lt;
                  </button>
                  <div>
                    <span>{currentPage} / {totalPages}</span>
                  </div>
                  <button
                    disabled={currentPage == totalPages}
                    className={
                      (currentPage == totalPages ? 'text-slate-500' : '') + ' pl-1'
                    }
                    onClick={() => actions.clickSwitchNode(messageIndex, +1)}
                  >
                    &gt;
                  </button>
                </div>
              )}
            </div>
          </div>

          <div className="prose mt-[-2px] w-full dark:prose-invert">
            {chatNode.message.role === 'user' ? (
              <div className="flex w-full">
                {isEditing ? (
                  <div className="flex w-full flex-col">
                    <textarea
                      ref={textareaRef}
                      className="w-full resize-none whitespace-pre-wrap border-none dark:bg-[#343541]"
                      value={messageContent}
                      onChange={handleInputChange}
                      onKeyDown={handlePressEnter}
                      onCompositionStart={() => setIsTyping(true)}
                      onCompositionEnd={() => setIsTyping(false)}
                      style={{
                        fontFamily: 'inherit',
                        fontSize: 'inherit',
                        lineHeight: 'inherit',
                        padding: '0',
                        margin: '0',
                        overflow: 'hidden',
                      }}
                    />

                    <div className="mt-10 flex justify-center space-x-4">
                      <button
                        className="h-[40px] rounded-md bg-blue-500 px-4 py-1 text-sm font-medium text-white enabled:hover:bg-blue-600 disabled:opacity-50"
                        onClick={handleEditMessage}
                        disabled={messageContent.trim().length <= 0}
                      >
                        {t('Save & Submit')}
                      </button>
                      <button
                        className="h-[40px] rounded-md border border-neutral-300 px-4 py-1 text-sm font-medium text-neutral-700 hover:bg-neutral-100 dark:border-neutral-700 dark:text-neutral-300 dark:hover:bg-neutral-800"
                        onClick={() => {
                          setMessageContent(chatNode.message.content);
                          setIsEditing(false);
                        }}
                      >
                        {t('Cancel')}
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="prose whitespace-pre-wrap dark:prose-invert">
                    {chatNode.message.content}
                  </div>
                )}

                {(window.innerWidth < 640 || !isEditing) && (
                  <button
                    className={`absolute translate-x-[1000px] text-gray-500 hover:text-gray-700 focus:translate-x-0 group-hover:translate-x-0 dark:text-gray-400 dark:hover:text-gray-300 ${
                      window.innerWidth < 640
                        ? 'bottom-1 right-3'
                        : 'right-0 top-[26px]'
                    }
                    `}
                    onClick={toggleEditing}
                  >
                    <IconEdit size={20} />
                  </button>
                )}
              </div>
            ) : (
              <>
                <div
                  className={`absolute ${
                    window.innerWidth < 640
                      ? 'bottom-1 right-3'
                      : 'right-0 top-[26px] m-0'
                  }`}
                >
                  {messagedCopied ? (
                    <IconCheck
                      size={20}
                      className="text-green-500 dark:text-green-400"
                    />
                  ) : (
                    <button
                      className="translate-x-[1000px] text-gray-500 hover:text-gray-700 focus:translate-x-0 group-hover:translate-x-0 dark:text-gray-400 dark:hover:text-gray-300"
                      onClick={copyOnClick}
                    >
                      <IconCopy size={20} />
                    </button>
                  )}
                </div>

                <MemoizedReactMarkdown
                  className="prose dark:prose-invert"
                  remarkPlugins={[remarkGfm, remarkMath]}
                  rehypePlugins={[rehypeMathjax]}
                  components={{
                    code({ node, inline, className, children, ...props }) {
                      const match = /language-(\w+)/.exec(className || '');

                      return !inline ? (
                        <CodeBlock
                          key={Math.random()}
                          language={(match && match[1]) || ''}
                          value={String(children).replace(/\n$/, '')}
                          {...props}
                        />
                      ) : (
                        <code className={className} {...props}>
                          {children}
                        </code>
                      );
                    },
                    table({ children }) {
                      return (
                        <table className="border-collapse border border-black px-3 py-1 dark:border-white">
                          {children}
                        </table>
                      );
                    },
                    th({ children }) {
                      return (
                        <th className="break-words border border-black bg-gray-500 px-3 py-1 text-white dark:border-white">
                          {children}
                        </th>
                      );
                    },
                    td({ children }) {
                      return (
                        <td className="break-words border border-black px-3 py-1 dark:border-white">
                          {children}
                        </td>
                      );
                    },
                  }}
                >
                  {chatNode.message.content}
                </MemoizedReactMarkdown>
              </>
            )}
          </div>
        </div>
      </div>
    );
  },
);
ChatMessage.displayName = 'ChatMessage';
