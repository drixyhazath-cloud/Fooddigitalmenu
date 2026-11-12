import React, { useState, useRef, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { AppRole } from '../types';
import {
  Volume2,
  VolumeX,
  Smartphone,
  Tablet,
  Monitor,
  Sun,
  Moon,
  SlidersHorizontal,
  Check,
} from 'lucide-react';

export const Navbar: React.FC = () => {
  const {
    role,
    setRole,
    viewportMode,
    setViewportMode,
    soundEnabled,
    toggleSound,
    activeOrders,
    theme,
    toggleTheme,
    setTheme,
  } = useApp();

  const [showOptionsDropdown, setShowOptionsDropdown] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close options dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setShowOptionsDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const navLinks: { role: AppRole; label: string; count?: number }[] = [
    { role: 'waiter', label: 'Waiter Terminal' },
    { role: 'kitchen', label: 'Kitchen Display (KDS)', count: activeOrders.length },
    { role: 'admin', label: 'Admin & Reports' },
    { role: 'projects', label: 'Operations & Tasks' },
  ];

  return (
    <header className="sticky top-0 z-40 bg-white dark:bg-neutral-900 border-b border-neutral-200 dark:border-neutral-800 text-neutral-900 dark:text-neutral-100 transition-colors duration-200">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-8 px-4 sm:px-6 py-3.5">
        {/* Zone 1: Single text wordmark */}
        <div className="flex items-center gap-3 shrink-0">
          <a
            href="#"
            onClick={(e) => {
              e.preventDefault();
              setRole('waiter');
            }}
            className="text-lg font-bold tracking-tight text-neutral-900 dark:text-white whitespace-nowrap shrink-0 hover:text-amber-600 dark:hover:text-amber-400 transition-colors"
          >
            Food Digital Menu
          </a>
          <span className="text-xs text-neutral-500 dark:text-neutral-400 hidden sm:inline-block">
            · FDM Suite
          </span>
        </div>

        {/* Zone 2: Clean single-line links with active state */}
        <nav className="flex items-center gap-1 sm:gap-2 overflow-x-auto py-1 scrollbar-none">
          {navLinks.map((link) => {
            const isActive = role === link.role;
            return (
              <button
                key={link.role}
                onClick={() => setRole(link.role)}
                className={`flex items-center gap-2 px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap shrink-0 ${
                  isActive
                    ? 'bg-neutral-100 dark:bg-neutral-800 text-amber-600 dark:text-amber-400 shadow-xs border border-neutral-300 dark:border-neutral-700 font-semibold'
                    : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-800/50'
                }`}
              >
                <span>{link.label}</span>
                {link.count !== undefined && link.count > 0 && (
                  <span className="text-[10px] font-mono font-semibold px-1.5 py-0.2 bg-amber-500/20 text-amber-700 dark:text-amber-300 rounded border border-amber-500/30">
                    {link.count}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Zone 3: Primary action cluster & options */}
        <div className="flex items-center gap-2 shrink-0">
          {/* Quick Light / Dark Theme Switch Icon Button */}
          <button
            onClick={toggleTheme}
            title={theme === 'dark' ? 'Switch to Light Theme' : 'Switch to Dark Theme'}
            className="p-2 rounded-lg border border-neutral-300 dark:border-neutral-700 bg-neutral-100 hover:bg-neutral-200 dark:bg-neutral-800/80 dark:hover:bg-neutral-700/80 text-neutral-700 dark:text-neutral-200 transition-colors"
            aria-label="Toggle Light/Dark Theme"
          >
            {theme === 'dark' ? (
              <Sun className="w-4 h-4 text-amber-400 hover:rotate-45 transition-transform" />
            ) : (
              <Moon className="w-4 h-4 text-indigo-600 hover:-rotate-12 transition-transform" />
            )}
          </button>

          {/* Viewport switch for testing §4.1 tablet/phone responsiveness */}
          <div className="hidden lg:flex items-center gap-0.5 p-1 bg-neutral-100 dark:bg-neutral-950 rounded-lg border border-neutral-300 dark:border-neutral-800 text-neutral-600 dark:text-neutral-400">
            <button
              onClick={() => setViewportMode('desktop')}
              title="Desktop 1440px"
              className={`p-1.5 rounded transition-colors ${
                viewportMode === 'desktop'
                  ? 'bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white shadow-xs'
                  : 'hover:text-neutral-900 dark:hover:text-neutral-200'
              }`}
            >
              <Monitor className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setViewportMode('tablet')}
              title="Android / iPad Tablet Mode (§4.1)"
              className={`p-1.5 rounded transition-colors ${
                viewportMode === 'tablet'
                  ? 'bg-white dark:bg-neutral-800 text-amber-600 dark:text-amber-400 shadow-xs'
                  : 'hover:text-neutral-900 dark:hover:text-neutral-200'
              }`}
            >
              <Tablet className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setViewportMode('mobile')}
              title="Smartphone Device (§4.1)"
              className={`p-1.5 rounded transition-colors ${
                viewportMode === 'mobile'
                  ? 'bg-white dark:bg-neutral-800 text-amber-600 dark:text-amber-400 shadow-xs'
                  : 'hover:text-neutral-900 dark:hover:text-neutral-200'
              }`}
            >
              <Smartphone className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Sound alert chime toggle */}
          <button
            onClick={toggleSound}
            title={soundEnabled ? 'KDS Audio Chime Enabled' : 'KDS Audio Muted'}
            className={`p-2 rounded-lg border transition-colors ${
              soundEnabled
                ? 'bg-neutral-100 hover:bg-neutral-200 dark:bg-neutral-800/80 dark:hover:bg-neutral-700/80 border-neutral-300 dark:border-neutral-700 text-neutral-700 dark:text-neutral-200'
                : 'bg-neutral-100 dark:bg-neutral-950 border-neutral-200 dark:border-neutral-800 text-neutral-400 dark:text-neutral-500'
            }`}
          >
            {soundEnabled ? (
              <Volume2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            ) : (
              <VolumeX className="w-4 h-4" />
            )}
          </button>

          {/* Options Dropdown List (including Light Theme switch options, Viewport options, and Audio options) */}
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setShowOptionsDropdown((prev) => !prev)}
              title="Display & System Options"
              className={`flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium rounded-lg border transition-colors ${
                showOptionsDropdown
                  ? 'bg-amber-500 text-neutral-950 border-amber-500'
                  : 'bg-neutral-100 hover:bg-neutral-200 dark:bg-neutral-800 dark:hover:bg-neutral-700 border-neutral-300 dark:border-neutral-700 text-neutral-700 dark:text-neutral-200'
              }`}
            >
              <SlidersHorizontal className="w-3.5 h-3.5" />
              <span className="hidden md:inline">Options</span>
            </button>

            {/* List of Options Dropdown Menu */}
            {showOptionsDropdown && (
              <div className="absolute right-0 mt-2 w-64 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl shadow-xl p-3 z-50 text-xs space-y-3.5 animate-in fade-in-50 zoom-in-95 duration-150">
                {/* 1. Theme Option Switch */}
                <div>
                  <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider block mb-1.5">
                    Theme Appearance
                  </span>
                  <div className="grid grid-cols-2 gap-1.5 p-1 bg-neutral-100 dark:bg-neutral-950 rounded-lg border border-neutral-200 dark:border-neutral-800">
                    <button
                      onClick={() => setTheme('light')}
                      className={`flex items-center justify-center gap-1.5 py-1.5 rounded-md font-medium transition-colors ${
                        theme === 'light'
                          ? 'bg-white text-neutral-900 shadow-xs font-semibold'
                          : 'text-neutral-500 hover:text-neutral-900 dark:hover:text-white'
                      }`}
                    >
                      <Sun className="w-3.5 h-3.5 text-amber-500" />
                      <span>Light</span>
                      {theme === 'light' && <Check className="w-3 h-3 text-amber-600 ml-0.5" />}
                    </button>
                    <button
                      onClick={() => setTheme('dark')}
                      className={`flex items-center justify-center gap-1.5 py-1.5 rounded-md font-medium transition-colors ${
                        theme === 'dark'
                          ? 'bg-neutral-800 text-white shadow-xs font-semibold'
                          : 'text-neutral-500 hover:text-neutral-900 dark:hover:text-white'
                      }`}
                    >
                      <Moon className="w-3.5 h-3.5 text-indigo-400" />
                      <span>Dark</span>
                      {theme === 'dark' && <Check className="w-3 h-3 text-amber-400 ml-0.5" />}
                    </button>
                  </div>
                </div>

                {/* 2. Device Viewport Options */}
                <div>
                  <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider block mb-1.5">
                    Device Viewport (§4.1)
                  </span>
                  <div className="flex flex-col gap-1">
                    {[
                      { mode: 'desktop' as const, label: 'Desktop Standard (1440px)', icon: Monitor },
                      { mode: 'tablet' as const, label: 'Android / iPad Tablet Mode', icon: Tablet },
                      { mode: 'mobile' as const, label: 'Smartphone Handheld Mode', icon: Smartphone },
                    ].map((opt) => (
                      <button
                        key={opt.mode}
                        onClick={() => {
                          setViewportMode(opt.mode);
                          setShowOptionsDropdown(false);
                        }}
                        className={`flex items-center justify-between px-2.5 py-1.5 rounded-lg text-left transition-colors ${
                          viewportMode === opt.mode
                            ? 'bg-amber-500/15 text-amber-700 dark:text-amber-400 font-semibold'
                            : 'hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-700 dark:text-neutral-300'
                        }`}
                      >
                        <span className="flex items-center gap-2">
                          <opt.icon className="w-3.5 h-3.5 text-neutral-500" />
                          <span>{opt.label}</span>
                        </span>
                        {viewportMode === opt.mode && <Check className="w-3.5 h-3.5" />}
                      </button>
                    ))}
                  </div>
                </div>

                {/* 3. Audio & Currency Options */}
                <div className="pt-2 border-t border-neutral-200 dark:border-neutral-800 flex items-center justify-between text-[11px] text-neutral-500">
                  <span>Currency: <strong className="text-neutral-800 dark:text-neutral-200 font-mono">TSH</strong></span>
                  <button
                    onClick={toggleSound}
                    className="text-amber-600 dark:text-amber-400 font-semibold hover:underline"
                  >
                    Audio: {soundEnabled ? 'Enabled' : 'Muted'}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
