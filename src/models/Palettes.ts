import { DropDownChoice } from './properties/PropertySpecs';

export type Palette = {
  menuItem: DropDownChoice;
  colors: string[];
};

export const PALETTE_GENERAL = [
  //Dark
  '#000000',
  '#7A1C1C',
  '#A14A00',
  '#B38F00',
  '#1F5D2B',
  '#1D3A6B',
  '#4B2E83',

  //Mid
  '#6B6B6B',
  '#D64545',
  '#F97316',
  '#FFD43B',
  '#4CAF50',
  '#3B82F6',
  '#8B5CF6',

  //light
  '#FFFFFF',
  '#FF9B9B',
  '#FDBA74',
  '#FFF3A3',
  '#A7E9AF',
  '#A5C8FF',
  '#D6C2FF',
];

export const PALETTE_RETRO = [
  // Row 1: grayscale + darks
  '#0B0B0B',
  '#3A1F2B',
  '#4A2A1B',
  '#5A4A1A',
  '#314A21',
  '#243B4A',
  '#3A2A4A',

  // Row 2: grayscale + mids
  '#2A2A2A',
  '#7A2E45',
  '#8A4B2A',
  '#9C7A2A',
  '#4F7A35',
  '#3A6A8C',
  '#6A4B8C',

  // Row 3: grayscale + lights
  '#555555',
  '#C05A78',
  '#C97A4A',
  '#D4B04C',
  '#7FBF5A',
  '#6FA7D6',
  '#A07ACF',

  // Row 4: grayscale + second set darks
  '#808080',
  '#1F4A4A',
  '#4A233A',
  '#2F355A',
  '#2E2450',
  '#5A1F3D',
  '#5A2630',

  // Row 5: grayscale + second set mids
  '#B0B0B0',
  '#2F7A7A',
  '#7A3A5A',
  '#4C5FA8',
  '#5C47A8',
  '#A13A6A',
  '#A84A58',

  // Row 6: grayscale + second set lights
  '#E0E0E0',
  '#6FC0B8',
  '#C27A9B',
  '#7FA8E0',
  '#9B85E0',
  '#D96A9A',
  '#D97A7A',
];

export const PALETTE_SHADING_EXTENDED = [
  // Grayscale
  '#000000',
  '#2B2B2B',
  '#555555',
  '#808080',
  '#AAAAAA',
  '#D5D5D5',
  '#FFFFFF',

  // Red
  '#2B0000',
  '#550000',
  '#800000',
  '#C1121F',
  '#E5383B',
  '#FF6B6B',
  '#FFB3B3',

  // Green
  '#002B00',
  '#0F3D0F',
  '#1B5E20',
  '#2E7D32',
  '#4CAF50',
  '#81C784',
  '#C8E6C9',

  // Blue
  '#001F3F',
  '#003566',
  '#0A4DA2',
  '#1D4ED8',
  '#3B82F6',
  '#93C5FD',
  '#DBEAFE',

  // Yellow
  '#3A2F00',
  '#7A5C00',
  '#A67C00',
  '#EAB308',
  '#FACC15',
  '#FDE047',
  '#FEF9C3',

  // Purple
  '#1E003A',
  '#3B0A75',
  '#4C1D95',
  '#7C3AED',
  '#8B5CF6',
  '#C4B5FD',
  '#E9D5FF',

  // Orange
  '#2B1400',
  '#5A2A00',
  '#8C3F00',
  '#D97706',
  '#F97316',
  '#FDBA74',
  '#FFEDD5',

  // Cyan
  '#002B2B',
  '#004F4F',
  '#007777',
  '#06B6D4',
  '#22D3EE',
  '#67E8F9',
  '#CFFAFE',

  // Pink
  '#2B0014',
  '#5A002A',
  '#8C0040',
  '#DB2777',
  '#F472B6',
  '#F9A8D4',
  '#FCE7F3',
];

export const PALETTE_SKIN = [
  // Light
  '#2E1C12',
  '#5A3A2A',
  '#8C5A3C',
  '#C48C5A',
  '#E8B98A',
  '#F2D3B1',
  '#FAE5C8',

  // Light-Medium
  '#3A2418',
  '#6A432E',
  '#9C6A4A',
  '#C9925F',
  '#E3B07C',
  '#F0C89C',
  '#F7D9B5',

  // Medium
  '#4A2E1F',
  '#7A4A32',
  '#A56B47',
  '#C98A5C',
  '#E0A876',
  '#F0C18F',
  '#F7D3A8',

  // Dark
  '#3A2418',
  '#5C3A28',
  '#7A4A32',
  '#9C6A4A',
  '#B8795C',
  '#D69A7A',
  '#E8B08F',

  // Very Dark
  '#1F120C',
  '#3A2418',
  '#5A3A2A',
  '#7A4A32',
  '#9C6A4A',
  '#C98A5C',
  '#E0A876',
];
