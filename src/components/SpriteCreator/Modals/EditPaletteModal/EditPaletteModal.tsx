'use client';

import { IMultiChoice } from '@/models/properties/PropertySpecs';
import MultiChoice from '../../Menu/Tools/Properties/MultiChoice/MultiChoice';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useColorContext } from '@/context/ColorContext';
import PaletteColorPicker from './PaletteColorPicker/PaletteColorPicker';

import styles from './EditPaletteModal.module.css';
import ColorButton from '../../Menu/ColorPalette/ColorButton/ColorButton';
import PaletteColors from './PaletteColors/PaletteColors';

const NON_ALLOWED_NAMES: string[] = ['general', 'retro', 'shading', 'skin color', 'recents'];

const EditPaletteModal = () => {
  const { userPallets, setUserPallets } = useColorContext();

  const [selectPaletteValue, setSelectPaletteValue] = useState<string>(
    userPallets.length < 1 ? 'you have no palette' : userPallets[0].name,
  );

  const selectedPalette = useMemo(() => {
    return userPallets.find((pallete) => pallete.name === selectPaletteValue);
  }, [selectPaletteValue, userPallets]);

  const multiChoiceProps: IMultiChoice = useMemo(() => {
    const choices = userPallets.map((pallete) => pallete.name);

    return {
      type: 'multiChoice',
      label: 'Select palette',
      choices: choices,
      allowEmpty: false,
      disabled: choices.length < 1,
    };
  }, [userPallets]);

  const onChangePalette = useCallback((value: string | null) => {
    setSelectPaletteValue(value ?? 'none');
  }, []);

  const createEmptyPalette = useCallback(() => {
    const newName = 'new palette';
    let name = newName;

    let nameTaken = userPallets.some((p) => p.name === name);
    let counter = 1;
    while (nameTaken) {
      name = `${newName} (${counter})`;

      nameTaken = userPallets.some((p) => p.name === name);
      counter++;
    }

    setUserPallets((prev) => {
      return [...prev, { name, colors: [] }];
    });
    setSelectPaletteValue(name);
  }, [userPallets]);

  const [inputValue, setInputValue] = useState<string>(selectedPalette?.name ?? '');

  useEffect(() => {
    setInputValue(selectedPalette?.name ?? '');
  }, [selectedPalette]);

  const onChangeInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value);
  }, []);

  const notAllowedName = useMemo(() => {
    const alreadyExists = userPallets
      .filter((p) => p.name !== selectedPalette?.name)
      .some((p) => p.name === inputValue);

    const notAllowed = NON_ALLOWED_NAMES.some((n) => n === inputValue);

    return alreadyExists || notAllowed;
  }, [inputValue, userPallets]);

  const tryChangeName = useCallback(() => {
    if (!selectedPalette || selectedPalette.name === inputValue) return;

    if (notAllowedName) {
      setInputValue(selectedPalette.name);
      return;
    }

    setUserPallets((prev) => {
      return prev.map((p) => {
        return p.name === selectedPalette?.name ? { ...p, name: inputValue } : p;
      });
    });

    setSelectPaletteValue(inputValue);
  }, [userPallets, inputValue, notAllowedName]);

  const onCommitChange = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        e.currentTarget.blur();
      }
    },
    [tryChangeName],
  );

  return (
    <div className={styles.wrapper}>
      <div className={styles.leftWrapper}>
        <div className={styles.leftContent}>
          <div className={styles.multiChoice}>
            <MultiChoice
              onChange={onChangePalette}
              value={selectPaletteValue}
              multiChoiceProperties={multiChoiceProps}
            />
          </div>
          <div className={styles.paletteInfoWrapper}>
            <div className={styles.paletteInfoContent}>
              <p className={styles.changeName}>Palette name:</p>
              <input
                className={`${notAllowedName ? styles.redBorder : ''}`}
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
        <div className={styles.buttons}>
          <button onClick={createEmptyPalette}>+</button>
          <button disabled={selectedPalette === undefined}>
            <img
              src="/icons/bin.png"
              width={16}
              height={16}
              alt="bin"
              className={styles.buttonIcon}
            />
          </button>
        </div>
      </div>
      <div>
        <PaletteColorPicker selectedPalette={selectedPalette} />
      </div>
    </div>
  );
};

export default EditPaletteModal;
