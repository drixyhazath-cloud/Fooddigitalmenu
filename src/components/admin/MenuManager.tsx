import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { MenuItem, MenuCategory } from '../../types';
import {
  Plus,
  Trash2,
  ShieldCheck,
  DollarSign,
} from 'lucide-react';

const CATEGORIES: Exclude<MenuCategory, 'All'>[] = [
  'Pizza & Italian',
  'Grill & Poultry',
  'Seafood & Rice',
  'Beverages',
  'Desserts',
];

export const MenuManager: React.FC = () => {
  const { menuItems, addMenuItem, updateMenuItem, deleteMenuItem, updateItemPrice } = useApp();

  const [isAdding, setIsAdding] = useState(false);
  const [priceModalItem, setPriceModalItem] = useState<MenuItem | null>(null);
  const [newPrice, setNewPrice] = useState<number>(0);
  const [auditReason, setAuditReason] = useState<string>('');
  const [notice, setNotice] = useState<string | null>(null);

  // Form for New Item
  const [newItem, setNewItem] = useState({
    name: '',
    category: 'Pizza & Italian' as Exclude<MenuCategory, 'All'>,
    price: 15000,
    description: '',
    image: '/src/assets/images/food_artisan_pizza_1794463049962.jpg',
    isAvailable: true,
    preparationTimeMinutes: 15,
  });

  const handleSaveNewItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newItem.name || !auditReason) {
      alert('Please provide an item name and an audit reason for the change.');
      return;
    }
    addMenuItem(newItem, auditReason);
    setIsAdding(false);
    setAuditReason('');
    setNotice(`Added "${newItem.name}" to menu catalog.`);
    setTimeout(() => setNotice(null), 3000);
  };

  const handleUpdatePrice = () => {
    if (!priceModalItem || newPrice <= 0 || !auditReason) {
      alert('Please provide a valid price (> 0) and an administrative reason for the audit log.');
      return;
    }
    updateItemPrice(priceModalItem.id, newPrice, auditReason);
    setPriceModalItem(null);
    setAuditReason('');
    setNotice(`Updated price for "${priceModalItem.name}" to TSH ${newPrice.toLocaleString()}`);
    setTimeout(() => setNotice(null), 3000);
  };

  const handleDelete = (item: MenuItem) => {
    const reason = prompt(`Enter reason for deleting "${item.name}" (Required for Audit Trail §2.4):`);
    if (reason && reason.trim()) {
      deleteMenuItem(item.id, reason);
      setNotice(`Deleted "${item.name}" from catalog.`);
      setTimeout(() => setNotice(null), 3000);
    }
  };

  return (
    <div className="flex-1 flex flex-col min-h-[calc(100vh-61px)] bg-neutral-50 dark:bg-neutral-950 text-neutral-900 dark:text-neutral-100 p-4 sm:p-6 lg:p-8 space-y-6 transition-colors">
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-neutral-200 dark:border-neutral-800 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold text-neutral-900 dark:text-white">Menu & Pricing Management</h2>
            <span className="text-xs px-2 py-0.5 rounded bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-500/20 font-medium flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5" /> SRS §2.3 Admin Authority
            </span>
          </div>
          <p className="text-xs text-neutral-600 dark:text-neutral-400 mt-1">
            Update menu items, food/beverage prices in Tanzanian Shillings (TSH), item photos, and descriptions.
          </p>
        </div>

        <button
          onClick={() => setIsAdding(true)}
          className="flex items-center gap-2 px-4 py-2 text-xs font-semibold bg-amber-500 hover:bg-amber-400 text-neutral-950 rounded-lg shadow-xs transition-colors"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Menu Item</span>
        </button>
      </div>

      {notice && (
        <div className="p-3 bg-emerald-50 dark:bg-emerald-950/80 border border-emerald-200 dark:border-emerald-800 rounded-lg text-xs font-medium text-emerald-800 dark:text-emerald-300">
          {notice}
        </div>
      )}

      {/* Menu Catalog Table / Grid */}
      <div className="bg-white dark:bg-neutral-900 rounded-xl border border-neutral-200 dark:border-neutral-800 overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-neutral-100/70 dark:bg-neutral-950 text-neutral-600 dark:text-neutral-400 uppercase tracking-wider font-semibold border-b border-neutral-200 dark:border-neutral-800">
              <tr>
                <th className="px-4 py-3">Photo</th>
                <th className="px-4 py-3">Item Details</th>
                <th className="px-4 py-3">Category</th>
                <th className="px-4 py-3 text-right">Price (TSH)</th>
                <th className="px-4 py-3 text-center">Status</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-200 dark:divide-neutral-800">
              {menuItems.map((item) => (
                <tr key={item.id} className="hover:bg-neutral-50 dark:hover:bg-neutral-800/40 transition-colors">
                  <td className="px-4 py-3 w-16">
                    <img
                      src={item.image}
                      alt={item.name}
                      referrerPolicy="no-referrer"
                      className="w-12 h-12 object-cover rounded-lg border border-neutral-200 dark:border-neutral-800"
                    />
                  </td>
                  <td className="px-4 py-3 max-w-xs">
                    <span className="font-bold text-neutral-900 dark:text-white text-sm block">{item.name}</span>
                    <span className="text-[11px] text-neutral-500 dark:text-neutral-400 line-clamp-1 mt-0.5">{item.description}</span>
                  </td>
                  <td className="px-4 py-3 text-neutral-700 dark:text-neutral-300">{item.category}</td>
                  <td className="px-4 py-3 text-right font-mono font-bold text-amber-600 dark:text-amber-400 tabular-nums text-sm">
                    TSH {item.price.toLocaleString()}
                  </td>
                  <td className="px-4 py-3 text-center">
                    <button
                      onClick={() =>
                        updateMenuItem(
                          item.id,
                          { isAvailable: !item.isAvailable },
                          `Toggled availability to ${!item.isAvailable ? 'In Stock' : 'Out of Stock'}`
                        )
                      }
                      className={`px-2.5 py-1 rounded text-[10px] font-semibold uppercase tracking-wider ${
                        item.isAvailable
                          ? 'bg-emerald-500/20 text-emerald-700 dark:text-emerald-400 hover:bg-emerald-500/30'
                          : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-500 hover:bg-neutral-200 dark:hover:bg-neutral-700'
                      }`}
                    >
                      {item.isAvailable ? 'In Stock' : 'Unavailable'}
                    </button>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <button
                        onClick={() => {
                          setPriceModalItem(item);
                          setNewPrice(item.price);
                          setAuditReason('Seasonal cost adjustment');
                        }}
                        title="Update Price"
                        className="p-1.5 rounded bg-neutral-100 hover:bg-neutral-200 dark:bg-neutral-800 dark:hover:bg-neutral-700 text-amber-600 dark:text-amber-400 transition-colors"
                      >
                        <DollarSign className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDelete(item)}
                        title="Remove Item (Traceable in Audit Log)"
                        className="p-1.5 rounded bg-neutral-100 hover:bg-neutral-200 dark:bg-neutral-800 dark:hover:bg-neutral-700 text-rose-600 dark:text-rose-400 transition-colors"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Item Modal */}
      {isAdding && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm">
          <form
            onSubmit={handleSaveNewItem}
            className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl p-5 max-w-lg w-full shadow-2xl space-y-4"
          >
            <h3 className="text-base font-bold text-neutral-900 dark:text-white">Add New Food / Beverage Item</h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-[11px] text-neutral-600 dark:text-neutral-400 block mb-1">Item Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Swahili Coconut Fish Curry"
                  value={newItem.name}
                  onChange={(e) => setNewItem({ ...newItem, name: e.target.value })}
                  className="w-full bg-neutral-50 dark:bg-neutral-950 border border-neutral-300 dark:border-neutral-700 rounded-lg px-3 py-2 text-xs text-neutral-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-amber-500"
                />
              </div>

              <div>
                <label className="text-[11px] text-neutral-600 dark:text-neutral-400 block mb-1">Category</label>
                <select
                  value={newItem.category}
                  onChange={(e) => setNewItem({ ...newItem, category: e.target.value as any })}
                  className="w-full bg-neutral-50 dark:bg-neutral-950 border border-neutral-300 dark:border-neutral-700 rounded-lg px-3 py-2 text-xs text-neutral-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-amber-500"
                >
                  {CATEGORIES.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-[11px] text-neutral-600 dark:text-neutral-400 block mb-1">Price (TSH)</label>
                <input
                  type="number"
                  required
                  min="500"
                  step="500"
                  value={newItem.price}
                  onChange={(e) => setNewItem({ ...newItem, price: parseInt(e.target.value) || 0 })}
                  className="w-full bg-neutral-50 dark:bg-neutral-950 border border-neutral-300 dark:border-neutral-700 rounded-lg px-3 py-2 text-xs text-amber-600 dark:text-amber-400 font-mono font-semibold focus:outline-none focus:ring-1 focus:ring-amber-500"
                />
              </div>

              <div>
                <label className="text-[11px] text-neutral-600 dark:text-neutral-400 block mb-1">Image Asset</label>
                <select
                  value={newItem.image}
                  onChange={(e) => setNewItem({ ...newItem, image: e.target.value })}
                  className="w-full bg-neutral-50 dark:bg-neutral-950 border border-neutral-300 dark:border-neutral-700 rounded-lg px-3 py-2 text-xs text-neutral-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-amber-500"
                >
                  <option value="/src/assets/images/food_artisan_pizza_1794463049962.jpg">Artisan Pizza</option>
                  <option value="/src/assets/images/food_roasted_chicken_1794463050346.jpg">Herb Roasted Chicken</option>
                  <option value="/src/assets/images/food_fish_rice_1794463052023.jpg">Grilled Fish & Pilau</option>
                  <option value="/src/assets/images/food_fresh_beverage_1794463051379.jpg">Tropical Beverage Cooler</option>
                </select>
              </div>
            </div>

            <div>
              <label className="text-[11px] text-neutral-600 dark:text-neutral-400 block mb-1">Description</label>
              <textarea
                rows={2}
                value={newItem.description}
                onChange={(e) => setNewItem({ ...newItem, description: e.target.value })}
                placeholder="Delicious ingredients, culinary style, preparation notes..."
                className="w-full bg-neutral-50 dark:bg-neutral-950 border border-neutral-300 dark:border-neutral-700 rounded-lg px-3 py-2 text-xs text-neutral-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-amber-500"
              />
            </div>

            <div>
              <label className="text-[11px] text-neutral-600 dark:text-neutral-400 block mb-1">
                Reason for addition (Mandatory for Audit Log §2.4):
              </label>
              <input
                type="text"
                required
                value={auditReason}
                onChange={(e) => setAuditReason(e.target.value)}
                placeholder="e.g. Approved seasonal menu expansion"
                className="w-full bg-neutral-50 dark:bg-neutral-950 border border-neutral-300 dark:border-neutral-700 rounded-lg px-3 py-2 text-xs text-neutral-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-amber-500"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-neutral-200 dark:border-neutral-800">
              <button
                type="button"
                onClick={() => setIsAdding(false)}
                className="px-3 py-1.5 text-xs text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 text-xs font-semibold bg-amber-500 text-neutral-950 rounded-lg hover:bg-amber-400"
              >
                Save Menu Item
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Update Price Modal (§2.3 & §2.4) */}
      {priceModalItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm">
          <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl p-5 max-w-sm w-full shadow-2xl space-y-4">
            <h3 className="text-sm font-bold text-neutral-900 dark:text-white">Update Price: {priceModalItem.name}</h3>
            <p className="text-xs text-neutral-600 dark:text-neutral-400">
              Current price: <strong className="text-neutral-900 dark:text-white font-mono">TSH {priceModalItem.price.toLocaleString()}</strong>.
              All price changes are logged to the permanent audit trail.
            </p>

            <div>
              <label className="text-[11px] text-neutral-600 dark:text-neutral-400 block mb-1">New Price (TSH):</label>
              <input
                type="number"
                min="500"
                step="500"
                value={newPrice}
                onChange={(e) => setNewPrice(parseInt(e.target.value) || 0)}
                className="w-full bg-neutral-50 dark:bg-neutral-950 border border-neutral-300 dark:border-neutral-700 rounded-lg px-3 py-2 text-xs text-amber-600 dark:text-amber-400 font-mono font-bold focus:outline-none focus:ring-1 focus:ring-amber-500"
              />
            </div>

            <div>
              <label className="text-[11px] text-neutral-600 dark:text-neutral-400 block mb-1">Reason for Adjustment (§2.4):</label>
              <input
                type="text"
                value={auditReason}
                onChange={(e) => setAuditReason(e.target.value)}
                placeholder="e.g. Raw ingredient price change"
                className="w-full bg-neutral-50 dark:bg-neutral-950 border border-neutral-300 dark:border-neutral-700 rounded-lg px-3 py-2 text-xs text-neutral-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-amber-500"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-neutral-200 dark:border-neutral-800">
              <button
                onClick={() => setPriceModalItem(null)}
                className="px-3 py-1.5 text-xs text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white"
              >
                Cancel
              </button>
              <button
                onClick={handleUpdatePrice}
                className="px-4 py-2 text-xs font-semibold bg-amber-500 text-neutral-950 rounded-lg hover:bg-amber-400"
              >
                Commit Price Change
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
