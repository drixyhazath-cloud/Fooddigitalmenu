import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import {
  AppRole,
  MenuItem,
  CustomerOrder,
  TableOrder,
  CustomerOrderItem,
  AuditLogEntry,
  ProjectTask,
  TeamMember,
} from '../types';
import {
  INITIAL_MENU_ITEMS,
  INITIAL_ORDERS,
  INITIAL_HISTORICAL_SALES,
  INITIAL_AUDIT_LOGS,
  INITIAL_PROJECT_TASKS,
  INITIAL_TEAM_MEMBERS,
} from '../data/initialData';

interface NotificationAlert {
  id: string;
  type: 'order_submitted' | 'item_cancelled' | 'item_ready' | 'task_updated';
  title: string;
  message: string;
  tableNumber?: string;
  timestamp: string;
}

interface AppContextType {
  role: AppRole;
  setRole: (role: AppRole) => void;
  viewportMode: 'desktop' | 'tablet' | 'mobile';
  setViewportMode: (mode: 'desktop' | 'tablet' | 'mobile') => void;
  theme: 'dark' | 'light';
  toggleTheme: () => void;
  setTheme: (theme: 'dark' | 'light') => void;
  
  // Menu
  menuItems: MenuItem[];
  addMenuItem: (item: Omit<MenuItem, 'id'>, reason: string) => void;
  updateMenuItem: (id: string, updates: Partial<MenuItem>, reason: string) => void;
  deleteMenuItem: (id: string, reason: string) => void;
  updateItemPrice: (id: string, newPrice: number, reason: string) => void;

  // Active Orders & KDS
  activeOrders: TableOrder[];
  completedOrders: typeof INITIAL_HISTORICAL_SALES;
  notifications: NotificationAlert[];
  dismissNotification: (id: string) => void;
  soundEnabled: boolean;
  toggleSound: () => void;
  
  // Waiter Active Draft Session
  selectedTable: string;
  setSelectedTable: (table: string) => void;
  draftCustomers: CustomerOrder[];
  activeCustomerId: string;
  setActiveCustomerId: (id: string) => void;
  addCustomerToTable: (customerName: string) => void;
  removeCustomerFromTable: (customerId: string) => void;
  updateCustomerName: (customerId: string, name: string) => void;
  toggleItemForCustomer: (customerId: string, menuItem: MenuItem) => void;
  updateItemQuantity: (customerId: string, itemId: string, delta: number) => void;
  sendTableOrderToKitchen: () => { success: boolean; error?: string };
  cancelOrderItem: (orderId: string, customerId: string, itemId: string, reason: string, adminOverride?: boolean) => { success: boolean; error?: string; requiresAdmin?: boolean };
  
  // Kitchen actions
  updateItemStatus: (orderId: string, customerId: string, itemId: string, status: CustomerOrderItem['status']) => void;
  updateOrderStatus: (orderId: string, status: TableOrder['status']) => void;

  // Admin & Audits
  auditLogs: AuditLogEntry[];
  addAuditLog: (entry: Omit<AuditLogEntry, 'id' | 'timestamp'>) => void;
  
  // Project Tasks
  tasks: ProjectTask[];
  teamMembers: TeamMember[];
  addTask: (task: Omit<ProjectTask, 'id' | 'comments'>) => void;
  updateTaskStatus: (taskId: string, status: ProjectTask['status']) => void;
  addTaskComment: (taskId: string, text: string) => void;
  activityStream: { id: string; user: string; text: string; time: string }[];
}

const AppContext = createContext<AppContextType | undefined>(undefined);

// Web Audio synthesizer for real-time order and cancellation chimes
function playChime(type: 'order' | 'cancel' | 'ready') {
  try {
    const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!AudioContextClass) return;
    const ctx = new AudioContextClass();

    if (type === 'order') {
      // Pleasant double chime for new order
      const osc1 = ctx.createOscillator();
      const osc2 = ctx.createOscillator();
      const gain = ctx.createGain();

      osc1.type = 'sine';
      osc1.frequency.setValueAtTime(587.33, ctx.currentTime); // D5
      osc1.frequency.setValueAtTime(880.00, ctx.currentTime + 0.12); // A5

      osc2.type = 'triangle';
      osc2.frequency.setValueAtTime(1174.66, ctx.currentTime + 0.12); // D6

      gain.gain.setValueAtTime(0.15, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.6);

      osc1.connect(gain);
      osc2.connect(gain);
      gain.connect(ctx.destination);

      osc1.start();
      osc2.start();
      osc1.stop(ctx.currentTime + 0.6);
      osc2.stop(ctx.currentTime + 0.6);
    } else if (type === 'cancel') {
      // Urgent soft alert for item cancellation
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(440, ctx.currentTime);
      osc.frequency.setValueAtTime(329.63, ctx.currentTime + 0.15); // Descending tone

      gain.gain.setValueAtTime(0.2, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.5);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start();
      osc.stop(ctx.currentTime + 0.5);
    }
  } catch (err) {
    console.debug('Audio play blocked or unavailable:', err);
  }
}

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [role, setRole] = useState<AppRole>('waiter');
  const [viewportMode, setViewportMode] = useState<'desktop' | 'tablet' | 'mobile'>('desktop');
  const [soundEnabled, setSoundEnabled] = useState(true);

  // Theme Management (Light / Dark mode)
  const [theme, setThemeState] = useState<'dark' | 'light'>(() => {
    const saved = localStorage.getItem('fdm_theme');
    return saved === 'light' || saved === 'dark' ? saved : 'dark';
  });

  useEffect(() => {
    localStorage.setItem('fdm_theme', theme);
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
      document.documentElement.classList.remove('light');
    } else {
      document.documentElement.classList.remove('dark');
      document.documentElement.classList.add('light');
    }
  }, [theme]);

  const toggleTheme = () => setThemeState((prev) => (prev === 'dark' ? 'light' : 'dark'));
  const setTheme = (t: 'dark' | 'light') => setThemeState(t);

  // Core Data
  const [menuItems, setMenuItems] = useState<MenuItem[]>(() => {
    const saved = localStorage.getItem('fdm_menu');
    return saved ? JSON.parse(saved) : INITIAL_MENU_ITEMS;
  });

  const [activeOrders, setActiveOrders] = useState<TableOrder[]>(() => {
    const saved = localStorage.getItem('fdm_active_orders');
    return saved ? JSON.parse(saved) : INITIAL_ORDERS;
  });

  const [completedOrders, setCompletedOrders] = useState<typeof INITIAL_HISTORICAL_SALES>(() => {
    const saved = localStorage.getItem('fdm_completed_orders');
    return saved ? JSON.parse(saved) : INITIAL_HISTORICAL_SALES;
  });

  const [auditLogs, setAuditLogs] = useState<AuditLogEntry[]>(() => {
    const saved = localStorage.getItem('fdm_audit_logs');
    return saved ? JSON.parse(saved) : INITIAL_AUDIT_LOGS;
  });

  const [tasks, setTasks] = useState<ProjectTask[]>(() => {
    const saved = localStorage.getItem('fdm_tasks');
    return saved ? JSON.parse(saved) : INITIAL_PROJECT_TASKS;
  });

  const [teamMembers] = useState<TeamMember[]>(INITIAL_TEAM_MEMBERS);
  const [notifications, setNotifications] = useState<NotificationAlert[]>([]);
  const [activityStream, setActivityStream] = useState<{ id: string; user: string; text: string; time: string }[]>([
    { id: 'act-1', user: 'Sarah Kibwana', text: 'Submitted Table No. 1 order to Kitchen', time: '14 min ago' },
    { id: 'act-2', user: 'Chef Juma Mussa', text: 'Marked Anthony\'s Passion Cooler Ready for Pickup', time: '8 min ago' },
    { id: 'act-3', user: 'David Tarimo', text: 'Approved supplier fish cost agreement review', time: '20 min ago' },
  ]);

  // Waiter Draft Order State
  const [selectedTable, setSelectedTable] = useState<string>('Table No. 2');
  const [draftCustomers, setDraftCustomers] = useState<CustomerOrder[]>([
    {
      customerId: 'draft-c1',
      customerName: 'Customer 1',
      items: [],
      individualTotal: 0,
    },
  ]);
  const [activeCustomerId, setActiveCustomerId] = useState<string>('draft-c1');

  // Local storage sync
  useEffect(() => {
    localStorage.setItem('fdm_menu', JSON.stringify(menuItems));
  }, [menuItems]);

  useEffect(() => {
    localStorage.setItem('fdm_active_orders', JSON.stringify(activeOrders));
  }, [activeOrders]);

  useEffect(() => {
    localStorage.setItem('fdm_completed_orders', JSON.stringify(completedOrders));
  }, [completedOrders]);

  useEffect(() => {
    localStorage.setItem('fdm_audit_logs', JSON.stringify(auditLogs));
  }, [auditLogs]);

  useEffect(() => {
    localStorage.setItem('fdm_tasks', JSON.stringify(tasks));
  }, [tasks]);

  // BroadcastChannel for cross-tab multi-device real-time sync
  useEffect(() => {
    if (typeof BroadcastChannel === 'undefined') return;
    const channel = new BroadcastChannel('fdm_channel');
    channel.onmessage = (event) => {
      const data = event.data;
      if (data?.type === 'SYNC_ORDERS') {
        setActiveOrders(data.orders);
        if (data.notification) {
          setNotifications((prev) => [data.notification, ...prev]);
          if (soundEnabled) playChime(data.notification.type === 'item_cancelled' ? 'cancel' : 'order');
        }
      }
    };
    return () => {
      channel.close();
    };
  }, [soundEnabled]);

  const broadcastOrders = useCallback((orders: TableOrder[], notification?: NotificationAlert) => {
    if (typeof BroadcastChannel !== 'undefined') {
      const channel = new BroadcastChannel('fdm_channel');
      channel.postMessage({ type: 'SYNC_ORDERS', orders, notification });
      channel.close();
    }
  }, []);

  const toggleSound = () => setSoundEnabled((prev) => !prev);
  const dismissNotification = (id: string) => setNotifications((prev) => prev.filter((n) => n.id !== id));

  // Audit Logger helper
  const addAuditLog = useCallback((entry: Omit<AuditLogEntry, 'id' | 'timestamp'>) => {
    const newEntry: AuditLogEntry = {
      ...entry,
      id: `audit-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      timestamp: new Date().toISOString(),
    };
    setAuditLogs((prev) => [newEntry, ...prev]);
  }, []);

  // Menu Management
  const addMenuItem = (item: Omit<MenuItem, 'id'>, reason: string) => {
    const newItem: MenuItem = {
      ...item,
      id: `menu-${Date.now()}`,
    };
    setMenuItems((prev) => [...prev, newItem]);
    addAuditLog({
      adminName: 'Owner / Chief Executive',
      action: 'MENU_EDIT',
      target: `${newItem.name} (${newItem.id})`,
      newValue: `Created in ${newItem.category} at TSH ${newItem.price.toLocaleString()}`,
      reason: reason || 'New menu catalog item addition',
    });
  };

  const updateMenuItem = (id: string, updates: Partial<MenuItem>, reason: string) => {
    const existing = menuItems.find((m) => m.id === id);
    if (!existing) return;
    setMenuItems((prev) => prev.map((m) => (m.id === id ? { ...m, ...updates } : m)));
    addAuditLog({
      adminName: 'Owner / Chief Executive',
      action: 'MENU_EDIT',
      target: `${existing.name} (${id})`,
      previousValue: JSON.stringify(updates),
      newValue: 'Item fields updated',
      reason: reason || 'Administrative catalog update',
    });
  };

  const deleteMenuItem = (id: string, reason: string) => {
    const existing = menuItems.find((m) => m.id === id);
    if (!existing) return;
    setMenuItems((prev) => prev.filter((m) => m.id !== id));
    addAuditLog({
      adminName: 'Owner / Chief Executive',
      action: 'MENU_DELETE',
      target: `${existing.name} (${id})`,
      previousValue: `Price: TSH ${existing.price}`,
      reason: reason || 'Catalog removal',
    });
  };

  const updateItemPrice = (id: string, newPrice: number, reason: string) => {
    const existing = menuItems.find((m) => m.id === id);
    if (!existing) return;
    setMenuItems((prev) => prev.map((m) => (m.id === id ? { ...m, price: newPrice } : m)));
    addAuditLog({
      adminName: 'Owner / Chief Executive',
      action: 'PRICE_UPDATE',
      target: `${existing.name} (${id})`,
      previousValue: `TSH ${existing.price.toLocaleString()}`,
      newValue: `TSH ${newPrice.toLocaleString()}`,
      reason: reason || 'Operational price adjustment',
    });
  };

  // Waiter Actions
  const addCustomerToTable = (customerName: string) => {
    const newId = `cust-${Date.now()}`;
    const newCustomer: CustomerOrder = {
      customerId: newId,
      customerName: customerName.trim() || `Customer ${draftCustomers.length + 1}`,
      items: [],
      individualTotal: 0,
    };
    setDraftCustomers((prev) => [...prev, newCustomer]);
    setActiveCustomerId(newId);
  };

  const removeCustomerFromTable = (customerId: string) => {
    if (draftCustomers.length <= 1) return;
    const filtered = draftCustomers.filter((c) => c.customerId !== customerId);
    setDraftCustomers(filtered);
    if (activeCustomerId === customerId) {
      setActiveCustomerId(filtered[0].customerId);
    }
  };

  const updateCustomerName = (customerId: string, name: string) => {
    setDraftCustomers((prev) =>
      prev.map((c) => (c.customerId === customerId ? { ...c, customerName: name } : c))
    );
  };

  const toggleItemForCustomer = (customerId: string, menuItem: MenuItem) => {
    setDraftCustomers((prev) =>
      prev.map((cust) => {
        if (cust.customerId !== customerId) return cust;

        const existingItem = cust.items.find((i) => i.menuItemId === menuItem.id);
        let updatedItems: CustomerOrderItem[];

        if (existingItem) {
          // If already selected, remove it (toggle off) or decrement
          updatedItems = cust.items.filter((i) => i.menuItemId !== menuItem.id);
        } else {
          // Add new selected item with checkmark indicator
          const newItem: CustomerOrderItem = {
            id: `item-${Date.now()}-${Math.random().toString(36).substring(2, 5)}`,
            menuItemId: menuItem.id,
            name: menuItem.name,
            price: menuItem.price,
            quantity: 1,
            status: 'pending',
          };
          updatedItems = [...cust.items, newItem];
        }

        const individualTotal = updatedItems.reduce((acc, curr) => acc + curr.price * curr.quantity, 0);
        return {
          ...cust,
          items: updatedItems,
          individualTotal,
        };
      })
    );
  };

  const updateItemQuantity = (customerId: string, itemId: string, delta: number) => {
    setDraftCustomers((prev) =>
      prev.map((cust) => {
        if (cust.customerId !== customerId) return cust;

        const updatedItems = cust.items
          .map((i) => {
            if (i.id === itemId) {
              const newQty = i.quantity + delta;
              return newQty > 0 ? { ...i, quantity: newQty } : null;
            }
            return i;
          })
          .filter(Boolean) as CustomerOrderItem[];

        const individualTotal = updatedItems.reduce((acc, curr) => acc + curr.price * curr.quantity, 0);
        return {
          ...cust,
          items: updatedItems,
          individualTotal,
        };
      })
    );
  };

  const sendTableOrderToKitchen = (): { success: boolean; error?: string } => {
    // Check that at least one customer has ordered items
    const customersWithOrders = draftCustomers.filter((c) => c.items.length > 0);
    if (customersWithOrders.length === 0) {
      return { success: false, error: 'Cannot submit an empty order. Please select items for at least one customer.' };
    }

    const overallTableTotal = customersWithOrders.reduce((sum, c) => sum + c.individualTotal, 0);
    const newOrderId = `FDM-${Math.floor(1000 + Math.random() * 9000)}`;

    const newOrder: TableOrder = {
      orderId: newOrderId,
      tableNumber: selectedTable,
      waiterId: 'waiter-1',
      waiterName: 'Sarah Kibwana',
      customers: customersWithOrders,
      overallTableTotal,
      status: 'submitted',
      submittedAt: new Date().toISOString(),
      paymentStatus: 'unpaid',
      lastNotification: {
        type: 'new_order',
        message: `New Order ${newOrderId} for ${selectedTable} (${customersWithOrders.length} customer${customersWithOrders.length > 1 ? 's' : ''})`,
        timestamp: new Date().toISOString(),
      },
    };

    const updated = [newOrder, ...activeOrders];
    setActiveOrders(updated);

    const alert: NotificationAlert = {
      id: `alert-${Date.now()}`,
      type: 'order_submitted',
      title: `New Order: ${selectedTable}`,
      message: `${customersWithOrders.map((c) => c.customerName).join(', ')} · Total: TSH ${overallTableTotal.toLocaleString()}`,
      tableNumber: selectedTable,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setNotifications((prev) => [alert, ...prev]);
    if (soundEnabled) playChime('order');
    broadcastOrders(updated, alert);

    setActivityStream((prev) => [
      {
        id: `act-${Date.now()}`,
        user: 'Sarah Kibwana',
        text: `Submitted order for ${selectedTable} (TSH ${overallTableTotal.toLocaleString()})`,
        time: 'Just now',
      },
      ...prev,
    ]);

    // Reset draft session for next order
    setDraftCustomers([
      {
        customerId: `draft-${Date.now()}`,
        customerName: 'Customer 1',
        items: [],
        individualTotal: 0,
      },
    ]);
    setActiveCustomerId(`draft-${Date.now()}`);

    return { success: true };
  };

  // Order Cancellation Management (§3.4)
  const cancelOrderItem = (
    orderId: string,
    customerId: string,
    itemId: string,
    reason: string,
    adminOverride: boolean = false
  ): { success: boolean; error?: string; requiresAdmin?: boolean } => {
    const orderIndex = activeOrders.findIndex((o) => o.orderId === orderId);
    if (orderIndex === -1) return { success: false, error: 'Order not found' };

    const order = activeOrders[orderIndex];
    const customer = order.customers.find((c) => c.customerId === customerId);
    if (!customer) return { success: false, error: 'Customer not found' };

    const item = customer.items.find((i) => i.id === itemId);
    if (!item) return { success: false, error: 'Item not found' };

    if (item.status === 'cancelled') {
      return { success: false, error: 'Item is already cancelled' };
    }

    // SRS §3.4 Rule: If item has already entered preparation, prevent unauthorized cancellation
    // unless authorized administrator approves an exception
    if (item.status === 'preparing' && !adminOverride) {
      return {
        success: false,
        requiresAdmin: true,
        error: `"${item.name}" has already entered kitchen preparation. As per SRS §3.4, cancellation of in-prep items requires Kitchen Manager or Administrator override.`,
      };
    }

    if (item.status === 'ready' || item.status === 'served') {
      return {
        success: false,
        error: `Cannot cancel item "${item.name}" because it is already marked as ${item.status}.`,
      };
    }

    // Perform cancellation and recalculate totals
    const updatedCustomers = order.customers.map((c) => {
      if (c.customerId !== customerId) return c;

      const updatedItems = c.items.map((i) => {
        if (i.id === itemId) {
          return {
            ...i,
            status: 'cancelled' as const,
            cancelledAt: new Date().toISOString(),
            cancelReason: reason || 'Customer requested before preparation',
            cancelledBy: adminOverride ? 'Admin Override' : 'Waiter (Sarah K.)',
          };
        }
        return i;
      });

      // Recalculate customer's active items total
      const individualTotal = updatedItems
        .filter((i) => i.status !== 'cancelled')
        .reduce((sum, curr) => sum + curr.price * curr.quantity, 0);

      return {
        ...c,
        items: updatedItems,
        individualTotal,
      };
    });

    const overallTableTotal = updatedCustomers.reduce((sum, c) => sum + c.individualTotal, 0);

    const updatedOrder: TableOrder = {
      ...order,
      customers: updatedCustomers,
      overallTableTotal,
      updatedAt: new Date().toISOString(),
      lastNotification: {
        type: 'item_cancelled',
        message: `Cancelled: ${item.name} for ${customer.customerName} (${order.tableNumber})`,
        timestamp: new Date().toISOString(),
      },
    };

    const newActiveOrders = [...activeOrders];
    newActiveOrders[orderIndex] = updatedOrder;
    setActiveOrders(newActiveOrders);

    // Kitchen Alert Notification
    const alert: NotificationAlert = {
      id: `alert-${Date.now()}`,
      type: 'item_cancelled',
      title: `Item Cancelled at ${order.tableNumber}`,
      message: `${item.name} for ${customer.customerName} was cancelled. Recalculated Total: TSH ${overallTableTotal.toLocaleString()}`,
      tableNumber: order.tableNumber,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setNotifications((prev) => [alert, ...prev]);
    if (soundEnabled) playChime('cancel');
    broadcastOrders(newActiveOrders, alert);

    addAuditLog({
      adminName: adminOverride ? 'Admin / Kitchen Manager' : 'Waiter Sarah Kibwana',
      action: 'ORDER_MODIFICATION',
      target: `Item ${item.name} in Order ${order.orderId} (${order.tableNumber})`,
      previousValue: `Customer: ${customer.customerName}, Item Total: TSH ${item.price * item.quantity}`,
      newValue: 'Status: CANCELLED',
      reason: reason || 'Customer cancellation request prior to kitchen fulfillment',
    });

    setActivityStream((prev) => [
      {
        id: `act-${Date.now()}`,
        user: adminOverride ? 'Kitchen Manager' : 'Sarah Kibwana',
        text: `Cancelled ${item.name} for ${customer.customerName} at ${order.tableNumber}`,
        time: 'Just now',
      },
      ...prev,
    ]);

    return { success: true };
  };

  // Kitchen Actions
  const updateItemStatus = (orderId: string, customerId: string, itemId: string, status: CustomerOrderItem['status']) => {
    setActiveOrders((prev) =>
      prev.map((order) => {
        if (order.orderId !== orderId) return order;

        const updatedCustomers = order.customers.map((cust) => {
          if (cust.customerId !== customerId) return cust;
          return {
            ...cust,
            items: cust.items.map((item) => (item.id === itemId ? { ...item, status } : item)),
          };
        });

        // Check if all non-cancelled items are ready/served
        const allItems = updatedCustomers.flatMap((c) => c.items).filter((i) => i.status !== 'cancelled');
        let orderStatus = order.status;
        if (allItems.every((i) => i.status === 'served')) {
          orderStatus = 'completed';
        } else if (allItems.every((i) => i.status === 'ready' || i.status === 'served')) {
          orderStatus = 'ready';
        } else if (allItems.some((i) => i.status === 'preparing')) {
          orderStatus = 'preparing';
        }

        return {
          ...order,
          customers: updatedCustomers,
          status: orderStatus,
          updatedAt: new Date().toISOString(),
        };
      })
    );
  };

  const updateOrderStatus = (orderId: string, status: TableOrder['status']) => {
    setActiveOrders((prev) => {
      const order = prev.find((o) => o.orderId === orderId);
      if (!order) return prev;

      if (status === 'completed') {
        // Move to historical sales records
        const completedSale = {
          orderId: order.orderId,
          tableNumber: order.tableNumber,
          waiterName: order.waiterName,
          timestamp: new Date().toISOString(),
          customers: order.customers.map((c) => ({
            name: c.customerName,
            total: c.individualTotal,
            items: c.items.map((i) => ({ name: i.name, quantity: i.quantity, price: i.price })),
          })),
          totalAmount: order.overallTableTotal,
          status: 'completed' as const,
        };
        setCompletedOrders((hist) => [completedSale, ...hist]);
        return prev.filter((o) => o.orderId !== orderId);
      }

      return prev.map((o) =>
        o.orderId === orderId
          ? {
              ...o,
              status,
              customers: o.customers.map((c) => ({
                ...c,
                items: c.items.map((i) => (i.status !== 'cancelled' ? { ...i, status: status === 'preparing' ? 'preparing' : status === 'ready' ? 'ready' : i.status } : i)),
              })),
            }
          : o
      );
    });
  };

  // Project Task Management
  const addTask = (newTask: Omit<ProjectTask, 'id' | 'comments'>) => {
    const task: ProjectTask = {
      ...newTask,
      id: `task-${Date.now()}`,
      comments: [],
    };
    setTasks((prev) => [task, ...prev]);
    setActivityStream((prev) => [
      {
        id: `act-${Date.now()}`,
        user: 'Operations Lead',
        text: `Created new project task: "${task.title}"`,
        time: 'Just now',
      },
      ...prev,
    ]);
  };

  const updateTaskStatus = (taskId: string, status: ProjectTask['status']) => {
    setTasks((prev) =>
      prev.map((t) => (t.id === taskId ? { ...t, status } : t))
    );
    const task = tasks.find((t) => t.id === taskId);
    if (task) {
      setActivityStream((prev) => [
        {
          id: `act-${Date.now()}`,
          user: task.assignee.name,
          text: `Moved "${task.title}" to ${status.replace('_', ' ').toUpperCase()}`,
          time: 'Just now',
        },
        ...prev,
      ]);
    }
  };

  const addTaskComment = (taskId: string, text: string) => {
    setTasks((prev) =>
      prev.map((t) => {
        if (t.id !== taskId) return t;
        const newComment = {
          id: `comm-${Date.now()}`,
          author: 'David Tarimo (GM)',
          avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=80',
          text,
          timestamp: 'Just now',
        };
        return {
          ...t,
          comments: [...t.comments, newComment],
        };
      })
    );
  };

  return (
    <AppContext.Provider
      value={{
        role,
        setRole,
        viewportMode,
        setViewportMode,
        theme,
        toggleTheme,
        setTheme,
        menuItems,
        addMenuItem,
        updateMenuItem,
        deleteMenuItem,
        updateItemPrice,
        activeOrders,
        completedOrders,
        notifications,
        dismissNotification,
        soundEnabled,
        toggleSound,
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
        cancelOrderItem,
        updateItemStatus,
        updateOrderStatus,
        auditLogs,
        addAuditLog,
        tasks,
        teamMembers,
        addTask,
        updateTaskStatus,
        addTaskComment,
        activityStream,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error('useApp must be used within an AppProvider');
  return context;
};
