import { FetchedLayer, UrlHeader } from '@/models/apiModels/projectModels';
import { Layer, LayerEntity, Rectangle } from '@/models/Layer';
import { createLayer, createLayerEntity } from './LayerUtil';

export type BlobUrl = {
  url: string;
  headers?: UrlHeader;
  expiration: string;
};

export function makeBlob(arr: Uint32Array): Blob {
  const view = new Uint8Array(arr.buffer, arr.byteOffset, arr.byteLength);
  const copy = view.slice();
  return new Blob([copy], { type: 'application/octet-stream' });
}

export async function blobToUint32Array(blob: Blob): Promise<Uint32Array> {
  const buffer = await blob.arrayBuffer();
  return new Uint32Array(buffer);
}

export async function uploadBlob(blobUrl: BlobUrl, body: BodyInit): Promise<boolean> {
  try {
    const response = await fetch(blobUrl.url, {
      method: 'PUT',
      headers: blobUrl.headers,
      body,
    });

    if (!response.ok) {
      const text = await response.text().catch(() => '<could not read body>');
      console.error('R2 upload failed:', response.status, response.statusText, text);
    }

    return response.ok;
  } catch (error) {
    console.error(error);
    return false;
  }
}

export async function downloadBlob(blobUrl: BlobUrl): Promise<Blob | null> {
  try {
    const response = await fetch(blobUrl.url, {
      method: 'GET',
      headers: blobUrl.headers,
    });

    if (!response.ok) {
      const text = await response.text().catch(() => '<could not read body>');
      console.error('R2 upload failed:', response.status, response.statusText, text);
    }

    return response.blob();
  } catch (error) {
    console.error(error);
    return null;
  }
}

export async function getLayerFromBlob(layer: FetchedLayer): Promise<LayerEntity | null> {
  const blobUrl: BlobUrl = {
    url: layer.signedBlobUrl,
    expiration: '180',
  };

  const layerBlob = await downloadBlob(blobUrl);

  if (!layerBlob) return null;

  const pixels = await blobToUint32Array(layerBlob);

  const layerRectangle: Rectangle = {
    x: layer.x,
    y: layer.y,
    width: layer.width,
    height: layer.height,
  };

  const newLayer: Layer = { rect: layerRectangle, pixels };

  return createLayerEntity(layer.name, layer.id, newLayer);
}

export async function createPreview(
  source: HTMLCanvasElement,
  maxSize = 124,
  quality = 0.85,
): Promise<Blob> {
  const srcW = source.width;
  const srcH = source.height;

  if (srcW <= 0 || srcH <= 0) {
    throw new Error('createPreview: source canvas has no size');
  }

  // downscale only (never upscale)
  const scale = Math.min(1, maxSize / Math.max(srcW, srcH));
  const outW = Math.max(1, Math.floor(srcW * scale));
  const outH = Math.max(1, Math.floor(srcH * scale));

  const target = document.createElement('canvas');
  target.width = outW;
  target.height = outH;

  const ctx = target.getContext('2d');
  if (!ctx) throw new Error('createPreview: failed to get 2d context');

  // better quality for downscaling
  ctx.imageSmoothingEnabled = false;

  ctx.clearRect(0, 0, outW, outH);
  ctx.drawImage(source, 0, 0, outW, outH);

  const blob = await new Promise<Blob>((resolve, reject) => {
    target.toBlob(
      (b) => (b ? resolve(b) : reject(new Error('createPreview: toBlob returned null'))),
      'image/webp',
      quality,
    );
  });

  return blob;
}
