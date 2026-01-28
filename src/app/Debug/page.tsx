'use client';

import { getPixelIndex } from '@/helpers/color';
import { Cordinate } from '@/models/Layer';
import React, { useRef, useEffect } from 'react';

const Debug = () => {
  const numbers: Cordinate[] = [];

  const x1: number = 1;
  const y1: number = 1;
  const x2: number = 0;
  const y2: number = 0;

  const dX = Math.abs(x1 - x2);
  const dY = Math.abs(y1 - y2);

  const longestDistance = Math.max(dX, dY);

  const yDir = y1 >= y2 ? -1 : 1;
  const xDir = x1 >= x2 ? -1 : 1;

  console.log('start');
  for (let i: number = 1; i < longestDistance + 1; i++) {
    const dSteps: number = i / longestDistance;

    const stepX = x1 + xDir * Math.round(dSteps * dX);
    const stepY = y1 + yDir * Math.round(dSteps * dY);

    numbers.push({ x: stepX, y: stepY });
    console.log('x:', stepX, 'y:', stepY);
  }
  console.log('stop');

  const size = 3;
  const x = 5;
  const y = 5;
  const newX = x - Math.floor(size / 2) + (xDir === -1 ? 0 : size - 1);
  const newY = y - Math.floor(size / 2) + (yDir === -1 ? 0 : size - 1);

  console.log('xDir: ', xDir, ' yDir: ', yDir);

  for (let i: number = 0; i < size; i++) {
    console.log('x: ', newX, 'y: ', newY + i * -yDir);
  }

  for (let i: number = 0; i < size; i++) {
    console.log('x: ', newX + i * -xDir, 'y: ', newY);
  }

  return <>hej</>;
};

export default Debug;
