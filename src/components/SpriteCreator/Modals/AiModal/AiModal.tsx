import { api } from '@/api/client';
import { useAiActionContext } from '@/context/AiActionsContext';
import { useCanvasContext } from '@/context/CanvasContext';
import { useCallback, useState } from 'react';

import styles from './AiModal.module.css';
import ChatMessage, { ChatMessageItem } from './ChatMessage/ChatMessage';
import Loading from '@/components/Loading/Loading';
import { MessageItem } from '@/models/AiModels';

const AiModal = () => {
  const [text, setText] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);

  const { excecuteActions } = useAiActionContext();
  const { width, height } = useCanvasContext();

  const [chatMessages, setChatMessages] = useState<ChatMessageItem[]>([
    {
      message:
        'Hello, I am an AI here to help you create your pixel art. You can either ask me a question about the program or you can tell me what you want drawn and i will do my best to draw it',
      receieved: true,
      loading: false,
    },
  ]);

  const onChangeText = useCallback(
    (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      setText(e.target.value);
    },
    [text],
  );

  const onClickButton = useCallback(async () => {
    setLoading(true);
    try {
      const newMessages: ChatMessageItem[] = [
        { message: text, receieved: false, loading: false },
        ...chatMessages,
      ];

      setChatMessages(newMessages);
      setText('');

      const promt: MessageItem[] = newMessages.map((m) => ({
        message: m.message,
        fromUser: !m.receieved,
      }));

      const actions = await api.ai.testAi(promt, width, height);

      excecuteActions(actions);
    } finally {
      setLoading(false);
    }
  }, [text, chatMessages, setChatMessages]);

  return (
    <>
      <div className={styles.wrapper}>
        <div className={styles.chatBox}>
          {chatMessages.map((message, index) => (
            <ChatMessage message={message} key={index} />
          ))}
        </div>
        <div className={styles.userInput}>
          <textarea
            rows={4}
            cols={50}
            value={text}
            onChange={onChangeText}
            placeholder="Write your promt here"
            style={{ resize: 'none' }}
          />
          <button onClick={onClickButton} disabled={loading || text.trim().length == 0}>
            {loading ? <Loading withText={false} /> : <p>Send</p>}
          </button>
        </div>
      </div>
    </>
  );
};

export default AiModal;
