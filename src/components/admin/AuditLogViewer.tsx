import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Search, Lock } from 'lucide-react';

export const AuditLogViewer: React.FC = () => {
  const { auditLogs } = useApp();
  const [search, setSearch] = useState('');

  const filteredLogs = auditLogs.filter(
    (log) =>
      log.target.toLowerCase().includes(search.toLowerCase()) ||
      log.reason.toLowerCase().includes(search.toLowerCase()) ||
      log.action.toLowerCase().includes(search.toLowerCase()) ||
      log.adminName.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="bg-white dark:bg-neutral-900 rounded-xl border border-neutral-200 dark:border-neutral-800 p-5 space-y-4 shadow-xs transition-colors">
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-neutral-200 dark:border-neutral-800 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-bold text-neutral-900 dark:text-white">Immutable Administrative Audit Log</h3>
            <span className="text-[10px] px-2 py-0.5 rounded bg-purple-500/15 text-purple-700 dark:text-purple-300 border border-purple-500/30 font-mono font-medium flex items-center gap-1">
              <Lock className="w-3 h-3" /> FDM §2.4 Audit Standard
            </span>
          </div>
          <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5">
            Cryptographically chronological records of all administrative menu, price, and ticket overrides.
          </p>
        </div>

        <div className="relative w-64">
          <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400 dark:text-neutral-500" />
          <input
            type="text"
            placeholder="Search audit trail..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-neutral-50 dark:bg-neutral-950 border border-neutral-300 dark:border-neutral-700 rounded-lg pl-8 pr-3 py-1.5 text-xs text-neutral-900 dark:text-neutral-200 placeholder:text-neutral-400 dark:placeholder:text-neutral-500 focus:outline-none focus:ring-1 focus:ring-purple-500"
          />
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead className="bg-neutral-100/70 dark:bg-neutral-950 text-neutral-600 dark:text-neutral-400 uppercase tracking-wider font-semibold border-b border-neutral-200 dark:border-neutral-800">
            <tr>
              <th className="px-4 py-3">Timestamp</th>
              <th className="px-4 py-3">Action Type</th>
              <th className="px-4 py-3">Target / Entity</th>
              <th className="px-4 py-3">Previous Value</th>
              <th className="px-4 py-3">New Value</th>
              <th className="px-4 py-3">Authorized Operator</th>
              <th className="px-4 py-3">Mandatory Reason</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-200 dark:divide-neutral-800 text-neutral-800 dark:text-neutral-300 font-sans">
            {filteredLogs.map((log) => (
              <tr key={log.id} className="hover:bg-neutral-50 dark:hover:bg-neutral-800/40">
                <td className="px-4 py-3 font-mono text-[11px] text-neutral-500 dark:text-neutral-400 whitespace-nowrap">
                  {new Date(log.timestamp).toLocaleString()}
                </td>
                <td className="px-4 py-3">
                  <span className="font-mono text-[10px] font-semibold px-2 py-0.5 rounded bg-neutral-100 dark:bg-neutral-800 text-amber-700 dark:text-amber-400 border border-neutral-300 dark:border-neutral-700">
                    {log.action}
                  </span>
                </td>
                <td className="px-4 py-3 font-semibold text-neutral-900 dark:text-white">{log.target}</td>
                <td className="px-4 py-3 font-mono text-neutral-600 dark:text-neutral-400 tabular-nums">
                  {log.previousValue || '—'}
                </td>
                <td className="px-4 py-3 font-mono text-emerald-600 dark:text-emerald-400 font-semibold tabular-nums">
                  {log.newValue || '—'}
                </td>
                <td className="px-4 py-3 text-neutral-800 dark:text-neutral-200">{log.adminName}</td>
                <td className="px-4 py-3 text-neutral-600 dark:text-neutral-300 italic max-w-xs">{log.reason}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
