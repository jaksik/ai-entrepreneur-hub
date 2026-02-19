'use client';

import { useTheme } from './index';
import styles from './ThemeToggle.module.css';

export function ThemeToggle() {
  const { toggleTheme } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      className={styles.toggle}
      aria-label="Toggle dark mode"
    >
      🌓
    </button>
  );
}
