'use client';

import { useEffect } from 'react';
import { useDitheringEdit } from '@/context/DitheringEditContext/DitheringEditContext';
import DitheringPatternModal from './DitheringPatternModal';

export default function DitheringPatternModalWithContext() {
  const { ditheringEdit, setDitheringEdit } = useDitheringEdit();

  useEffect(() => {
    return () => setDitheringEdit(null);
  }, [setDitheringEdit]);

  if (!ditheringEdit) return null;

  const { value, onChange } = ditheringEdit;

  return (
    <DitheringPatternModal
      size={value.size}
      pattern={value.pattern}
      onChange={(nextPattern) => onChange({ ...value, pattern: nextPattern, default: false })}
    />
  );
}
