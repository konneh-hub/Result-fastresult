import React, { useEffect, useState } from 'react';

const ThemeSwitcher = () => {
  const [dark, setDark] = useState(() => {
    try {
      const stored = localStorage.getItem('theme');
      if (stored) return stored === 'dark';
    } catch {}
    // prefer system preference
    return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
  });

  useEffect(() => {
    const root = document.documentElement;
    if (dark) {
      root.classList.add('dark-theme');
      localStorage.setItem('theme', 'dark');
    } else {
      root.classList.remove('dark-theme');
      localStorage.setItem('theme', 'light');
    }
  }, [dark]);

  return (
    <button
      aria-label="Toggle theme"
      className="theme-switcher"
      onClick={() => setDark((d) => !d)}
    >
      {dark ? '🌙' : '☀️'}
    </button>
  );
};

export default ThemeSwitcher;
