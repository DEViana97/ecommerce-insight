'use client';

import React from 'react';
import { ThemeProvider as StyledThemeProvider } from 'styled-components';
import { lightTheme, darkTheme } from '../styles/theme';
import { GlobalStyles } from '../styles/globalStyles';
import { useFiltersStore } from '../store/filtersStore';

export default function ThemeProvider({ children }: { children: React.ReactNode }) {
  const theme = useFiltersStore((s) => s.theme);
  const activeTheme = theme === 'dark' ? darkTheme : lightTheme;

  return (
    <StyledThemeProvider theme={activeTheme}>
      <GlobalStyles />
      {children}
    </StyledThemeProvider>
  );
}
