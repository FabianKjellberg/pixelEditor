import { useEffect, useState } from 'react';

export default function useSize(ref: React.RefObject<HTMLElement | null>) {
  const [size, setSize] = useState({ width: 0, height: 0 });

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const ro = new ResizeObserver(([entry]) => {
      const { width, height } = entry.contentRect;
      setSize({ width, height });
    });
    ro.observe(el);

    // Initial read in case ResizeObserver fires late
    const rect = el.getBoundingClientRect();
    setSize({ width: rect.width, height: rect.height });

    return () => ro.disconnect();
  }, [ref]);

  return size;
}
