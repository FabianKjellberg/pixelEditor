import {
  default1x1DitheringValue,
  default2x2DitheringValue,
  default4x4DitheringValue,
  default8x8DitheringValue,
  DitheringValue,
} from '@/models/properties/Properties';
import MultiChoice from '../MultiChoice/MultiChoice';
import { IDithering, IMultiChoice } from '@/models/properties/PropertySpecs';
import { useCallback, useEffect, useMemo } from 'react';
import PropertyLabel from '../PropertyLabel/PropertyLabel';

import styles from './Dithering.module.css';
import { useModalContext } from '@/context/ModalContext/ModalContext';
import DitheringPatternModal from '@/components/SpriteCreator/Modals/DitheringPatternModal/DitheringPatternModal';

type DitheringPropertyProps = {
  ditheringProperties: IDithering;
  value: DitheringValue;
  onChange: (choice: DitheringValue) => void;
};

const Dithering = ({ ditheringProperties, value, onChange }: DitheringPropertyProps) => {
  const { onShow, onHide } = useModalContext();

  const sizeProps = useMemo(
    (): IMultiChoice => ({
      type: 'multiChoice',
      label: ditheringProperties.firstLabel,
      choices: ditheringProperties.choices,
      allowEmpty: false,
    }),
    [ditheringProperties],
  );

  const sizeValue = useMemo(
    (): string =>
      value.size === 1
        ? '1x1'
        : value.size === 2
          ? '2x2'
          : value.size === 4
            ? '4x4'
            : value.size === 8
              ? '8x8'
              : '1x1s',
    [value.size],
  );

  const onChangeSize = useCallback((choice: string | null) => {
    onHide('dithering-pattern');
    onChange(
      choice === '1x1'
        ? default1x1DitheringValue
        : choice === '2x2'
          ? default2x2DitheringValue
          : choice === '4x4'
            ? default4x4DitheringValue
            : choice === '8x8'
              ? default8x8DitheringValue
              : default1x1DitheringValue,
    );
  }, []);

  const onClickEdit = useCallback(() => {
    onShow(
      'dithering-pattern',
      <DitheringPatternModal
        size={value.size}
        pattern={value.pattern}
        onChange={(nextPattern) => onChange({ ...value, pattern: nextPattern, default: false })}
      />,
      'Select pattern for dithering',
    );
  }, [onShow, value, onChange]);

  const onClickReset = useCallback(() => {
    onHide('dithering-pattern');
    onChange(
      value.size === 1
        ? default1x1DitheringValue
        : value.size === 2
          ? default2x2DitheringValue
          : value.size === 4
            ? default4x4DitheringValue
            : default8x8DitheringValue,
    );
  }, [onChange, value.size]);

  return (
    <>
      <MultiChoice multiChoiceProperties={sizeProps} value={sizeValue} onChange={onChangeSize} />
      <PropertyLabel label={'Pattern'} />
      <div className={styles.patternWrapper}>
        <div className={styles.patternValue} aria-label="Pattern type">
          {value.default ? 'Default' : 'Custom'}
        </div>
        <div className={styles.patternButtons}>
          <button type="button" disabled={value.size === 1} onClick={onClickEdit}>
            <img
              src="/icons/cog.png"
              width={16}
              height={16}
              alt="edit"
              className={styles.buttonIcon}
            />
          </button>
          <button
            type="button"
            disabled={value.size === 1}
            onClick={onClickReset}
            aria-label="Reset to default pattern"
          >
            <img
              src="/icons/resetBtn.png"
              width={16}
              height={16}
              alt="reset"
              className={styles.buttonIcon}
            />
          </button>
        </div>
      </div>
    </>
  );
};

export default Dithering;
