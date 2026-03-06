import type { Theme } from '../types';

export interface ColorTokens {
  canvasBg: string;
  gridMajor: string;
  gridMinor: string;
  axisLine: string;
  pointDefault: string;
  lineDefault: string;
  rayColor: string;
  virtualImage: string;
  realImage: string;
  selected: string;
}

const darkTokens: ColorTokens = {
  canvasBg: '#0f1117',
  gridMajor: '#2a2d3a',
  gridMinor: '#1a1d27',
  axisLine: '#4a4f6a',
  pointDefault: '#60a5fa',
  lineDefault: '#34d399',
  rayColor: '#fbbf24',
  virtualImage: '#a78bfa',
  realImage: '#f87171',
  selected: '#f59e0b',
};

const lightTokens: ColorTokens = {
  canvasBg: '#f8f9fa',
  gridMajor: '#d0d5dd',
  gridMinor: '#e8eaed',
  axisLine: '#9aa0b4',
  pointDefault: '#2563eb',
  lineDefault: '#059669',
  rayColor: '#d97706',
  virtualImage: '#7c3aed',
  realImage: '#dc2626',
  selected: '#d97706',
};

export function getColorTokens(theme: Theme): ColorTokens {
  return theme === 'dark' ? darkTokens : lightTokens;
}
