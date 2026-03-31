import { useCallback, useMemo, useState } from 'react';
import type { ISlider } from '@/models/properties/PropertySpecs';
import Slider from '@/components/SpriteCreator/Menu/Tools/Properties/Slider/Slider';
import styles from './DitheringPatternModal.module.css';

type DitheringPatternModalProps = {
  size: number;
  pattern: number[][];
  onChange: (next: number[][]) => void;
};

type Cell = { x: number; y: number } | null;

function clampInt(n: number, min: number, max: number) {
  if (Number.isNaN(n)) return min;
  return Math.min(max, Math.max(min, n));
}

function clone2D(arr: number[][]) {
  return arr.map((row) => row.slice());
}

const DitheringPatternModal = ({ size, pattern, onChange }: DitheringPatternModalProps) => {
  const maxValue = useMemo(() => size * size - 1, [size]);
  const thresholdMax = size * size;

  const [localPattern, setLocalPattern] = useState(() => clone2D(pattern));
  const [threshold, setThreshold] = useState(0);
  const [editing, setEditing] = useState<Cell>(null);
  const [draft, setDraft] = useState<string>('');

  const sliderSpec: ISlider = useMemo(
    () => ({
      type: 'slider',
      label: 'Fill threshold',
      min: 0,
      max: thresholdMax,
      linear: true,
    }),
    [thresholdMax],
  );

  const startEditing = useCallback(
    (x: number, y: number) => {
      setEditing({ x, y });
      setDraft(String(localPattern[y]?.[x] ?? 0));
    },
    [localPattern],
  );

  const cancelEditing = useCallback(() => {
    setEditing(null);
    setDraft('');
  }, []);

  const isDraftValid = useCallback(
    (draftValue: string) => {
      const trimmed = draftValue.trim();
      if (trimmed === '') return false;
      const parsed = Number.parseInt(trimmed, 10);
      if (Number.isNaN(parsed)) return false;
      return parsed >= 0 && parsed <= maxValue;
    },
    [maxValue],
  );

  const commit = useCallback(() => {
    if (!editing) return;

    const parsed = Number.parseInt(draft.trim(), 10);
    const nextValue = Number.isNaN(parsed) ? 0 : clampInt(parsed, 0, maxValue);

    const next = clone2D(localPattern);
    if (!next[editing.y]) return;

    next[editing.y][editing.x] = nextValue;
    setLocalPattern(next);
    onChange(next);

    setEditing(null);
    setDraft('');
  }, [draft, editing, localPattern, maxValue, onChange]);

  const handleBlur = useCallback(() => {
    if (!editing) return;
    if (isDraftValid(draft)) {
      commit();
    } else {
      cancelEditing();
    }
  }, [draft, editing, isDraftValid, commit, cancelEditing]);

  const filledCount = useMemo(() => {
    let count = 0;
    for (let y = 0; y < localPattern.length; y++) {
      const row = localPattern[y];
      if (!row) continue;
      for (let x = 0; x < row.length; x++) {
        if (row[x] < threshold) count++;
      }
    }
    return count;
  }, [localPattern, threshold]);

  const gap = 6;
  const cellSize = size === 2 ? 47 : 32;
  const gridWidth = cellSize * size + gap * (size - 1);

  return (
    <div
      className={styles.wrapper}
      style={{ ['--grid-width' as string]: `${gridWidth}px` }}
      data-size={size}
    >
      <div className={styles.header}>
        <h3 className={styles.title}>Dithering pattern</h3>
        <p className={styles.description}>
          Each cell has a fill order (0 to {size * size - 1}). Lower numbers are filled first when
          dithering; use the slider to see how the pattern looks at different fill amounts.
        </p>
      </div>
      <div className={styles.row}>
        <div className={styles.previewSection}>
          <div
            className={styles.preview}
            style={{ gridTemplateColumns: `repeat(${size}, 1fr)` }}
            aria-label={`Preview: ${filledCount} of ${thresholdMax} filled at threshold ${threshold}`}
          >
            {localPattern.map((row, y) =>
              row.map((value, x) => (
                <div
                  key={`${x}-${y}`}
                  className={value < threshold ? styles.previewFilled : styles.previewEmpty}
                />
              )),
            )}
          </div>
          <p className={styles.previewLabel}>
            {filledCount} filled / {thresholdMax - filledCount} empty (threshold {threshold})
          </p>
        </div>
        <div className={styles.gridSection}>
          <div
            className={styles.grid}
            style={{ gridTemplateColumns: `repeat(${size}, ${cellSize}px)` }}
          >
            {localPattern.map((row, y) =>
              row.map((value, x) => {
                const isEditing = editing?.x === x && editing?.y === y;

                return (
                  <div key={`${x}-${y}`} className={styles.cell}>
                    {isEditing ? (
                      <input
                        className={styles.valueInput}
                        value={draft}
                        inputMode="numeric"
                        autoFocus
                        onChange={(e) => setDraft(e.target.value)}
                        onFocus={(e) => e.currentTarget.select()}
                        onBlur={handleBlur}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            if (isDraftValid(draft)) commit();
                            else cancelEditing();
                          } else if (e.key === 'Escape') {
                            e.preventDefault();
                            cancelEditing();
                          }
                        }}
                      />
                    ) : (
                      <button
                        type="button"
                        className={styles.valueButton}
                        onClick={() => startEditing(x, y)}
                        aria-label={`Edit value at ${x}, ${y}`}
                      >
                        {value}
                      </button>
                    )}
                  </div>
                );
              }),
            )}
          </div>
        </div>
      </div>
      <div className={styles.sliderSection}>
        <Slider sliderProperties={sliderSpec} value={threshold} onChange={setThreshold} />
      </div>
    </div>
  );
};

export default DitheringPatternModal;
