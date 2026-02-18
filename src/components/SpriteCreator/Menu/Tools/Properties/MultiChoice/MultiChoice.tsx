import { IMultiChoice } from '@/models/Tools/PropertySpecs';
import PropertyLabel from '../PropertyLabel/PropertyLabel';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import styles from './MultiChoice.module.css';

type MultiChoiceProps = {
  multiChoiceProperties: IMultiChoice;
  value: string | null;
  onChange: (choice: string | null) => void;
};

const MultiChoice = ({ multiChoiceProperties, value, onChange }: MultiChoiceProps) => {
  const [multiChoiceOpen, setMultiChoiceOpen] = useState<boolean>(false);
  const [dropdownPosition, setDropdownPosition] = useState<{ top: number; left: number; width: number } | null>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  const label = useMemo(() => multiChoiceProperties.label, [multiChoiceProperties.label]);

  const updateDropdownPosition = useCallback(() => {
    if (buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();
      setDropdownPosition({
        top: rect.bottom,
        left: rect.left,
        width: rect.width,
      });
    }
  }, []);

  const toggleMultiChoiceMenu = useCallback(() => {
    if (!multiChoiceOpen) {
      updateDropdownPosition();
    }
    setMultiChoiceOpen((prev) => !prev);
  }, [multiChoiceOpen, updateDropdownPosition]);

  const handleChoiceSelect = useCallback(
    (choice: string | null) => {
      onChange(choice);
      setMultiChoiceOpen(false);
    },
    [onChange],
  );

  // Update position on scroll/resize
  useEffect(() => {
    if (multiChoiceOpen) {
      const handleUpdate = () => {
        updateDropdownPosition();
      };
      window.addEventListener('scroll', handleUpdate, true);
      window.addEventListener('resize', handleUpdate);
      return () => {
        window.removeEventListener('scroll', handleUpdate, true);
        window.removeEventListener('resize', handleUpdate);
      };
    }
  }, [multiChoiceOpen, updateDropdownPosition]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setMultiChoiceOpen(false);
      }
    };

    if (multiChoiceOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [multiChoiceOpen]);

  return (
    <>
      <PropertyLabel label={label} />
      <div className={styles.multiChoiceWrapper} ref={wrapperRef}>
        <button ref={buttonRef} className={styles.selectedChoiceButton} onClick={toggleMultiChoiceMenu}>
          <span className={styles.choiceText}>{value || 'Select...'}</span>
          <span className={`${styles.dropdownArrow} ${multiChoiceOpen ? styles.dropdownArrowOpen : ''}`}>
            ▼
          </span>
        </button>
        {multiChoiceOpen && dropdownPosition && (
          <div
            className={styles.selectButtons}
            style={{
              top: `${dropdownPosition.top}px`,
              left: `${dropdownPosition.left}px`,
              width: `${dropdownPosition.width}px`,
            }}
          >
            {multiChoiceProperties.allowEmpty && (
              <button onClick={() => handleChoiceSelect(null)}> </button>
            )}
            {multiChoiceProperties.choices.map((choice, index) => (
              <button
                key={index}
                onClick={() => handleChoiceSelect(choice)}
                className={value === choice ? styles.selectedOption : ''}
              >
                {choice}
              </button>
            ))}
          </div>
        )}
      </div>
    </>
  );
};

export default MultiChoice;
