import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  TrendingUp,
  Receipt,
  Users,
  DollarSign,
  Calendar,
  Filter,
  Download,
  AlertTriangle,
  Layers,
  ChefHat,
  Search,
  ShieldCheck,
} from 'lucide-react';

export const AdminDashboard: React.FC = () => {
  const { completedOrders, activeOrders, auditLogs, menuItems } = useApp();

  const [dateRange, setDateRange] = useState<'today' | '7days' | '30days' | 'all'>('today');
  const [activeReportTab, setActiveReportTab] = useState<'overview' | 'tables' | 'waiters' | 'customers' | 'items' | 'cancellations'>('overview');
  const [searchFilter, setSearchFilter] = useState('');

  // Combined orders for comprehensive historical records (§3.5)
  const allOrdersList = [
    ...completedOrders.map((o) => ({
      ...o,
      type: 'completed' as const,
    })),
    ...activeOrders.map((o) => ({
      orderId: o.orderId,
      tableNumber: o.tableNumber,
      waiterName: o.waiterName,
      timestamp: o.submittedAt,
      customers: o.customers.map((c) => ({
        name: c.customerName,
        total: c.individualTotal,
        items: c.items.map((i) => ({ name: i.name, quantity: i.quantity, price: i.price, status: i.status })),
      })),
      totalAmount: o.overallTableTotal,
      status: o.status,
      type: 'active' as const,
    })),
  ];

  // Aggregated Financial Metrics (§3.5)
  const totalSalesRevenue = allOrdersList.reduce((sum, o) => sum + o.totalAmount, 0);
  const totalCompletedCount = completedOrders.length;
  const totalActiveCount = activeOrders.length;
  const avgOrderValue = allOrdersList.length > 0 ? Math.round(totalSalesRevenue / allOrdersList.length) : 0;

  // 1. Sales by Table (§3.5)
  const salesByTableMap = allOrdersList.reduce((acc, order) => {
    acc[order.tableNumber] = (acc[order.tableNumber] || 0) + order.totalAmount;
    return acc;
  }, {} as Record<string, number>);

  // 2. Sales by Waiter (§3.5)
  const salesByWaiterMap = allOrdersList.reduce((acc, order) => {
    acc[order.waiterName] = (acc[order.waiterName] || 0) + order.totalAmount;
    return acc;
  }, {} as Record<string, number>);

  // 3. Sales by Individual Customer (§3.5)
  const salesByCustomerMap = allOrdersList.reduce((acc, order) => {
    order.customers.forEach((c) => {
      acc[c.name] = (acc[c.name] || 0) + c.total;
    });
    return acc;
  }, {} as Record<string, number>);

  // 4. Sales breakdown by Food and Beverage Items (§3.5)
  const itemsSalesMap = allOrdersList.reduce((acc, order) => {
    order.customers.forEach((c) => {
      c.items.forEach((item) => {
        if (!acc[item.name]) {
          acc[item.name] = { quantity: 0, revenue: 0 };
        }
        acc[item.name].quantity += item.quantity;
        acc[item.name].revenue += item.price * item.quantity;
      });
    });
    return acc;
  }, {} as Record<string, { quantity: number; revenue: number }>);

  // 5. Cancelled orders and items (§3.5)
  const cancelledItemsList = activeOrders.flatMap((order) =>
    order.customers.flatMap((cust) =>
      cust.items
        .filter((i) => i.status === 'cancelled')
        .map((item) => ({
          orderId: order.orderId,
          tableNumber: order.tableNumber,
          customerName: cust.customerName,
          itemName: item.name,
          price: item.price,
          quantity: item.quantity,
          cancelledAt: item.cancelledAt || order.submittedAt,
          cancelReason: item.cancelReason || 'Cancelled by customer',
          cancelledBy: item.cancelledBy || 'Staff',
        }))
    )
  );

  const exportCSV = () => {
    const csvContent =
      'data:text/csv;charset=utf-8,' +
      ['Order ID,Table,Waiter,Date,Total (TSH),Status']
        .concat(
          allOrdersList.map(
            (o) =>
              `${o.orderId},${o.tableNumber},${o.waiterName},${new Date(o.timestamp).toLocaleString()},${o.totalAmount},${o.status}`
          )
        )
        .join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `FDM_Sales_Report_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="flex-1 flex flex-col min-h-[calc(100vh-61px)] bg-neutral-50 dark:bg-neutral-950 text-neutral-900 dark:text-neutral-100 p-4 sm:p-6 lg:p-8 space-y-6 transition-colors">
      {/* Executive Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-neutral-200 dark:border-neutral-800 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold text-neutral-900 dark:text-white">Administrator & Financial Reporting</h2>
            <span className="text-xs px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/20 font-medium flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5" /> Immutable Security (§2.4)
            </span>
          </div>
          <p className="text-xs text-neutral-600 dark:text-neutral-400 mt-1">
            Complete sales history, revenue breakdowns across tables, waiters, and customers in Tanzanian Shillings (TSH).
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* Date range filter (§3.5) */}
          <div className="flex items-center gap-1 bg-white dark:bg-neutral-900 p-1 rounded-lg border border-neutral-300 dark:border-neutral-800 text-xs shadow-xs">
            <Calendar className="w-3.5 h-3.5 text-neutral-400 dark:text-neutral-500 ml-1.5" />
            {(['today', '7days', '30days', 'all'] as const).map((rng) => (
              <button
                key={rng}
                onClick={() => setDateRange(rng)}
                className={`px-2.5 py-1 rounded capitalize font-medium transition-colors ${
                  dateRange === rng
                    ? 'bg-neutral-100 dark:bg-neutral-800 text-amber-700 dark:text-amber-400 font-semibold shadow-xs'
                    : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-200'
                }`}
              >
                {rng === 'today' ? 'Today' : rng === '7days' ? 'Last 7 Days' : rng === '30days' ? 'Last 30 Days' : 'All Time'}
              </button>
            ))}
          </div>

          <button
            onClick={exportCSV}
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold bg-white hover:bg-neutral-100 dark:bg-neutral-900 dark:hover:bg-neutral-800 text-neutral-800 dark:text-neutral-200 hover:text-neutral-900 dark:hover:text-white rounded-lg border border-neutral-300 dark:border-neutral-700 transition-colors shadow-xs"
          >
            <Download className="w-3.5 h-3.5 text-amber-500" />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* KPI Financial Summary Cards (§3.5) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 rounded-xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-neutral-500 dark:text-neutral-400 text-xs">
            <span>Total Recorded Sales</span>
            <DollarSign className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="mt-3">
            <div className="text-xl sm:text-2xl font-extrabold text-neutral-900 dark:text-white font-mono tabular-nums">
              TSH {totalSalesRevenue.toLocaleString()}
            </div>
            <span className="text-[11px] text-neutral-500 mt-0.5 block">Aggregated across all tables & periods</span>
          </div>
        </div>

        <div className="p-4 rounded-xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-neutral-500 dark:text-neutral-400 text-xs">
            <span>Total Completed Orders</span>
            <Receipt className="w-4 h-4 text-amber-500" />
          </div>
          <div className="mt-3">
            <div className="text-xl sm:text-2xl font-extrabold text-neutral-900 dark:text-white font-mono tabular-nums">
              {totalCompletedCount} <span className="text-xs text-neutral-500 dark:text-neutral-400 font-normal">finalized</span>
            </div>
            <span className="text-[11px] text-neutral-500 mt-0.5 block">{totalActiveCount} active in kitchen line</span>
          </div>
        </div>

        <div className="p-4 rounded-xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-neutral-500 dark:text-neutral-400 text-xs">
            <span>Average Order Value</span>
            <TrendingUp className="w-4 h-4 text-blue-500" />
          </div>
          <div className="mt-3">
            <div className="text-xl sm:text-2xl font-extrabold text-neutral-900 dark:text-white font-mono tabular-nums">
              TSH {avgOrderValue.toLocaleString()}
            </div>
            <span className="text-[11px] text-neutral-500 mt-0.5 block">Average per dining table ticket</span>
          </div>
        </div>

        <div className="p-4 rounded-xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-neutral-500 dark:text-neutral-400 text-xs">
            <span>Audit Trail Entries</span>
            <ShieldCheck className="w-4 h-4 text-purple-500" />
          </div>
          <div className="mt-3">
            <div className="text-xl sm:text-2xl font-extrabold text-neutral-900 dark:text-white font-mono tabular-nums">
              {auditLogs.length} <span className="text-xs text-neutral-500 dark:text-neutral-400 font-normal">events</span>
            </div>
            <span className="text-[11px] text-neutral-500 mt-0.5 block">Zero-deletion security compliant</span>
          </div>
        </div>
      </div>

      {/* Reporting Navigation Tabs (§3.5) */}
      <div className="flex items-center gap-2 border-b border-neutral-200 dark:border-neutral-800 overflow-x-auto pb-1 scrollbar-none">
        {[
          { id: 'overview', label: 'All Orders Ledger' },
          { id: 'tables', label: 'Sales by Table' },
          { id: 'waiters', label: 'Sales by Waiter' },
          { id: 'customers', label: 'Sales by Individual Customer' },
          { id: 'items', label: 'Food & Beverage Breakdown' },
          { id: 'cancellations', label: `Cancelled Items (${cancelledItemsList.length})` },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveReportTab(tab.id as typeof activeReportTab)}
            className={`px-3.5 py-2 text-xs font-semibold rounded-t-lg transition-colors whitespace-nowrap ${
              activeReportTab === tab.id
                ? 'bg-white dark:bg-neutral-900 text-amber-700 dark:text-amber-400 border-t-2 border-amber-500 shadow-xs'
                : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-200'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab 1: All Orders History */}
      {activeReportTab === 'overview' && (
        <div className="bg-white dark:bg-neutral-900 rounded-xl border border-neutral-200 dark:border-neutral-800 overflow-hidden shadow-xs">
          <div className="p-4 border-b border-neutral-200 dark:border-neutral-800 flex items-center justify-between gap-4">
            <span className="text-xs font-bold text-neutral-900 dark:text-white">Full Transactional History</span>
            <div className="relative w-64">
              <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400 dark:text-neutral-500" />
              <input
                type="text"
                placeholder="Search orders, tables, waiters..."
                value={searchFilter}
                onChange={(e) => setSearchFilter(e.target.value)}
                className="w-full bg-neutral-50 dark:bg-neutral-950 border border-neutral-300 dark:border-neutral-700 rounded-lg pl-8 pr-3 py-1.5 text-xs text-neutral-900 dark:text-neutral-200 placeholder:text-neutral-400 dark:placeholder:text-neutral-500 focus:outline-none focus:ring-1 focus:ring-amber-500"
              />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-neutral-100/70 dark:bg-neutral-950 text-neutral-600 dark:text-neutral-400 uppercase tracking-wider font-semibold border-b border-neutral-200 dark:border-neutral-800">
                <tr>
                  <th className="px-4 py-3">Order ID</th>
                  <th className="px-4 py-3">Table</th>
                  <th className="px-4 py-3">Waiter</th>
                  <th className="px-4 py-3">Customers & Items</th>
                  <th className="px-4 py-3 text-right">Total Amount</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Timestamp</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-200 dark:divide-neutral-800 text-neutral-800 dark:text-neutral-300">
                {allOrdersList
                  .filter((o) =>
                    searchFilter
                      ? o.orderId.toLowerCase().includes(searchFilter.toLowerCase()) ||
                        o.tableNumber.toLowerCase().includes(searchFilter.toLowerCase()) ||
                        o.waiterName.toLowerCase().includes(searchFilter.toLowerCase())
                      : true
                  )
                  .map((order) => (
                    <tr key={order.orderId} className="hover:bg-neutral-50 dark:hover:bg-neutral-800/40 transition-colors">
                      <td className="px-4 py-3 font-mono font-semibold text-amber-700 dark:text-amber-400">{order.orderId}</td>
                      <td className="px-4 py-3 font-semibold text-neutral-900 dark:text-white">{order.tableNumber}</td>
                      <td className="px-4 py-3">{order.waiterName}</td>
                      <td className="px-4 py-3">
                        <div className="space-y-1">
                          {order.customers.map((c, i) => (
                            <div key={i} className="text-[11px]">
                              <strong className="text-neutral-900 dark:text-neutral-200">{c.name}:</strong>{' '}
                              <span className="text-neutral-600 dark:text-neutral-400">
                                {c.items.map((it) => `${it.quantity}x ${it.name}`).join(', ')}
                              </span>{' '}
                              <span className="font-mono text-amber-700 dark:text-amber-400/90">(TSH {c.total.toLocaleString()})</span>
                            </div>
                          ))}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-right font-mono font-bold text-neutral-900 dark:text-white tabular-nums">
                        TSH {order.totalAmount.toLocaleString()}
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-semibold uppercase tracking-wider ${
                            order.status === 'completed'
                              ? 'bg-emerald-500/20 text-emerald-700 dark:text-emerald-400'
                              : order.status === 'preparing'
                              ? 'bg-amber-500/20 text-amber-800 dark:text-amber-300'
                              : 'bg-blue-500/20 text-blue-700 dark:text-blue-300'
                          }`}
                        >
                          {order.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-neutral-500 dark:text-neutral-400 font-mono text-[11px]">
                        {new Date(order.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 2: Sales by Table (§3.5) */}
      {activeReportTab === 'tables' && (
        <div className="bg-white dark:bg-neutral-900 rounded-xl border border-neutral-200 dark:border-neutral-800 p-5 space-y-4 shadow-xs">
          <h3 className="text-sm font-bold text-neutral-900 dark:text-white">Sales by Dining Table</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {Object.entries(salesByTableMap).map(([table, revenue]) => {
              const pct = totalSalesRevenue > 0 ? ((revenue / totalSalesRevenue) * 100).toFixed(1) : '0';
              return (
                <div key={table} className="p-4 bg-neutral-50 dark:bg-neutral-950 rounded-lg border border-neutral-200 dark:border-neutral-800">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-bold text-neutral-900 dark:text-white">{table}</span>
                    <span className="text-sm font-mono font-bold text-amber-600 dark:text-amber-400 tabular-nums">
                      TSH {revenue.toLocaleString()}
                    </span>
                  </div>
                  <div className="w-full bg-neutral-200 dark:bg-neutral-800 h-2 rounded-full overflow-hidden">
                    <div className="bg-amber-500 h-full rounded-full" style={{ width: `${pct}%` }} />
                  </div>
                  <span className="text-[11px] text-neutral-500 mt-1.5 block">{pct}% of total restaurant revenue</span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Tab 3: Sales by Waiter (§3.5) */}
      {activeReportTab === 'waiters' && (
        <div className="bg-white dark:bg-neutral-900 rounded-xl border border-neutral-200 dark:border-neutral-800 p-5 space-y-4 shadow-xs">
          <h3 className="text-sm font-bold text-neutral-900 dark:text-white">Sales by Staff / Waiter</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {Object.entries(salesByWaiterMap).map(([waiter, revenue]) => {
              const pct = totalSalesRevenue > 0 ? ((revenue / totalSalesRevenue) * 100).toFixed(1) : '0';
              return (
                <div key={waiter} className="p-4 bg-neutral-50 dark:bg-neutral-950 rounded-lg border border-neutral-200 dark:border-neutral-800">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-bold text-neutral-900 dark:text-white">{waiter}</span>
                    <span className="text-sm font-mono font-bold text-emerald-600 dark:text-emerald-400 tabular-nums">
                      TSH {revenue.toLocaleString()}
                    </span>
                  </div>
                  <div className="w-full bg-neutral-200 dark:bg-neutral-800 h-2 rounded-full overflow-hidden">
                    <div className="bg-emerald-500 h-full rounded-full" style={{ width: `${pct}%` }} />
                  </div>
                  <span className="text-[11px] text-neutral-500 mt-1.5 block">{pct}% of recorded floor orders</span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Tab 4: Sales by Individual Customer (§3.5) */}
      {activeReportTab === 'customers' && (
        <div className="bg-white dark:bg-neutral-900 rounded-xl border border-neutral-200 dark:border-neutral-800 p-5 space-y-4 shadow-xs">
          <h3 className="text-sm font-bold text-neutral-900 dark:text-white">Sales by Individual Customer (SRS §3.2 & §3.5)</h3>
          <p className="text-xs text-neutral-500 dark:text-neutral-400">
            Individualized billing records tracked even when multiple guests share the same table.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
            {Object.entries(salesByCustomerMap).map(([custName, total]) => (
              <div key={custName} className="p-3.5 bg-neutral-50 dark:bg-neutral-950 rounded-lg border border-neutral-200 dark:border-neutral-800">
                <span className="text-xs font-semibold text-neutral-700 dark:text-neutral-300 block">{custName}</span>
                <span className="text-base font-bold text-amber-600 dark:text-amber-400 font-mono tabular-nums block mt-1">
                  TSH {total.toLocaleString()}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 5: Breakdown by Food and Beverage Items (§3.5) */}
      {activeReportTab === 'items' && (
        <div className="bg-white dark:bg-neutral-900 rounded-xl border border-neutral-200 dark:border-neutral-800 p-5 space-y-4 shadow-xs">
          <h3 className="text-sm font-bold text-neutral-900 dark:text-white">Sales Breakdown by Food & Beverage Item</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-neutral-100/70 dark:bg-neutral-950 text-neutral-600 dark:text-neutral-400 uppercase tracking-wider font-semibold border-b border-neutral-200 dark:border-neutral-800">
                <tr>
                  <th className="px-4 py-3">Menu Item</th>
                  <th className="px-4 py-3 text-center">Quantity Sold</th>
                  <th className="px-4 py-3 text-right">Total Revenue (TSH)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-200 dark:divide-neutral-800">
                {Object.entries(itemsSalesMap).map(([name, data]) => (
                  <tr key={name} className="hover:bg-neutral-50 dark:hover:bg-neutral-800/40">
                    <td className="px-4 py-3 font-semibold text-neutral-900 dark:text-white">{name}</td>
                    <td className="px-4 py-3 text-center font-mono font-bold text-neutral-700 dark:text-neutral-200">{data.quantity}</td>
                    <td className="px-4 py-3 text-right font-mono font-bold text-amber-600 dark:text-amber-400 tabular-nums">
                      TSH {data.revenue.toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 6: Cancelled Orders & Items (§3.4 & §3.5) */}
      {activeReportTab === 'cancellations' && (
        <div className="bg-white dark:bg-neutral-900 rounded-xl border border-neutral-200 dark:border-neutral-800 p-5 space-y-4 shadow-xs">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-neutral-900 dark:text-white">Cancelled Order Items Audit Log (§3.4)</h3>
              <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5">
                Every cancelled food/beverage item remains traceable for accountability and loss prevention.
              </p>
            </div>
          </div>

          {cancelledItemsList.length === 0 ? (
            <div className="p-8 text-center border border-dashed border-neutral-300 dark:border-neutral-800 rounded-lg text-neutral-500 dark:text-neutral-400 text-xs">
              No cancelled items recorded in active dining sessions.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-neutral-100/70 dark:bg-neutral-950 text-neutral-600 dark:text-neutral-400 uppercase tracking-wider font-semibold border-b border-neutral-200 dark:border-neutral-800">
                  <tr>
                    <th className="px-4 py-3">Table</th>
                    <th className="px-4 py-3">Customer</th>
                    <th className="px-4 py-3">Item Cancelled</th>
                    <th className="px-4 py-3">Price</th>
                    <th className="px-4 py-3">Reason</th>
                    <th className="px-4 py-3">Authorized By</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-200 dark:divide-neutral-800">
                  {cancelledItemsList.map((c, i) => (
                    <tr key={i} className="hover:bg-neutral-50 dark:hover:bg-neutral-800/40 text-rose-800 dark:text-rose-200/90">
                      <td className="px-4 py-3 font-semibold text-neutral-900 dark:text-white">{c.tableNumber}</td>
                      <td className="px-4 py-3 text-amber-700 dark:text-amber-300 font-medium">{c.customerName}</td>
                      <td className="px-4 py-3 font-semibold">{c.itemName}</td>
                      <td className="px-4 py-3 font-mono text-neutral-600 dark:text-neutral-300 tabular-nums">
                        TSH {c.price.toLocaleString()}
                      </td>
                      <td className="px-4 py-3 text-neutral-500 dark:text-neutral-400 italic">{c.cancelReason}</td>
                      <td className="px-4 py-3 font-mono text-xs text-neutral-600 dark:text-neutral-300">{c.cancelledBy}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
