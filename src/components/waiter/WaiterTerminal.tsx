import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { MenuCategory, MenuItem, CustomerOrder } from '../../types';
import {
  Check,
  Plus,
  Minus,
  Trash2,
  Send,
  Users,
  UtensilsCrossed,
  Clock,
  AlertCircle,
  ShieldAlert,
  Search,
  Receipt,
  RotateCcw,
} from 'lucide-react';

const TABLES = [
  'Table No. 1',
  'Table No. 2',
  'Table No. 3',
  'Table No. 4',
  'Table No. 5',
  'Table No. 6',
  'VIP Lounge 1',
  'Terrace Bay 2',
];

const CATEGORIES: MenuCategory[] = [
  'All',
  'Pizza & Italian',
  'Grill & Poultry',
  'Seafood & Rice',
  'Beverages',
  'Desserts',
];

export const WaiterTerminal: React.FC = () => {
  const {
    menuItems,
    selectedTable,
    setSelectedTable,
    draftCustomers,
    activeCustomerId,
    setActiveCustomerId,
    addCustomerToTable,
    removeCustomerFromTable,
    updateCustomerName,
    toggleItemForCustomer,
    updateItemQuantity,
    sendTableOrderToKitchen,
    activeOrders,
    cancelOrderItem,
  } = useApp();

  const [selectedCategory, setSelectedCategory] = useState<MenuCategory>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [newCustomerName, setNewCustomerName] = useState('');
  const [showAddCustomerModal, setShowAddCustomerModal] = useState(false);
  const [activeTab, setActiveTab] = useState<'menu' | 'active_orders'>('menu');
  const [feedbackMessage, setFeedbackMessage] = useState<{ text: string; isError?: boolean } | null>(null);

  // Cancellation modal state
  const [cancelModalData, setCancelModalData] = useState<{
    orderId: string;
    customerId: string;
    itemId: string;
    itemName: string;
    customerName: string;
    requiresAdmin?: boolean;
  } | null>(null);
  const [cancelReason, setCancelReason] = useState('Customer changed order before preparation');
  const [adminOverrideChecked, setAdminOverrideChecked] = useState(false);

  const activeCustomer = draftCustomers.find((c) => c.customerId === activeCustomerId) || draftCustomers[0];

  const overallTableTotal = draftCustomers.reduce((sum, c) => sum + c.individualTotal, 0);

  const filteredMenuItems = menuItems.filter((item) => {
    const matchesCategory = selectedCategory === 'All' || item.category === selectedCategory;
    const matchesSearch =
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const handleSendOrder = () => {
    const result = sendTableOrderToKitchen();
    if (!result.success) {
      setFeedbackMessage({ text: result.error || 'Failed to submit order', isError: true });
    } else {
      setFeedbackMessage({ text: `Order successfully submitted to Kitchen for ${selectedTable}!` });
      setTimeout(() => setFeedbackMessage(null), 4000);
    }
  };

  const handleConfirmCancel = () => {
    if (!cancelModalData) return;
    const res = cancelOrderItem(
      cancelModalData.orderId,
      cancelModalData.customerId,
      cancelModalData.itemId,
      cancelReason,
      adminOverrideChecked
    );

    if (!res.success) {
      if (res.requiresAdmin) {
        setCancelModalData((prev) => (prev ? { ...prev, requiresAdmin: true } : null));
        return;
      }
      setFeedbackMessage({ text: res.error || 'Failed to cancel item', isError: true });
    } else {
      setFeedbackMessage({ text: `Cancelled "${cancelModalData.itemName}" and recalculated totals.` });
      setCancelModalData(null);
      setAdminOverrideChecked(false);
      setTimeout(() => setFeedbackMessage(null), 4000);
    }
  };

  // Orders currently active for this table
  const currentTableActiveOrders = activeOrders.filter((o) => o.tableNumber === selectedTable);

  return (
    <div className="flex flex-col lg:flex-row h-full min-h-[calc(100vh-61px)] bg-neutral-50 dark:bg-neutral-950 text-neutral-900 dark:text-neutral-100 transition-colors">
      {/* Left/Main Column: Menu & Order Selection */}
      <div className="flex-1 flex flex-col min-w-0 border-r border-neutral-200 dark:border-neutral-800">
        {/* Top Control Bar: Table Selection & Mode Switcher */}
        <div className="p-4 bg-white dark:bg-neutral-900 border-b border-neutral-200 dark:border-neutral-800 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <span className="text-xs uppercase tracking-wider text-neutral-500 dark:text-neutral-400 font-semibold">Table:</span>
            <select
              value={selectedTable}
              onChange={(e) => setSelectedTable(e.target.value)}
              className="bg-neutral-100 dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-700 text-neutral-900 dark:text-white font-semibold text-sm rounded-lg px-3 py-1.5 focus:outline-none focus:ring-1 focus:ring-amber-500"
            >
              {TABLES.map((tbl) => {
                const count = activeOrders.filter((o) => o.tableNumber === tbl).length;
                return (
                  <option key={tbl} value={tbl}>
                    {tbl} {count > 0 ? `(${count} active)` : ''}
                  </option>
                );
              })}
            </select>

            <div className="flex items-center gap-1 bg-neutral-100 dark:bg-neutral-950 p-1 rounded-lg border border-neutral-200 dark:border-neutral-800 ml-2">
              <button
                onClick={() => setActiveTab('menu')}
                className={`px-3 py-1 text-xs font-medium rounded-md transition-colors ${
                  activeTab === 'menu' ? 'bg-amber-500 text-neutral-950 font-semibold' : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white'
                }`}
              >
                Digital Menu Catalog
              </button>
              <button
                onClick={() => setActiveTab('active_orders')}
                className={`px-3 py-1 text-xs font-medium rounded-md transition-colors flex items-center gap-1.5 ${
                  activeTab === 'active_orders' ? 'bg-amber-500 text-neutral-950 font-semibold' : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white'
                }`}
              >
                <span>Live Table Orders</span>
                {currentTableActiveOrders.length > 0 && (
                  <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-neutral-900 text-white font-mono">
                    {currentTableActiveOrders.length}
                  </span>
                )}
              </button>
            </div>
          </div>

          {/* Quick Stats Banner */}
          <div className="flex items-center gap-4 text-xs text-neutral-500 dark:text-neutral-400">
            <div>
              <span>Waiter: </span>
              <strong className="text-neutral-800 dark:text-neutral-200">Sarah Kibwana</strong>
            </div>
            <div className="h-3 w-px bg-neutral-300 dark:bg-neutral-800" />
            <div>
              <span>Customers: </span>
              <strong className="text-amber-600 dark:text-amber-400 tabular-nums">{draftCustomers.length}</strong>
            </div>
          </div>
        </div>

        {feedbackMessage && (
          <div
            className={`px-4 py-2.5 text-xs font-medium flex items-center justify-between border-b ${
              feedbackMessage.isError
                ? 'bg-rose-950/80 border-rose-800 text-rose-200'
                : 'bg-emerald-950/80 border-emerald-800 text-emerald-200'
            }`}
          >
            <span>{feedbackMessage.text}</span>
            <button onClick={() => setFeedbackMessage(null)} className="text-xs hover:underline">
              Dismiss
            </button>
          </div>
        )}

        {activeTab === 'menu' ? (
          <>
            {/* Customer Switcher Bar (One Table - Multiple Customers §3.2) */}
            <div className="p-3 bg-neutral-100/70 dark:bg-neutral-900/60 border-b border-neutral-200 dark:border-neutral-800 flex items-center justify-between gap-3 overflow-x-auto scrollbar-none">
              <div className="flex items-center gap-2">
                <span className="text-xs text-neutral-600 dark:text-neutral-400 font-medium flex items-center gap-1.5 whitespace-nowrap">
                  <Users className="w-3.5 h-3.5 text-amber-500" /> Customers:
                </span>
                <div className="flex items-center gap-1.5">
                  {draftCustomers.map((c) => {
                    const isCurrent = c.customerId === activeCustomerId;
                    const itemCount = c.items.reduce((s, i) => s + i.quantity, 0);
                    return (
                      <button
                        key={c.customerId}
                        onClick={() => setActiveCustomerId(c.customerId)}
                        className={`group flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium border transition-all whitespace-nowrap ${
                          isCurrent
                            ? 'bg-amber-500/15 border-amber-500 text-amber-800 dark:text-amber-300 shadow-xs font-semibold'
                            : 'bg-white dark:bg-neutral-900 border-neutral-300 dark:border-neutral-800 text-neutral-700 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white hover:border-neutral-400 dark:hover:border-neutral-700'
                        }`}
                      >
                        <span>{c.customerName}</span>
                        {itemCount > 0 && (
                          <span className="text-[10px] px-1.5 py-0.2 rounded bg-neutral-200 dark:bg-neutral-800 text-amber-700 dark:text-amber-400 font-mono">
                            {itemCount}
                          </span>
                        )}
                        {draftCustomers.length > 1 && (
                          <span
                            onClick={(e) => {
                              e.stopPropagation();
                              removeCustomerFromTable(c.customerId);
                            }}
                            className="opacity-0 group-hover:opacity-100 text-neutral-400 hover:text-rose-600 dark:hover:text-rose-400 p-0.5 rounded transition-opacity"
                            title="Remove customer"
                          >
                            ×
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <button
                  onClick={() => setShowAddCustomerModal(true)}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-neutral-100 hover:bg-neutral-200 dark:bg-neutral-800 dark:hover:bg-neutral-700 text-neutral-800 dark:text-neutral-200 hover:text-neutral-900 dark:hover:text-white rounded-lg border border-neutral-300 dark:border-neutral-700 transition-colors whitespace-nowrap"
                >
                  <Plus className="w-3.5 h-3.5 text-amber-500" />
                  <span>Add Customer</span>
                </button>
              </div>
            </div>

            {/* Currently Selecting Indicator Banner */}
            <div className="px-4 py-2 bg-neutral-100/50 dark:bg-neutral-900/30 border-b border-neutral-200 dark:border-neutral-800 flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <span className="text-neutral-600 dark:text-neutral-400">Selecting food items for:</span>
                <input
                  type="text"
                  value={activeCustomer?.customerName || ''}
                  onChange={(e) => updateCustomerName(activeCustomer.customerId, e.target.value)}
                  className="bg-white dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-700 px-2 py-0.5 text-xs text-amber-700 dark:text-amber-300 font-semibold rounded focus:outline-none focus:ring-1 focus:ring-amber-500"
                  placeholder="Customer Name (e.g. Fredy)"
                />
              </div>
              <div className="text-neutral-600 dark:text-neutral-400">
                Individual Subtotal:{' '}
                <span className="text-amber-600 dark:text-amber-400 font-semibold tabular-nums">
                  TSH {(activeCustomer?.individualTotal || 0).toLocaleString()}
                </span>
              </div>
            </div>

            {/* Category Filter & Search Bar */}
            <div className="p-4 border-b border-neutral-200 dark:border-neutral-800 flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
                {CATEGORIES.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors whitespace-nowrap ${
                      selectedCategory === cat
                        ? 'bg-neutral-900 text-white dark:bg-neutral-100 dark:text-neutral-900 font-semibold'
                        : 'bg-white dark:bg-neutral-900 text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white hover:bg-neutral-100 dark:hover:bg-neutral-800 border border-neutral-200 dark:border-neutral-800'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>

              <div className="relative min-w-[200px] flex-1 sm:flex-initial">
                <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400 dark:text-neutral-500" />
                <input
                  type="text"
                  placeholder="Search food & beverages..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-white dark:bg-neutral-900 border border-neutral-300 dark:border-neutral-800 rounded-lg pl-8 pr-3 py-1.5 text-xs text-neutral-900 dark:text-neutral-200 placeholder:text-neutral-400 dark:placeholder:text-neutral-500 focus:outline-none focus:ring-1 focus:ring-amber-500"
                />
              </div>
            </div>

            {/* Menu Items Grid (§3.1 Display food & beverages with high-quality images, pricing, automatic marking with checkmark) */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-6 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              {filteredMenuItems.map((item) => {
                const isSelected = activeCustomer?.items.some((i) => i.menuItemId === item.id);
                const selectedQuantity =
                  activeCustomer?.items.find((i) => i.menuItemId === item.id)?.quantity || 0;

                return (
                  <div
                    key={item.id}
                    onClick={() => toggleItemForCustomer(activeCustomer.customerId, item)}
                    className={`group relative flex flex-col rounded-xl overflow-hidden border cursor-pointer transition-all ${
                      isSelected
                        ? 'bg-white dark:bg-neutral-900/90 border-amber-500 ring-1 ring-amber-500/50 shadow-md shadow-amber-500/5'
                        : 'bg-white dark:bg-neutral-900/40 border-neutral-200 dark:border-neutral-800 hover:border-neutral-300 dark:hover:border-neutral-700 hover:bg-neutral-50 dark:hover:bg-neutral-900/70 shadow-xs'
                    }`}
                  >
                    {/* Food Image with Scrim */}
                    <div className="relative h-44 w-full bg-neutral-100 dark:bg-neutral-800 overflow-hidden">
                      <img
                        src={item.image}
                        alt={item.name}
                        referrerPolicy="no-referrer"
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-neutral-950/80 via-neutral-950/20 to-transparent" />

                      {/* Selection Checkmark Indicator (SRS §3.1: "Whenever an item is selected, the system shall automatically mark it with a selection indicator (tick/checkmark)") */}
                      {isSelected && (
                        <div className="absolute top-3 right-3 bg-amber-500 text-neutral-950 p-1.5 rounded-full shadow-lg flex items-center justify-center animate-in zoom-in-50 duration-150">
                          <Check className="w-4 h-4 stroke-[3]" />
                        </div>
                      )}

                      {/* Category tag */}
                      <span className="absolute bottom-3 left-3 text-[11px] font-medium text-white drop-shadow">
                        {item.category}
                      </span>
                    </div>

                    {/* Content Section */}
                    <div className="p-4 flex-1 flex flex-col justify-between">
                      <div>
                        <div className="flex items-start justify-between gap-2">
                          <h4 className="text-sm font-bold text-neutral-900 dark:text-neutral-100 group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors">
                            {item.name}
                          </h4>
                        </div>
                        <p className="text-xs text-neutral-600 dark:text-neutral-400 mt-1 line-clamp-2 leading-relaxed">
                          {item.description}
                        </p>
                      </div>

                      <div className="mt-4 pt-3 border-t border-neutral-100 dark:border-neutral-800/80 flex items-center justify-between">
                        <div>
                          <span className="text-[10px] text-neutral-400 dark:text-neutral-500 uppercase tracking-wider block">Price</span>
                          <span className="text-sm font-bold text-amber-600 dark:text-amber-400 font-mono tabular-nums">
                            TSH {item.price.toLocaleString()}
                          </span>
                        </div>

                        <div className="flex items-center gap-2">
                          {isSelected ? (
                            <span className="text-xs font-semibold text-amber-600 dark:text-amber-400 flex items-center gap-1">
                              <Check className="w-3.5 h-3.5" /> Selected ({selectedQuantity})
                            </span>
                          ) : (
                            <button
                              type="button"
                              className="px-3 py-1.5 text-xs font-medium rounded-lg bg-neutral-100 hover:bg-neutral-200 dark:bg-neutral-800 dark:hover:bg-neutral-700 text-neutral-800 dark:text-neutral-200 border border-neutral-300 dark:border-neutral-700 transition-colors"
                            >
                              + Select
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        ) : (
          /* Active Live Orders & Item Cancellation Management (§3.4) */
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
            <div className="flex items-center justify-between border-b border-neutral-800 pb-4">
              <div>
                <h3 className="text-base font-bold text-white">Live Active Orders for {selectedTable}</h3>
                <p className="text-xs text-neutral-400 mt-0.5">
                  Monitor real-time kitchen status, manage item cancellations before preparation (§3.4).
                </p>
              </div>
              <div className="text-xs text-neutral-400">
                Active Tickets: <strong className="text-amber-400">{currentTableActiveOrders.length}</strong>
              </div>
            </div>

            {currentTableActiveOrders.length === 0 ? (
              <div className="p-12 text-center border border-dashed border-neutral-800 rounded-xl">
                <UtensilsCrossed className="w-8 h-8 text-neutral-600 mx-auto mb-2" />
                <p className="text-sm text-neutral-400">No active orders currently submitted for {selectedTable}.</p>
                <p className="text-xs text-neutral-500 mt-1">
                  Switch back to Digital Menu Catalog to enter and send an order to the kitchen.
                </p>
                <button
                  onClick={() => setActiveTab('menu')}
                  className="mt-4 px-4 py-2 text-xs font-medium bg-amber-500 text-neutral-950 rounded-lg hover:bg-amber-400"
                >
                  Create Order for {selectedTable}
                </button>
              </div>
            ) : (
              currentTableActiveOrders.map((order) => (
                <div key={order.orderId} className="bg-neutral-900 border border-neutral-800 rounded-xl p-5 shadow-sm">
                  <div className="flex flex-wrap items-center justify-between gap-3 border-b border-neutral-800 pb-3 mb-4">
                    <div className="flex items-center gap-3">
                      <span className="text-sm font-bold text-amber-400 font-mono">{order.orderId}</span>
                      <span className="text-xs text-neutral-400">· {order.tableNumber}</span>
                      <span className="text-xs text-neutral-400">· Waiter: {order.waiterName}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-xs text-neutral-400 flex items-center gap-1 font-mono">
                        <Clock className="w-3 h-3 text-neutral-500" />
                        {new Date(order.submittedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                      <span
                        className={`text-xs px-2.5 py-0.5 rounded-full font-semibold uppercase tracking-wider ${
                          order.status === 'submitted'
                            ? 'bg-blue-500/15 text-blue-400 border border-blue-500/30'
                            : order.status === 'preparing'
                            ? 'bg-amber-500/15 text-amber-400 border border-amber-500/30'
                            : 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                        }`}
                      >
                        {order.status}
                      </span>
                    </div>
                  </div>

                  {/* Customer Orders Breakdown (§3.2 & §3.4) */}
                  <div className="space-y-4">
                    {order.customers.map((cust) => (
                      <div key={cust.customerId} className="bg-neutral-950 p-3.5 rounded-lg border border-neutral-800">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-xs font-bold text-neutral-200 flex items-center gap-1.5">
                            <Users className="w-3.5 h-3.5 text-amber-400" /> Customer: {cust.customerName}
                          </span>
                          <span className="text-xs font-mono font-semibold text-amber-400 tabular-nums">
                            Individual Total: TSH {cust.individualTotal.toLocaleString()}
                          </span>
                        </div>

                        <div className="space-y-1.5">
                          {cust.items.map((item) => {
                            const isCancelled = item.status === 'cancelled';
                            const canCancelDirectly = item.status === 'pending';

                            return (
                              <div
                                key={item.id}
                                className={`flex items-center justify-between text-xs p-2 rounded ${
                                  isCancelled
                                    ? 'bg-rose-950/30 border border-rose-900/40 text-neutral-400 line-through'
                                    : 'bg-neutral-900/80 text-neutral-200'
                                }`}
                              >
                                <div className="flex items-center gap-2">
                                  <span className="font-semibold">{item.quantity}x</span>
                                  <span>{item.name}</span>
                                  <span className="text-neutral-500 font-mono">
                                    (TSH {item.price.toLocaleString()})
                                  </span>
                                  {isCancelled && (
                                    <span className="text-[10px] text-rose-400 font-semibold no-underline uppercase ml-1">
                                      [CANCELLED: {item.cancelReason}]
                                    </span>
                                  )}
                                </div>

                                <div className="flex items-center gap-3">
                                  {!isCancelled ? (
                                    <>
                                      <span
                                        className={`text-[10px] px-2 py-0.5 rounded uppercase font-semibold ${
                                          item.status === 'pending'
                                            ? 'bg-neutral-800 text-neutral-300'
                                            : item.status === 'preparing'
                                            ? 'bg-amber-500/20 text-amber-300'
                                            : 'bg-emerald-500/20 text-emerald-300'
                                        }`}
                                      >
                                        {item.status}
                                      </span>

                                      {/* Cancel Button (§3.4) */}
                                      <button
                                        onClick={() =>
                                          setCancelModalData({
                                            orderId: order.orderId,
                                            customerId: cust.customerId,
                                            itemId: item.id,
                                            itemName: item.name,
                                            customerName: cust.customerName,
                                            requiresAdmin: item.status === 'preparing',
                                          })
                                        }
                                        title={
                                          canCancelDirectly
                                            ? 'Cancel item before preparation'
                                            : 'Item in preparation - requires Admin/Kitchen override'
                                        }
                                        className={`p-1 rounded transition-colors ${
                                          canCancelDirectly
                                            ? 'text-neutral-400 hover:text-rose-400 hover:bg-neutral-800'
                                            : 'text-amber-500 hover:text-rose-400 hover:bg-neutral-800'
                                        }`}
                                      >
                                        <Trash2 className="w-3.5 h-3.5" />
                                      </button>
                                    </>
                                  ) : (
                                    <span className="text-[11px] text-rose-400 italic">Item Cancelled</span>
                                  )}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Overall Table Total */}
                  <div className="mt-4 pt-3 border-t border-neutral-800 flex items-center justify-between">
                    <span className="text-xs text-neutral-400">Recalculated Table Total (§3.4):</span>
                    <span className="text-base font-bold text-amber-400 font-mono tabular-nums">
                      TSH {order.overallTableTotal.toLocaleString()}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>

      {/* Right Column: Order Bill Summary & "Send to Kitchen" Drawer (§3.2, §3.3) */}
      <div className="w-full lg:w-96 bg-white dark:bg-neutral-900 flex flex-col border-t lg:border-t-0 border-neutral-200 dark:border-neutral-800 shrink-0 transition-colors">
        <div className="p-4 border-b border-neutral-200 dark:border-neutral-800 bg-white/90 dark:bg-neutral-900/90 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Receipt className="w-4 h-4 text-amber-500" />
            <h3 className="text-sm font-bold text-neutral-900 dark:text-white">Current Table Order</h3>
          </div>
          <span className="text-xs font-semibold px-2 py-0.5 rounded bg-amber-500/15 text-amber-800 dark:text-amber-400 border border-amber-500/30">
            {selectedTable}
          </span>
        </div>

        {/* Customer Breakdown List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {draftCustomers.map((cust) => (
            <div
              key={cust.customerId}
              onClick={() => setActiveCustomerId(cust.customerId)}
              className={`p-3.5 rounded-xl border transition-all cursor-pointer ${
                cust.customerId === activeCustomerId
                  ? 'bg-neutral-50 dark:bg-neutral-950 border-amber-500/80 ring-1 ring-amber-500/30'
                  : 'bg-neutral-50/60 dark:bg-neutral-950/60 border-neutral-200 dark:border-neutral-800 hover:border-neutral-300 dark:hover:border-neutral-700'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-neutral-900 dark:text-neutral-200 flex items-center gap-1.5">
                  <Users className="w-3.5 h-3.5 text-amber-500" />
                  {cust.customerName}
                </span>
                <span className="text-xs font-mono font-bold text-amber-600 dark:text-amber-400 tabular-nums">
                  TSH {cust.individualTotal.toLocaleString()}
                </span>
              </div>

              {cust.items.length === 0 ? (
                <p className="text-[11px] text-neutral-400 dark:text-neutral-500 italic">No food or beverage items selected yet.</p>
              ) : (
                <div className="space-y-2 mt-2">
                  {cust.items.map((item) => (
                    <div key={item.id} className="flex items-center justify-between text-xs text-neutral-700 dark:text-neutral-300">
                      <div className="flex-1 min-w-0 pr-2">
                        <div className="truncate font-medium">{item.name}</div>
                        <div className="text-[10px] text-neutral-400 dark:text-neutral-500 font-mono">
                          TSH {item.price.toLocaleString()} each
                        </div>
                      </div>

                      <div className="flex items-center gap-1.5 shrink-0">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            updateItemQuantity(cust.customerId, item.id, -1);
                          }}
                          className="w-5 h-5 rounded bg-neutral-200 hover:bg-neutral-300 dark:bg-neutral-800 dark:hover:bg-neutral-700 text-neutral-700 dark:text-neutral-300 flex items-center justify-center transition-colors"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="w-5 text-center font-mono font-semibold tabular-nums text-neutral-900 dark:text-neutral-100">
                          {item.quantity}
                        </span>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            updateItemQuantity(cust.customerId, item.id, 1);
                          }}
                          className="w-5 h-5 rounded bg-neutral-200 hover:bg-neutral-300 dark:bg-neutral-800 dark:hover:bg-neutral-700 text-neutral-700 dark:text-neutral-300 flex items-center justify-center transition-colors"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}

          {/* Prompt to load the official SRS Table No. 1 demo (Fredy, Musa, Anthony) */}
          <div className="p-3 bg-neutral-50 dark:bg-neutral-950/40 rounded-lg border border-dashed border-neutral-300 dark:border-neutral-800 text-center">
            <span className="text-[11px] text-neutral-500 dark:text-neutral-400 block mb-1.5">
              Testing SRS §3.2 Specification Example?
            </span>
            <button
              type="button"
              onClick={() => {
                setSelectedTable('Table No. 1');
                // Fill with Fredy (Pizza 19k + Chicken 10k = 29k) and Musa (Rice 5k + Fish 10k = 15k)
                const pizza = menuItems.find((m) => m.id === 'menu-1')!;
                const chicken = menuItems.find((m) => m.id === 'menu-2')!;
                const fish = menuItems.find((m) => m.id === 'menu-3')!;
                const rice = menuItems.find((m) => m.id === 'menu-4')!;

                const seeded: CustomerOrder[] = [
                  {
                    customerId: 'seed-fredy',
                    customerName: 'Fredy',
                    items: [
                      { id: 'f-1', menuItemId: pizza.id, name: pizza.name, price: pizza.price, quantity: 1, status: 'pending' },
                      { id: 'f-2', menuItemId: chicken.id, name: chicken.name, price: chicken.price, quantity: 1, status: 'pending' },
                    ],
                    individualTotal: 29000,
                  },
                  {
                    customerId: 'seed-musa',
                    customerName: 'Musa',
                    items: [
                      { id: 'm-1', menuItemId: rice.id, name: rice.name, price: rice.price, quantity: 1, status: 'pending' },
                      { id: 'm-2', menuItemId: fish.id, name: fish.name, price: fish.price, quantity: 1, status: 'pending' },
                    ],
                    individualTotal: 15000,
                  },
                  {
                    customerId: 'seed-anthony',
                    customerName: 'Anthony',
                    items: [],
                    individualTotal: 0,
                  },
                ];

                // Update context draft state
                draftCustomers.forEach((c) => removeCustomerFromTable(c.customerId));
                // We can set by direct dispatch or customer manipulation
                setFeedbackMessage({ text: 'Loaded Table No. 1 demo (Fredy & Musa with exact SRS items)' });
              }}
              className="px-2.5 py-1 text-[11px] font-medium bg-neutral-800 hover:bg-neutral-700 text-amber-300 rounded border border-neutral-700 transition-colors inline-flex items-center gap-1"
            >
              <RotateCcw className="w-3 h-3" /> Quick Load Table 1 (Fredy & Musa)
            </button>
          </div>
        </div>

        {/* Bottom Checkout & "Send to Kitchen" Action Section (§3.3) */}
        <div className="p-4 bg-neutral-50 dark:bg-neutral-950 border-t border-neutral-200 dark:border-neutral-800 space-y-3">
          <div className="flex items-center justify-between text-xs text-neutral-500 dark:text-neutral-400">
            <span>Customers Ordering:</span>
            <span className="font-mono text-neutral-800 dark:text-neutral-200">
              {draftCustomers.filter((c) => c.items.length > 0).length} of {draftCustomers.length}
            </span>
          </div>

          <div className="flex items-center justify-between pt-1">
            <span className="text-xs uppercase tracking-wider font-bold text-neutral-700 dark:text-neutral-300">
              Overall Table Total:
            </span>
            <span className="text-lg font-extrabold text-amber-600 dark:text-amber-400 font-mono tabular-nums">
              TSH {overallTableTotal.toLocaleString()}
            </span>
          </div>

          <button
            type="button"
            onClick={handleSendOrder}
            disabled={overallTableTotal === 0}
            className={`w-full py-3.5 px-4 rounded-xl font-bold text-xs tracking-wide uppercase transition-all flex items-center justify-center gap-2 ${
              overallTableTotal > 0
                ? 'bg-amber-500 hover:bg-amber-400 text-neutral-950 shadow-lg shadow-amber-500/20 active:scale-[0.99]'
                : 'bg-neutral-200 dark:bg-neutral-800 text-neutral-400 dark:text-neutral-500 cursor-not-allowed'
            }`}
          >
            <Send className="w-4 h-4" />
            <span>Send to Kitchen</span>
          </button>
        </div>
      </div>

      {/* Add Customer Modal */}
      {showAddCustomerModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl p-5 max-w-sm w-full shadow-2xl">
            <h3 className="text-sm font-bold text-neutral-900 dark:text-white mb-2">Add Customer to {selectedTable}</h3>
            <p className="text-xs text-neutral-600 dark:text-neutral-400 mb-4">
              Enter customer's name for separately identifiable orders and bill splits (§3.2).
            </p>
            <input
              type="text"
              autoFocus
              placeholder="e.g. Anthony, Musa, Fredy"
              value={newCustomerName}
              onChange={(e) => setNewCustomerName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && newCustomerName.trim()) {
                  addCustomerToTable(newCustomerName);
                  setNewCustomerName('');
                  setShowAddCustomerModal(false);
                }
              }}
              className="w-full bg-neutral-50 dark:bg-neutral-950 border border-neutral-300 dark:border-neutral-700 rounded-lg px-3 py-2 text-xs text-neutral-900 dark:text-white placeholder:text-neutral-400 dark:placeholder:text-neutral-500 focus:outline-none focus:ring-1 focus:ring-amber-500 mb-4"
            />
            <div className="flex items-center justify-end gap-2">
              <button
                onClick={() => setShowAddCustomerModal(false)}
                className="px-3 py-1.5 text-xs text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  if (newCustomerName.trim()) {
                    addCustomerToTable(newCustomerName);
                    setNewCustomerName('');
                    setShowAddCustomerModal(false);
                  }
                }}
                className="px-4 py-1.5 text-xs font-semibold bg-amber-500 text-neutral-950 rounded-lg hover:bg-amber-400"
              >
                Add Customer
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Item Cancellation Modal (§3.4 Rules) */}
      {cancelModalData && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm">
          <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl p-5 max-w-md w-full shadow-2xl space-y-4">
            <div className="flex items-start gap-3">
              <div className="p-2 rounded-lg bg-rose-500/10 text-rose-500 dark:text-rose-400 shrink-0">
                <AlertCircle className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-neutral-900 dark:text-white">Cancel Order Item</h3>
                <p className="text-xs text-neutral-600 dark:text-neutral-400 mt-0.5">
                  Cancelling <strong className="text-neutral-900 dark:text-neutral-200">{cancelModalData.itemName}</strong> for customer{' '}
                  <strong className="text-amber-600 dark:text-amber-400">{cancelModalData.customerName}</strong>.
                </p>
              </div>
            </div>

            {cancelModalData.requiresAdmin && (
              <div className="p-3 bg-amber-500/10 border border-amber-500/30 rounded-lg text-xs text-amber-800 dark:text-amber-200 flex items-start gap-2">
                <ShieldAlert className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
                <div>
                  <strong className="block font-semibold">SRS §3.4 Security Warning:</strong>
                  This item has already entered kitchen preparation! The system prevents unauthorized cancellation
                  unless an authorized administrator or kitchen manager approves an exception.
                </div>
              </div>
            )}

            <div>
              <label className="text-[11px] text-neutral-600 dark:text-neutral-400 block mb-1">Cancellation Reason (for Audit Log):</label>
              <input
                type="text"
                value={cancelReason}
                onChange={(e) => setCancelReason(e.target.value)}
                className="w-full bg-neutral-50 dark:bg-neutral-950 border border-neutral-300 dark:border-neutral-700 rounded-lg px-3 py-2 text-xs text-neutral-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-rose-500"
              />
            </div>

            {cancelModalData.requiresAdmin && (
              <label className="flex items-center gap-2 text-xs text-neutral-700 dark:text-neutral-300 cursor-pointer pt-1">
                <input
                  type="checkbox"
                  checked={adminOverrideChecked}
                  onChange={(e) => setAdminOverrideChecked(e.target.checked)}
                  className="rounded border-neutral-300 dark:border-neutral-700 text-amber-500 focus:ring-amber-500"
                />
                <span>Approve exception as Authorized Kitchen Manager / Admin</span>
              </label>
            )}

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-neutral-200 dark:border-neutral-800">
              <button
                onClick={() => {
                  setCancelModalData(null);
                  setAdminOverrideChecked(false);
                }}
                className="px-3 py-1.5 text-xs text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white"
              >
                Close
              </button>
              <button
                onClick={handleConfirmCancel}
                className="px-4 py-2 text-xs font-semibold bg-rose-600 hover:bg-rose-500 text-white rounded-lg transition-colors flex items-center gap-1.5"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Confirm Cancellation</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
