import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  Clock,
  CheckCircle2,
  AlertTriangle,
  Play,
  Flame,
  ChefHat,
  Volume2,
  VolumeX,
  Filter,
} from 'lucide-react';

export const KitchenDisplay: React.FC = () => {
  const {
    activeOrders,
    updateItemStatus,
    updateOrderStatus,
    soundEnabled,
    toggleSound,
  } = useApp();

  const [statusFilter, setStatusFilter] = useState<'all' | 'submitted' | 'preparing' | 'ready'>('all');

  const filteredOrders = activeOrders.filter((order) => {
    if (statusFilter === 'all') return true;
    return order.status === statusFilter;
  });

  return (
    <div className="flex-1 flex flex-col min-h-[calc(100vh-61px)] bg-neutral-100 dark:bg-neutral-950 text-neutral-900 dark:text-neutral-100 transition-colors">
      {/* KDS Header Bar */}
      <div className="p-4 sm:px-6 bg-white dark:bg-neutral-900 border-b border-neutral-200 dark:border-neutral-800 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-amber-500/15 text-amber-600 dark:text-amber-400 rounded-lg border border-amber-500/30">
            <ChefHat className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-neutral-900 dark:text-white flex items-center gap-2">
              Kitchen Display System (KDS)
              <span className="text-xs font-mono font-normal text-neutral-500 dark:text-neutral-400">· Live Expediter Board</span>
            </h2>
            <p className="text-xs text-neutral-500 dark:text-neutral-400">
              Real-time synchronization with Waiter devices. Auto-refreshes on incoming tickets & cancellations.
            </p>
          </div>
        </div>

        {/* Filters & Audio */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1 bg-neutral-100 dark:bg-neutral-950 p-1 rounded-lg border border-neutral-300 dark:border-neutral-800 text-xs">
            <span className="text-neutral-500 px-2 flex items-center gap-1">
              <Filter className="w-3 h-3" /> Status:
            </span>
            {(['all', 'submitted', 'preparing', 'ready'] as const).map((st) => (
              <button
                key={st}
                onClick={() => setStatusFilter(st)}
                className={`px-2.5 py-1 rounded capitalize font-medium transition-colors ${
                  statusFilter === st
                    ? 'bg-white dark:bg-neutral-800 text-amber-700 dark:text-amber-400 font-semibold shadow-xs'
                    : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-200'
                }`}
              >
                {st === 'all' ? 'All Orders' : st}
              </button>
            ))}
          </div>

          <button
            onClick={toggleSound}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
              soundEnabled
                ? 'bg-neutral-100 hover:bg-neutral-200 dark:bg-neutral-800 dark:hover:bg-neutral-700 text-neutral-800 dark:text-neutral-200 border-neutral-300 dark:border-neutral-700'
                : 'bg-neutral-100 dark:bg-neutral-950 text-neutral-400 dark:text-neutral-500 border-neutral-200 dark:border-neutral-800'
            }`}
          >
            {soundEnabled ? (
              <Volume2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
            ) : (
              <VolumeX className="w-3.5 h-3.5" />
            )}
            <span>Chime: {soundEnabled ? 'On' : 'Muted'}</span>
          </button>
        </div>
      </div>

      {/* Orders Grid */}
      <div className="flex-1 p-4 sm:p-6 overflow-y-auto">
        {filteredOrders.length === 0 ? (
          <div className="h-96 flex flex-col items-center justify-center text-center border border-dashed border-neutral-300 dark:border-neutral-800 rounded-2xl p-8">
            <ChefHat className="w-12 h-12 text-neutral-400 dark:text-neutral-700 mb-3" />
            <h3 className="text-base font-semibold text-neutral-700 dark:text-neutral-300">Kitchen Display is Clear</h3>
            <p className="text-xs text-neutral-500 max-w-sm mt-1">
              No orders matching the current filter. New tickets submitted from Waiter tablets will appear here
              instantly with real-time sound chiming.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
            {filteredOrders.map((order) => {
              const elapsedMins = Math.floor(
                (Date.now() - new Date(order.submittedAt).getTime()) / (60 * 1000)
              );
              const isUrgent = elapsedMins >= 15;

              return (
                <div
                  key={order.orderId}
                  className={`flex flex-col bg-white dark:bg-neutral-900 rounded-xl border shadow-sm transition-all ${
                    isUrgent
                      ? 'border-rose-400 dark:border-rose-700/60 ring-1 ring-rose-500/30'
                      : order.status === 'preparing'
                      ? 'border-amber-400 dark:border-amber-500/40 ring-1 ring-amber-500/20'
                      : 'border-neutral-200 dark:border-neutral-800'
                  }`}
                >
                  {/* Ticket Header */}
                  <div className="p-4 bg-neutral-50 dark:bg-neutral-900/90 border-b border-neutral-200 dark:border-neutral-800 flex items-center justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-base font-black text-amber-600 dark:text-amber-400">{order.tableNumber}</span>
                        <span className="text-xs text-neutral-500 dark:text-neutral-400 font-mono">({order.orderId})</span>
                      </div>
                      <div className="text-[11px] text-neutral-500 dark:text-neutral-400 mt-0.5">
                        Waiter: <span className="text-neutral-800 dark:text-neutral-200 font-medium">{order.waiterName}</span>
                      </div>
                    </div>

                    <div className="text-right">
                      <div className="flex items-center gap-1.5 text-xs font-mono">
                        <Clock className={`w-3.5 h-3.5 ${isUrgent ? 'text-rose-500 animate-pulse' : 'text-neutral-400'}`} />
                        <span className={isUrgent ? 'text-rose-600 dark:text-rose-300 font-bold' : 'text-neutral-600 dark:text-neutral-300'}>
                          {elapsedMins}m ago
                        </span>
                      </div>
                      <span className="text-[10px] text-neutral-400 dark:text-neutral-500 font-mono">
                        {new Date(order.submittedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                  </div>

                  {/* Customer-by-Customer breakdown (§3.2 & §3.3) */}
                  <div className="p-4 flex-1 space-y-4 overflow-y-auto">
                    {order.customers.map((cust) => (
                      <div
                        key={cust.customerId}
                        className="p-3 bg-neutral-50 dark:bg-neutral-950 rounded-lg border border-neutral-200 dark:border-neutral-800/80"
                      >
                        <div className="flex items-center justify-between border-b border-neutral-200 dark:border-neutral-800 pb-1.5 mb-2">
                          <span className="text-xs font-bold text-amber-700 dark:text-amber-300">
                            Customer: {cust.customerName}
                          </span>
                          <span className="text-[11px] font-mono text-neutral-500 dark:text-neutral-400 tabular-nums">
                            TSH {cust.individualTotal.toLocaleString()}
                          </span>
                        </div>

                        {/* Items */}
                        <div className="space-y-2">
                          {cust.items.map((item) => {
                            const isCancelled = item.status === 'cancelled';
                            return (
                              <div
                                key={item.id}
                                className={`flex items-start justify-between gap-2 text-xs p-1.5 rounded transition-colors ${
                                  isCancelled
                                    ? 'bg-rose-50 dark:bg-rose-950/20 text-neutral-400 dark:text-neutral-500 line-through'
                                    : item.status === 'ready'
                                    ? 'bg-emerald-50 dark:bg-emerald-950/30 text-emerald-800 dark:text-emerald-200'
                                    : item.status === 'preparing'
                                    ? 'bg-amber-50 dark:bg-amber-950/30 text-amber-800 dark:text-amber-200'
                                    : 'text-neutral-800 dark:text-neutral-200'
                                }`}
                              >
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-baseline gap-1.5">
                                    <span className="font-bold text-neutral-900 dark:text-neutral-100 font-mono">
                                      {item.quantity}×
                                    </span>
                                    <span className="font-medium text-neutral-900 dark:text-white">{item.name}</span>
                                  </div>
                                  {isCancelled && (
                                    <div className="text-[10px] text-rose-600 dark:text-rose-400 font-sans not-italic font-semibold mt-0.5">
                                      CANCELLED: {item.cancelReason || 'Waiter cancellation'}
                                    </div>
                                  )}
                                </div>

                                {/* Status actions per item */}
                                {!isCancelled && (
                                  <div className="flex items-center gap-1 shrink-0">
                                    {item.status === 'pending' && (
                                      <button
                                        onClick={() =>
                                          updateItemStatus(order.orderId, cust.customerId, item.id, 'preparing')
                                        }
                                        className="px-2 py-0.5 text-[10px] font-semibold bg-neutral-100 hover:bg-neutral-200 dark:bg-neutral-800 dark:hover:bg-amber-500/20 hover:text-amber-700 dark:hover:text-amber-300 text-neutral-700 dark:text-neutral-300 rounded border border-neutral-300 dark:border-neutral-700 transition-colors"
                                      >
                                        Prep
                                      </button>
                                    )}
                                    {item.status === 'preparing' && (
                                      <button
                                        onClick={() =>
                                          updateItemStatus(order.orderId, cust.customerId, item.id, 'ready')
                                        }
                                        className="px-2 py-0.5 text-[10px] font-semibold bg-amber-500/20 text-amber-700 dark:text-amber-300 hover:bg-emerald-500/20 hover:text-emerald-700 dark:hover:text-emerald-300 rounded border border-amber-500/40 transition-colors flex items-center gap-1"
                                      >
                                        <Flame className="w-2.5 h-2.5" /> Ready
                                      </button>
                                    )}
                                    {item.status === 'ready' && (
                                      <span className="text-[10px] font-semibold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                                        <CheckCircle2 className="w-3 h-3" /> Ready
                                      </span>
                                    )}
                                  </div>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Overall Table Total & Expediter Actions (§3.3) */}
                  <div className="p-4 bg-neutral-50 dark:bg-neutral-950 border-t border-neutral-200 dark:border-neutral-800 space-y-3">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-neutral-600 dark:text-neutral-400">Overall Table Total:</span>
                      <span className="text-sm font-bold text-amber-600 dark:text-amber-400 font-mono tabular-nums">
                        TSH {order.overallTableTotal.toLocaleString()}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      {order.status === 'submitted' && (
                        <button
                          onClick={() => updateOrderStatus(order.orderId, 'preparing')}
                          className="flex-1 py-2 px-3 rounded-lg text-xs font-bold uppercase tracking-wider bg-amber-500 hover:bg-amber-400 text-neutral-950 flex items-center justify-center gap-1.5 transition-colors shadow-xs"
                        >
                          <Play className="w-3.5 h-3.5 fill-current" />
                          <span>Start Preparation</span>
                        </button>
                      )}

                      {order.status === 'preparing' && (
                        <button
                          onClick={() => updateOrderStatus(order.orderId, 'ready')}
                          className="flex-1 py-2 px-3 rounded-lg text-xs font-bold uppercase tracking-wider bg-emerald-600 hover:bg-emerald-500 text-white flex items-center justify-center gap-1.5 transition-colors shadow-xs"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>Mark All Ready</span>
                        </button>
                      )}

                      {order.status === 'ready' && (
                        <button
                          onClick={() => updateOrderStatus(order.orderId, 'completed')}
                          className="flex-1 py-2 px-3 rounded-lg text-xs font-bold uppercase tracking-wider bg-neutral-100 hover:bg-neutral-200 dark:bg-neutral-800 dark:hover:bg-neutral-700 text-neutral-800 dark:text-neutral-200 flex items-center justify-center gap-1.5 transition-colors border border-neutral-300 dark:border-neutral-700"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                          <span>Dispatch / Served</span>
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
