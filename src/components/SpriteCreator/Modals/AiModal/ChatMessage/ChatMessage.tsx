import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';
import styles from './ChatMessage.module.css';
import { MessageItem } from '@/models/AiModels';
import Loading from '@/components/Loading/Loading';

export type ChatMessageItem = {
  message: string;
  receieved: boolean;
  loading: boolean;
};

type ChatMessageProps = {
  message: MessageItem;
  loading?: boolean;
};

const ChatMessage = ({ message, loading = false }: ChatMessageProps) => {
  const divRef = useRef<HTMLDivElement | null>(null);
  const [rect, setRect] = useState<DOMRect | null>(null);

  useLayoutEffect(() => {
    const element = divRef.current;
    if (!element) return;

    const update = () => setRect(element.getBoundingClientRect());
    update();

    const observer = new ResizeObserver(update);
    observer.observe(element);

    return () => observer.disconnect();
  }, []);

  const generateRectangles = useCallback((width: number, height: number) => {
    const pw = 2;

    return (
      <>
        <rect x={pw * 6} y={0} width={width - pw * 12} height={pw * 2} fill="white" />
        <rect x={pw * 6} y={height - pw * 2} width={width - pw * 12} height={pw * 2} fill="white" />
        <rect x={0} y={pw * 6} width={4} height={height - pw * 12} fill="white" />
        <rect x={width - pw * 2} y={pw * 6} width={4} height={height - pw * 12} fill="white" />
        <rect x={pw * 2} y={pw * 2} width={pw * 2} height={pw * 2} fill="white" />
        <rect x={pw * 4} y={pw} width={pw * 2} height={pw * 2} fill="white" />
        <rect x={pw} y={pw * 4} width={pw * 2} height={pw * 2} fill="white" />
        <rect x={width - pw * 4} y={pw * 2} width={pw * 2} height={pw * 2} fill="white" />
        <rect x={width - pw * 6} y={pw} width={pw * 2} height={pw * 2} fill="white" />
        <rect x={width - pw * 3} y={pw * 4} width={pw * 2} height={pw * 2} fill="white" />
        <rect x={width - pw * 4} y={height - pw * 4} width={pw * 2} height={pw * 2} fill="white" />
        <rect x={width - pw * 6} y={height - pw * 3} width={pw * 2} height={pw * 2} fill="white" />
        <rect x={width - pw * 3} y={height - pw * 6} width={pw * 2} height={pw * 2} fill="white" />
        <rect x={pw * 2} y={height - pw * 4} width={pw * 2} height={pw * 2} fill="white" />
        <rect x={pw * 4} y={height - pw * 3} width={pw * 2} height={pw * 2} fill="white" />
        <rect x={pw} y={height - pw * 6} width={pw * 2} height={pw * 2} fill="white" />
      </>
    );
  }, []);

  return (
    <div
      className={`${styles.messageRow} ${
        !message.fromUser ? styles.leftMessage : styles.rightMessage
      }`}
    >
      <div className={styles.bubbleContainer}>
        {rect && (
          <svg
            className={styles.svgBorder}
            width={Math.round(rect.width)}
            height={Math.round(rect.height)}
            shapeRendering="crispEdges"
          >
            {generateRectangles(Math.round(rect.width), Math.round(rect.height))}
          </svg>
        )}

        <div ref={divRef} className={styles.bubble}>
          {loading ? (
            <div className={styles.loading}>
              <p>Generating response </p>
              <Loading withText={false} size={16} />
            </div>
          ) : (
            <p>{message.message}</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default ChatMessage;
