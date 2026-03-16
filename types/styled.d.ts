import 'styled-components';
import { lightTheme } from '../styles/theme';

declare module 'styled-components' {
  export interface DefaultTheme extends Omit<typeof lightTheme, 'mode'> {
    mode: 'light' | 'dark';
  }
}
