import React, { useState } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Navbar } from './components/Navbar';
import { WaiterTerminal } from './components/waiter/WaiterTerminal';
import { KitchenDisplay } from './components/kitchen/KitchenDisplay';
import { AdminDashboard } from './components/admin/AdminDashboard';
import { MenuManager } from './components/admin/MenuManager';
import { AuditLogViewer } from './components/admin/AuditLogViewer';
import { RemoteProjectManager } from './components/projects/RemoteProjectManager';
import { NotificationToast } from './components/common/NotificationToast';
import { DeviceFrame } from './components/common/DeviceFrame';
import { BarChart3, Utensils, Shield, Sparkles } from 'lucide-react';

const MainContent: React.FC = () => {
  const { role } = useApp();
  const [adminSubTab, setAdminSubTab] = useState<'financials' | 'menu' | 'audits'>('financials');

  return (
    <div className="flex-1 flex flex-col min-h-screen bg-neutral-50 dark:bg-neutral-950 text-neutral-900 dark:text-neutral-100 transition-colors duration-200">
      <Navbar />

      <DeviceFrame>
        {role === 'waiter' && <WaiterTerminal />}

        {role === 'kitchen' && <KitchenDisplay />}

        {role === 'admin' && (
          <div className="flex-1 flex flex-col">
            {/* Admin Subnav */}
            <div className="bg-white dark:bg-neutral-900/80 border-b border-neutral-200 dark:border-neutral-800 px-4 sm:px-6 py-2.5 flex items-center justify-between gap-4">
              <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none">
                <button
                  onClick={() => setAdminSubTab('financials')}
                  className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap ${
                    adminSubTab === 'financials'
                      ? 'bg-amber-500 text-neutral-950'
                      : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white hover:bg-neutral-100 dark:hover:bg-neutral-800'
                  }`}
                >
                  <BarChart3 className="w-3.5 h-3.5" />
                  <span>Financial Reports (§3.5)</span>
                </button>

                <button
                  onClick={() => setAdminSubTab('menu')}
                  className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap ${
                    adminSubTab === 'menu'
                      ? 'bg-amber-500 text-neutral-950'
                      : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white hover:bg-neutral-100 dark:hover:bg-neutral-800'
                  }`}
                >
                  <Utensils className="w-3.5 h-3.5" />
                  <span>Menu & Pricing (§2.3)</span>
                </button>

                <button
                  onClick={() => setAdminSubTab('audits')}
                  className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap ${
                    adminSubTab === 'audits'
                      ? 'bg-amber-500 text-neutral-950'
                      : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white hover:bg-neutral-100 dark:hover:bg-neutral-800'
                  }`}
                >
                  <Shield className="w-3.5 h-3.5" />
                  <span>Audit Trail (§2.4)</span>
                </button>
              </div>

              <div className="hidden sm:flex items-center gap-2 text-xs text-neutral-500 dark:text-neutral-400 font-mono">
                <span>Access:</span>
                <span className="text-amber-600 dark:text-amber-400 font-semibold">Chief Administrator / Owner</span>
              </div>
            </div>

            {/* Admin Subview */}
            <div className="flex-1 flex flex-col">
              {adminSubTab === 'financials' && <AdminDashboard />}
              {adminSubTab === 'menu' && <MenuManager />}
              {adminSubTab === 'audits' && (
                <div className="p-4 sm:p-6 lg:p-8">
                  <AuditLogViewer />
                </div>
              )}
            </div>
          </div>
        )}

        {role === 'projects' && <RemoteProjectManager />}
      </DeviceFrame>

      <NotificationToast />
    </div>
  );
};

export default function App() {
  return (
    <AppProvider>
      <MainContent />
    </AppProvider>
  );
}
