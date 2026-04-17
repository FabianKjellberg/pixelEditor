'use client';

import { IMultiChoice } from '@/models/properties/PropertySpecs';
import MultiChoice from '../../Menu/Tools/Properties/MultiChoice/MultiChoice';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useColorContext } from '@/context/ColorContext';
import PaletteColorPicker from './PaletteColorPicker/PaletteColorPicker';

import styles from './EditPaletteModal.module.css';
import PaletteColors from './PaletteColors/PaletteColors';

const EditPaletteModal = () => {
  const { userPallets, setUserPallets } = useColorContext();

  const [selectedPaletteId, setSelectedPaletteId] = useState<string | null>(
    userPallets.length < 1 ? null : userPallets[0].menuItem.id,
  );

  const selectedPalette = useMemo(() => {
    if (!selectedPaletteId) return undefined;
    return userPallets.find((palette) => palette.menuItem.id === selectedPaletteId);
  }, [selectedPaletteId, userPallets]);

  useEffect(() => {
    if (userPallets.length === 0) {
      if (selectedPaletteId !== null) {
        setSelectedPaletteId(null);
      }
      return;
    }

    if (
      !selectedPaletteId ||
      !userPallets.some((palette) => palette.menuItem.id === selectedPaletteId)
    ) {
      setSelectedPaletteId(userPallets[0].menuItem.id);
    }
  }, [selectedPaletteId, userPallets]);

  const selectedPaletteValue = useMemo(() => {
    return selectedPaletteId ?? 'You have no palettes';
  }, [selectedPaletteId]);

  const multiChoiceProps: IMultiChoice = useMemo(() => {
    const choices = userPallets.map((palette) => palette.menuItem);

    console.log('changed name??');

    return {
      type: 'multiChoice',
      label: 'Select palette',
      choices: choices,
      allowEmpty: false,
      disabled: choices.length < 1,
    };
  }, [userPallets]);

  const onChangePalette = useCallback(
    (value: string | null) => {
      setSelectedPaletteId(value);
    },
    [setSelectedPaletteId],
  );

  const createEmptyPalette = useCallback(() => {
    const id = crypto.randomUUID();
    const name = 'new palette';
    const newPalette = { menuItem: { id, text: name }, colors: [] };

    setUserPallets((prev) => {
      return [...prev, newPalette];
    });
    setSelectedPaletteId(id);
  }, [setUserPallets]);

  const [inputValue, setInputValue] = useState<string>(selectedPalette?.menuItem.text ?? '');

  useEffect(() => {
    setInputValue(selectedPalette?.menuItem.text ?? '');
  }, [selectedPalette]);

  const onChangeInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value);
  }, []);

  const tryChangeName = useCallback(() => {
    if (!selectedPalette) return;

    if (selectedPalette.menuItem.text === inputValue) {
      return;
    }

    setUserPallets((prev) => {
      return prev.map((p) => {
        return p.menuItem.id === selectedPalette.menuItem.id
          ? { ...p, menuItem: { ...p.menuItem, text: inputValue } }
          : p;
      });
    });
  }, [inputValue, selectedPalette, setUserPallets]);

  const onCommitChange = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        e.currentTarget.blur();
      }
    },
    [tryChangeName],
  );

  const onDeletePalette = useCallback(() => {
    if (!selectedPalette) return;

    setUserPallets((prev) => prev.filter((p) => p.menuItem.id !== selectedPalette.menuItem.id));
  }, [selectedPalette, setUserPallets]);

  return (
    <div className={styles.wrapper}>
      <div className={styles.leftWrapper}>
        <div className={styles.leftContent}>
          <div className={styles.buttons}>
            <button onClick={createEmptyPalette}>Create new</button>
            <button disabled={selectedPalette === undefined} onClick={onDeletePalette}>
              <img
                src="/icons/bin.png"
                width={16}
                height={16}
                alt="bin"
                className={styles.buttonIcon}
              />
            </button>
          </div>
          <div className={styles.multiChoice}>
            <MultiChoice
              onChange={onChangePalette}
              value={selectedPaletteValue}
              multiChoiceProperties={multiChoiceProps}
            />
          </div>
          <div className={styles.paletteInfoWrapper}>
            <div className={styles.paletteInfoContent}>
              <p className={styles.changeName}>Palette name:</p>
              <input
                value={inputValue}
                disabled={selectedPalette === undefined}
                onChange={onChangeInput}
                onBlur={tryChangeName}
                onKeyDown={onCommitChange}
              />
              <p className={styles.changeName}>Colors:</p>
              <PaletteColors palette={selectedPalette} />
            </div>
          </div>
        </div>
      </div>
      <div>
        <PaletteColorPicker selectedPalette={selectedPalette} />
      </div>
    </div>
  );
};

export default EditPaletteModal;
