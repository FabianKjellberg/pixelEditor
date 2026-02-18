import { api } from '@/api/client';
import { useAiActionContext } from '@/context/AiActionsContext';
import { useCanvasContext } from '@/context/CanvasContext';
import { useCallback, useState } from 'react';

const AiModal = () => {
  const [text, setText] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);

  const { excecuteActions } = useAiActionContext();
  const { width, height } = useCanvasContext();

  const onChangeText = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setText(e.target.value);
    },
    [text],
  );

  const onClickButton = useCallback(async () => {
    setLoading(true);
    try {
      const actions = await api.ai.testAi(text, width, height);

      excecuteActions(actions);
    } finally {
      setLoading(false);
    }
  }, [text]);

  return (
    <>
      <input onChange={onChangeText} value={text} />
      <button onClick={onClickButton} disabled={loading}>
        Click me for ai
      </button>
    </>
  );
};

export default AiModal;
