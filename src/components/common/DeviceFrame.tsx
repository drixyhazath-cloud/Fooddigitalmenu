import React, { ReactNode } from 'react';
import { useApp } from '../../context/AppContext';
import { Tablet, Smartphone, Monitor } from 'lucide-react';

export const DeviceFrame: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { viewportMode, setViewportMode } = useApp();

  if (viewportMode === 'desktop') {
    return <div className="w-full flex-1 flex flex-col">{children}</div>;
  }

  return (
    <div className="flex-1 bg-neutral-200/80 dark:bg-neutral-950 flex flex-col items-center justify-start p-4 sm:p-8 overflow-y-auto transition-colors">
      {/* Device frame header indicator */}
      <div className="mb-3 flex items-center gap-2 text-xs text-neutral-600 dark:text-neutral-400 bg-white dark:bg-neutral-900 px-3 py-1.5 rounded-full border border-neutral-300 dark:border-neutral-800 shadow-xs">
        {viewportMode === 'tablet' ? (
          <>
            <Tablet className="w-3.5 h-3.5 text-amber-500" />
            <span>Simulating 10.5" Android Tablet Viewport (§4.1 Waiter & KDS Device)</span>
          </>
        ) : (
          <>
            <Smartphone className="w-3.5 h-3.5 text-amber-500" />
            <span>Simulating Smartphone Viewport (§4.1 Handheld Waiter Device)</span>
          </>
        )}
        <button
          onClick={() => setViewportMode('desktop')}
          className="ml-2 text-[10px] text-neutral-500 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-white underline"
        >
          Reset to Desktop
        </button>
      </div>

      {/* Frame boundary */}
      <div
        className={`w-full bg-neutral-800 dark:bg-neutral-900 border-4 border-neutral-400 dark:border-neutral-700 rounded-3xl overflow-hidden shadow-2xl flex flex-col transition-all duration-300 ${
          viewportMode === 'tablet'
            ? 'max-w-[880px] h-[780px]'
            : 'max-w-[420px] h-[780px]'
        }`}
      >
        {/* Device speaker & camera notch */}
        <div className="h-4 bg-neutral-800 dark:bg-neutral-900 flex items-center justify-center shrink-0">
          <div className="w-12 h-1 bg-neutral-600 dark:bg-neutral-700 rounded-full" />
        </div>

        {/* Viewport Content */}
        <div className="flex-1 overflow-y-auto bg-neutral-50 dark:bg-neutral-950 flex flex-col scrollbar-thin">
          {children}
        </div>

        {/* Bottom home bar indicator */}
        <div className="h-4 bg-neutral-800 dark:bg-neutral-900 flex items-center justify-center shrink-0">
          <div className="w-24 h-1 bg-neutral-600 dark:bg-neutral-700 rounded-full" />
        </div>
      </div>
    </div>
  );
};
