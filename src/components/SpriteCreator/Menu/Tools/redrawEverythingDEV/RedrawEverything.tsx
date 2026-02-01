'use client';

import { api, apiClient } from '@/api/client';
import { useCanvasContext } from '@/context/CanvasContext';
import { createSelectionLayer } from '@/util/SelectionUtil';
import { useCallback } from 'react';

const RedrawEverything = () => {
  const { setPixelSize, pixelSize, setSelectionLayer } = useCanvasContext();

  const zoomIn = () => {
    if (pixelSize > 100) return;
    setPixelSize(Math.ceil(pixelSize * 1.2));
  };

  const zoomOut = () => {
    if (pixelSize <= 1) return;
    setPixelSize(Math.floor(pixelSize * 0.8));
  };

  const makeSelection = () => {
    const selectionLayer = createSelectionLayer(3, 3, 10, 10, true);

    setSelectionLayer(selectionLayer);
  };

  const register = useCallback(async () => {
    await api.users.createAccount('admin', 'admin');
  }, []);

  const login = useCallback(async () => {
    await api.users.login('admin', 'admin');
  }, []);

  const refresh = useCallback(async () => {
    await api.users.refresh();
  }, []);

  const testAuth = useCallback(async () => {
    const reponse = await apiClient('GET', '/auth/test-auth');

    console.log(reponse);
  }, []);

  return (
    <>
      <button
        onClick={() => {
          zoomIn();
        }}
      >
        zoom in
      </button>
      <button
        onClick={() => {
          zoomOut();
        }}
      >
        zoom out
      </button>
      <button onClick={makeSelection}>make selection</button>
      <button onClick={register}>register</button>
      <button onClick={login}>login</button>
      <button onClick={refresh}>refresh</button>
      <button onClick={testAuth}>testAuths</button>
    </>
  );
};
export default RedrawEverything;
