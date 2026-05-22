import { DOCUMENT } from '@angular/common';
import { Injectable, effect, inject, signal } from '@angular/core';

const THEME_STORAGE_KEY = 'aivacol_theme';
type ThemeMode = 'light' | 'dark';

@Injectable({ providedIn: 'root' })
export class ThemeService {
  private readonly document = inject(DOCUMENT);
  readonly isDark = signal(false);

  constructor() {
    const initialTheme = this.resolveInitialTheme();
    this.isDark.set(initialTheme === 'dark');

    effect(() => {
      const darkMode = this.isDark();
      this.document.body.classList.toggle('dark-theme', darkMode);
      localStorage.setItem(THEME_STORAGE_KEY, darkMode ? 'dark' : 'light');
    });
  }

  toggleTheme() {
    this.isDark.update((current) => !current);
  }

  private resolveInitialTheme(): ThemeMode {
    const storedTheme = localStorage.getItem(THEME_STORAGE_KEY);
    if (storedTheme === 'dark' || storedTheme === 'light') {
      return storedTheme;
    }

    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  }
}
