export type AppRole = 'waiter' | 'kitchen' | 'admin' | 'projects';

export type MenuCategory = 
  | 'All'
  | 'Pizza & Italian'
  | 'Grill & Poultry'
  | 'Seafood & Rice'
  | 'Beverages'
  | 'Desserts';

export interface MenuItem {
  id: string;
  name: string;
  category: Exclude<MenuCategory, 'All'>;
  price: number; // In Tanzanian Shillings (TSH)
  description: string;
  image: string;
  isAvailable: boolean;
  preparationTimeMinutes: number;
}

export interface CustomerOrderItem {
  id: string;
  menuItemId: string;
  name: string;
  price: number;
  quantity: number;
  notes?: string;
  status: 'pending' | 'preparing' | 'ready' | 'served' | 'cancelled';
  cancelledAt?: string;
  cancelReason?: string;
  cancelledBy?: string;
}

export interface CustomerOrder {
  customerId: string;
  customerName: string;
  items: CustomerOrderItem[];
  individualTotal: number;
}

export interface TableOrder {
  orderId: string;
  tableNumber: string; // e.g. "Table No. 1"
  waiterId: string;
  waiterName: string;
  customers: CustomerOrder[];
  overallTableTotal: number;
  status: 'submitted' | 'preparing' | 'ready' | 'completed' | 'cancelled';
  submittedAt: string;
  completedAt?: string;
  updatedAt?: string;
  paymentStatus: 'unpaid' | 'paid';
  lastNotification?: {
    type: 'new_order' | 'item_cancelled';
    message: string;
    timestamp: string;
  };
}

export interface AuditLogEntry {
  id: string;
  timestamp: string;
  adminName: string;
  action: 'PRICE_UPDATE' | 'MENU_EDIT' | 'MENU_DELETE' | 'ORDER_MODIFICATION' | 'CANCELLATION_OVERRIDE';
  target: string;
  previousValue?: string;
  newValue?: string;
  reason: string;
}

export interface ProjectTask {
  id: string;
  title: string;
  description: string;
  category: 'Kitchen Operations' | 'Inventory & Sourcing' | 'Floor & Service' | 'Menu R&D' | 'Compliance & Audit';
  status: 'backlog' | 'todo' | 'in_progress' | 'review' | 'done';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  assignee: {
    id: string;
    name: string;
    role: string;
    avatar: string;
  };
  dueDate: string;
  tags: string[];
  comments: {
    id: string;
    author: string;
    avatar: string;
    text: string;
    timestamp: string;
  }[];
}

export interface TeamMember {
  id: string;
  name: string;
  role: string;
  status: 'online' | 'busy' | 'away';
  avatar: string;
  recentActivity: string;
}
