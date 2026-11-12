import { MenuItem, TableOrder, AuditLogEntry, ProjectTask, TeamMember } from '../types';

export const INITIAL_MENU_ITEMS: MenuItem[] = [
  {
    id: 'menu-1',
    name: 'Artisan Wood-Fired Pizza',
    category: 'Pizza & Italian',
    price: 19000, // TSH as specified in SRS §3.1 & §3.2
    description: 'Fresh buffalo mozzarella, crushed San Marzano tomato sauce, fragrant basil on blistered sourdough.',
    image: '/src/assets/images/food_artisan_pizza_1794463049962.jpg',
    isAvailable: true,
    preparationTimeMinutes: 18,
  },
  {
    id: 'menu-2',
    name: 'Golden Roasted Herb Chicken',
    category: 'Grill & Poultry',
    price: 10000, // TSH as specified in SRS §3.1 & §3.2
    description: 'Crispy herb-marinated farm chicken quarter, roasted with rosemary, charred lemon, and pan jus.',
    image: '/src/assets/images/food_roasted_chicken_1794463050346.jpg',
    isAvailable: true,
    preparationTimeMinutes: 22,
  },
  {
    id: 'menu-3',
    name: 'Grilled Lake Fish Fillet',
    category: 'Seafood & Rice',
    price: 10000, // TSH as specified in SRS §3.2 (Musa order)
    description: 'Locally caught fresh whitefish fillet, spiced and pan-seared with coriander, garlic butter and fresh lime.',
    image: '/src/assets/images/food_fish_rice_1794463052023.jpg',
    isAvailable: true,
    preparationTimeMinutes: 20,
  },
  {
    id: 'menu-4',
    name: 'Fragrant Pilau Rice',
    category: 'Seafood & Rice',
    price: 5000, // TSH as specified in SRS §3.2 (Musa order)
    description: 'Traditional Tanzanian spiced long-grain basmati rice simmered in cardamom, cloves, and caramelized onions.',
    image: '/src/assets/images/food_fish_rice_1794463052023.jpg',
    isAvailable: true,
    preparationTimeMinutes: 8,
  },
  {
    id: 'menu-5',
    name: 'Tropical Passion & Mint Cooler',
    category: 'Beverages',
    price: 6000,
    description: 'Chilled freshly pressed passion fruit, crushed spearmint, lime elixir, served over carved ice.',
    image: '/src/assets/images/food_fresh_beverage_1794463051379.jpg',
    isAvailable: true,
    preparationTimeMinutes: 5,
  },
  {
    id: 'menu-6',
    name: 'Quattro Formaggi Bianca Pizza',
    category: 'Pizza & Italian',
    price: 21000,
    description: 'Mozzarella, gorgonzola, smoked provolone, and parmesan with hot honey drizzle.',
    image: '/src/assets/images/food_artisan_pizza_1794463049962.jpg',
    isAvailable: true,
    preparationTimeMinutes: 16,
  },
  {
    id: 'menu-7',
    name: 'Spiced Serengeti Beef Skewers',
    category: 'Grill & Poultry',
    price: 14000,
    description: 'Tender prime beef mishkaki glazed in ginger-tamarind reduction with grilled bell peppers.',
    image: '/src/assets/images/food_roasted_chicken_1794463050346.jpg',
    isAvailable: true,
    preparationTimeMinutes: 15,
  },
  {
    id: 'menu-8',
    name: 'Zanzibar Spiced Coconut Flan',
    category: 'Desserts',
    price: 7000,
    description: 'Velvety coconut cream custard infused with Madagascar vanilla and burnt sugarcane caramel.',
    image: '/src/assets/images/food_fresh_beverage_1794463051379.jpg',
    isAvailable: true,
    preparationTimeMinutes: 6,
  },
];

export const INITIAL_ORDERS: TableOrder[] = [
  {
    orderId: 'FDM-1041',
    tableNumber: 'Table No. 1', // Exact table from SRS §3.2
    waiterId: 'waiter-1',
    waiterName: 'Sarah Kibwana',
    customers: [
      {
        customerId: 'cust-1',
        customerName: 'Fredy', // Exact customer from SRS §3.2
        items: [
          {
            id: 'item-101',
            menuItemId: 'menu-1',
            name: 'Artisan Wood-Fired Pizza',
            price: 19000,
            quantity: 1,
            status: 'preparing',
          },
          {
            id: 'item-102',
            menuItemId: 'menu-2',
            name: 'Golden Roasted Herb Chicken',
            price: 10000,
            quantity: 1,
            status: 'preparing',
          },
        ],
        individualTotal: 29000, // TSH 29,000 as in SRS §3.2
      },
      {
        customerId: 'cust-2',
        customerName: 'Musa', // Exact customer from SRS §3.2
        items: [
          {
            id: 'item-103',
            menuItemId: 'menu-4',
            name: 'Fragrant Pilau Rice',
            price: 5000,
            quantity: 1,
            status: 'preparing',
          },
          {
            id: 'item-104',
            menuItemId: 'menu-3',
            name: 'Grilled Lake Fish Fillet',
            price: 10000,
            quantity: 1,
            status: 'preparing',
          },
        ],
        individualTotal: 15000, // TSH 15,000 as in SRS §3.2
      },
      {
        customerId: 'cust-3',
        customerName: 'Anthony', // Exact customer from SRS §3.2
        items: [
          {
            id: 'item-105',
            menuItemId: 'menu-5',
            name: 'Tropical Passion & Mint Cooler',
            price: 6000,
            quantity: 1,
            status: 'ready',
          },
          {
            id: 'item-106',
            menuItemId: 'menu-2',
            name: 'Golden Roasted Herb Chicken',
            price: 10000,
            quantity: 1,
            status: 'pending',
          },
        ],
        individualTotal: 16000,
      },
    ],
    overallTableTotal: 60000, // Real-time calculated overall table total
    status: 'preparing',
    submittedAt: new Date(Date.now() - 14 * 60 * 1000).toISOString(),
    paymentStatus: 'unpaid',
  },
  {
    orderId: 'FDM-1042',
    tableNumber: 'Table No. 3',
    waiterId: 'waiter-2',
    waiterName: 'Juma Mwinyi',
    customers: [
      {
        customerId: 'cust-4',
        customerName: 'Grace',
        items: [
          {
            id: 'item-107',
            menuItemId: 'menu-6',
            name: 'Quattro Formaggi Bianca Pizza',
            price: 21000,
            quantity: 1,
            status: 'pending',
          },
          {
            id: 'item-108',
            menuItemId: 'menu-5',
            name: 'Tropical Passion & Mint Cooler',
            price: 6000,
            quantity: 1,
            status: 'pending',
          },
        ],
        individualTotal: 27000,
      },
    ],
    overallTableTotal: 27000,
    status: 'submitted',
    submittedAt: new Date(Date.now() - 3 * 60 * 1000).toISOString(),
    paymentStatus: 'unpaid',
    lastNotification: {
      type: 'new_order',
      message: 'New order submitted for Table No. 3',
      timestamp: new Date().toISOString(),
    },
  },
];

export const INITIAL_HISTORICAL_SALES = [
  {
    orderId: 'FDM-1038',
    tableNumber: 'Table No. 2',
    waiterName: 'Sarah Kibwana',
    timestamp: new Date(Date.now() - 3 * 3600 * 1000).toISOString(),
    customers: [
      {
        name: 'David',
        total: 29000,
        items: [{ name: 'Artisan Wood-Fired Pizza', quantity: 1, price: 19000 }, { name: 'Golden Roasted Herb Chicken', quantity: 1, price: 10000 }],
      },
    ],
    totalAmount: 29000,
    status: 'completed' as const,
  },
  {
    orderId: 'FDM-1039',
    tableNumber: 'VIP Lounge',
    waiterName: 'Juma Mwinyi',
    timestamp: new Date(Date.now() - 5 * 3600 * 1000).toISOString(),
    customers: [
      {
        name: 'Minister Alawi',
        total: 58000,
        items: [
          { name: 'Artisan Wood-Fired Pizza', quantity: 2, price: 19000 },
          { name: 'Grilled Lake Fish Fillet', quantity: 1, price: 10000 },
          { name: 'Tropical Passion & Mint Cooler', quantity: 2, price: 6000 },
        ],
      },
    ],
    totalAmount: 58000,
    status: 'completed' as const,
  },
  {
    orderId: 'FDM-1040',
    tableNumber: 'Table No. 4',
    waiterName: 'Sarah Kibwana',
    timestamp: new Date(Date.now() - 8 * 3600 * 1000).toISOString(),
    customers: [
      {
        name: 'Khadija',
        total: 15000,
        items: [{ name: 'Fragrant Pilau Rice', quantity: 1, price: 5000 }, { name: 'Grilled Lake Fish Fillet', quantity: 1, price: 10000 }],
      },
    ],
    totalAmount: 15000,
    status: 'completed' as const,
  },
];

export const INITIAL_AUDIT_LOGS: AuditLogEntry[] = [
  {
    id: 'audit-001',
    timestamp: new Date(Date.now() - 24 * 3600 * 1000).toISOString(),
    adminName: 'Owner / Chief Executive',
    action: 'PRICE_UPDATE',
    target: 'Artisan Wood-Fired Pizza (menu-1)',
    previousValue: 'TSH 18,000',
    newValue: 'TSH 19,000',
    reason: 'Organic flour import price adjustment per supplier Q4 rate sheet.',
  },
  {
    id: 'audit-002',
    timestamp: new Date(Date.now() - 12 * 3600 * 1000).toISOString(),
    adminName: 'Owner / Chief Executive',
    action: 'ORDER_MODIFICATION',
    target: 'Order FDM-1036 (Table No. 5)',
    previousValue: 'Table Total TSH 45,000',
    newValue: 'Table Total TSH 35,000',
    reason: 'Complimentary discount approved for delayed banquet starter.',
  },
];

export const INITIAL_TEAM_MEMBERS: TeamMember[] = [
  {
    id: 'team-1',
    name: 'David Tarimo',
    role: 'General Manager (Remote HQ)',
    status: 'online',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=80',
    recentActivity: 'Reviewed Q4 Food Cost margin dashboard',
  },
  {
    id: 'team-2',
    name: 'Chef Juma Mussa',
    role: 'Executive Kitchen Chef',
    status: 'online',
    avatar: 'https://images.unsplash.com/photo-1577219491135-ce391730fb2c?w=120&auto=format&fit=crop&q=80',
    recentActivity: 'Managing real-time KDS line stations',
  },
  {
    id: 'team-3',
    name: 'Sarah Kibwana',
    role: 'Head Floor Captain / Waiter',
    status: 'online',
    avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=120&auto=format&fit=crop&q=80',
    recentActivity: 'Taking Table 1 orders on tablet',
  },
  {
    id: 'team-4',
    name: 'Amina Selemani',
    role: 'Beverage & Bar Director',
    status: 'busy',
    avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=120&auto=format&fit=crop&q=80',
    recentActivity: 'Restocking tropical fruit purees',
  },
];

export const INITIAL_PROJECT_TASKS: ProjectTask[] = [
  {
    id: 'task-1',
    title: 'Deploy Tablet-Based FDM Waiter Units to Floor Captains',
    description: 'Mount and configure 6 handheld Android/iOS tablets with high-sensitivity touch screens and instant KDS sync.',
    category: 'Floor & Service',
    status: 'in_progress',
    priority: 'high',
    assignee: {
      id: 'team-3',
      name: 'Sarah Kibwana',
      role: 'Head Floor Captain',
      avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=120&auto=format&fit=crop&q=80',
    },
    dueDate: '2026-11-14',
    tags: ['Hardware', 'Tablets', 'Waiter'],
    comments: [
      {
        id: 'c-1',
        author: 'David Tarimo',
        avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=80',
        text: 'All 6 Samsung Galaxy Active tablets are tested with zero-latency local Wi-Fi.',
        timestamp: '2 hours ago',
      },
    ],
  },
  {
    id: 'task-2',
    title: 'KDS Expediter Display Sound Alerts & Chime Calibration',
    description: 'Ensure kitchen display audio chiming fires whenever a new ticket arrives or item cancellation is requested.',
    category: 'Kitchen Operations',
    status: 'done',
    priority: 'urgent',
    assignee: {
      id: 'team-2',
      name: 'Chef Juma Mussa',
      role: 'Executive Chef',
      avatar: 'https://images.unsplash.com/photo-1577219491135-ce391730fb2c?w=120&auto=format&fit=crop&q=80',
    },
    dueDate: '2026-11-12',
    tags: ['KDS', 'Audio', 'Kitchen'],
    comments: [],
  },
  {
    id: 'task-3',
    title: 'Establish Strict Cancellation Protocol Before Food Prep',
    description: 'As defined in SRS §3.4: customers can cancel items prior to preparation; once in preparation, lock item unless approved.',
    category: 'Compliance & Audit',
    status: 'in_progress',
    priority: 'urgent',
    assignee: {
      id: 'team-1',
      name: 'David Tarimo',
      role: 'General Manager',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=80',
    },
    dueDate: '2026-11-13',
    tags: ['SRS-3.4', 'Cancellation', 'Workflow'],
    comments: [],
  },
  {
    id: 'task-4',
    title: 'Direct Farm-to-Table Tilapia & Sea Bass Sourcing Agreement',
    description: 'Finalize direct contract with Lake Victoria fresh fish cooperative to maintain TSH 10,000 menu price point.',
    category: 'Inventory & Sourcing',
    status: 'review',
    priority: 'medium',
    assignee: {
      id: 'team-1',
      name: 'David Tarimo',
      role: 'General Manager',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=80',
    },
    dueDate: '2026-11-18',
    tags: ['Supply Chain', 'Fish', 'Pricing'],
    comments: [],
  },
  {
    id: 'task-5',
    title: 'Weekend VIP Lounge Tasting Menu & Pairing Launch',
    description: 'Develop five signature mocktails and pairing notes with executive chef for the terrace lounge.',
    category: 'Menu R&D',
    status: 'todo',
    priority: 'medium',
    assignee: {
      id: 'team-4',
      name: 'Amina Selemani',
      role: 'Beverage Director',
      avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=120&auto=format&fit=crop&q=80',
    },
    dueDate: '2026-11-20',
    tags: ['Beverages', 'VIP', 'Cocktails'],
    comments: [],
  },
];
