'use client';

import { useState, useEffect } from 'react';

export type Theme = 'default' | 'dark-glass';

export const THEMES: { id: Theme; name: string; description: string; accent: string; bg: string }[] = [
  {
    id: 'default',
    name: 'Dark Ember',
    description: 'Oscuro con acento naranja',
    accent: '#f97316',
    bg: '#1a1a1a',
  },
  {
    id: 'dark-glass',
    name: 'Dark Glass',
    description: 'Negro y gris con acento morado',
    accent: '#8b5cf6',
    bg: '#0e0e12',
  },
];

export function useTheme() {
  const [theme, setThemeState] = useState<Theme>('default');

  useEffect(() => {
    const saved = localStorage.getItem('gym-theme') as Theme | null;
    if (saved) setThemeState(saved);
  }, []);

  const setTheme = (newTheme: Theme) => {
    setThemeState(newTheme);
    localStorage.setItem('gym-theme', newTheme);
    document.documentElement.setAttribute('data-theme', newTheme);
  };

  return { theme, setTheme, themes: THEMES };
}
