// src/components/common/Sidebar.jsx
import { NavLink } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth.js";
import { useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import {
  FaHome,
  FaFileAlt,
  FaUndoAlt,
  FaStore,
  FaUsers,
  FaMoneyBillWave,
  FaBox,
  FaExclamationTriangle,
  FaTruck,
  FaHistory,
  FaChartLine,
  FaShoppingCart,
  FaReceipt,
  FaHistory as FaReturnHistory,
} from "react-icons/fa";
import { returnApi } from "../../api/returnApi.js";
import { adminApi } from "../../api/adminApi.js";

const linkBase = "block px-3 py-2 rounded-md font-medium transition";

const linkClass = ({ isActive }) =>
  `${linkBase} ${
    isActive ? "bg-blue-600 text-white" : "text-blue-700 hover:bg-blue-50"
  }`;

export const Sidebar = () => {
  const { user } = useAuth();

  // Pending returns count (admin only)
  const [pendingCount, setPendingCount] = useState(0);
  const [lastNotifiedCount, setLastNotifiedCount] = useState(0);

  // Stock alert count (admin only)
  const [alertCount, setAlertCount] = useState(0);

  const isAdmin = user?.role === "admin";
  const isSuperAdmin = user?.role === "super-admin";
  const isShop = user?.role === "shop";

  useEffect(() => {
    if (!isAdmin) return;

    let timer;

    const fetchPending = async () => {
      try {
        const res = await returnApi.getPendingCount();
        const count = res.data?.data?.count ?? 0;

        setPendingCount(count);

        // Optional toast when new return comes
        if (count > lastNotifiedCount) {
          const diff = count - lastNotifiedCount;
          toast.success(
            diff === 1
              ? "New return request received!"
              : `${diff} new return requests received!`
          );
          setLastNotifiedCount(count);
        }

        // initialize lastNotifiedCount on first successful fetch
        if (lastNotifiedCount === 0 && count > 0) {
          setLastNotifiedCount(count);
        }
      } catch (e) {
        // silent fail to avoid annoying user
      }
    };

    fetchPending();
    timer = setInterval(fetchPending, 15000); // every 15 sec

    return () => clearInterval(timer);
  }, [isAdmin, lastNotifiedCount]);

  // Fetch stock alert count
  useEffect(() => {
    if (!isAdmin) return;

    let timer;

    const fetchStockAlerts = async () => {
      try {
        const res = await adminApi.getAlertCount();
        const count = res.data?.data?.criticalCount ?? 0;
        setAlertCount(count);
      } catch (e) {
        // silent fail
      }
    };

    fetchStockAlerts();
    timer = setInterval(fetchStockAlerts, 30000); // every 30 sec

    return () => clearInterval(timer);
  }, [isAdmin]);

  return (
    <aside className="bg-white w-64 border-r min-h-screen p-4">
      <h2 className="text-lg font-bold mb-4 text-gray-900">Menu</h2>

      {isSuperAdmin && (
        <div className="space-y-2">
          <NavLink to="/super-admin/dashboard" className={linkClass}>
            <div className="flex items-center gap-3">
              <FaHome className="w-4 h-4" />
              <span>Dashboard</span>
            </div>
          </NavLink>
          <hr className="my-3" />
        </div>
      )}

      {isAdmin && (
        <div className="space-y-2">
          <NavLink to="/admin/dashboard" className={linkClass}>
            <div className="flex items-center gap-3">
              <FaHome className="w-4 h-4" />
              <span>Dashboard</span>
            </div>
          </NavLink>

          <NavLink to="/admin/reports" className={linkClass}>
            <div className="flex items-center gap-3">
              <FaFileAlt className="w-4 h-4" />
              <span>Reports</span>
            </div>
          </NavLink>

          {/* Returns with badge */}
          <NavLink to="/admin/returns" className={linkClass}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <FaUndoAlt className="w-4 h-4" />
                <span>Returns</span>
              </div>

              {pendingCount > 0 && (
                <span className="ml-2 inline-flex items-center justify-center px-2 py-0.5 text-xs font-bold rounded-full bg-red-600 text-white">
                  {pendingCount}
                </span>
              )}
            </div>
          </NavLink>

          <NavLink to="/admin/shops" className={linkClass}>
            <div className="flex items-center gap-3">
              <FaStore className="w-4 h-4" />
              <span>Shop Management</span>
            </div>
          </NavLink>

          <NavLink to="/admin/products" className={linkClass}>
            <div className="flex items-center gap-3">
              <FaBox className="w-4 h-4" />
              <span>Products</span>
            </div>
          </NavLink>

          <NavLink to="/admin/staff" className={linkClass}>
            <div className="flex items-center gap-3">
              <FaUsers className="w-4 h-4" />
              <span>Staff Management</span>
            </div>
          </NavLink>

          <NavLink to="/admin/staff-payment" className={linkClass}>
            <div className="flex items-center gap-3">
              <FaMoneyBillWave className="w-4 h-4" />
              <span>Staff Payments</span>
            </div>
          </NavLink>

          <hr className="my-3" />

          <NavLink to="/admin/shop-ledger" className={linkClass}>
            <div className="flex items-center gap-3">
              <FaReceipt className="w-4 h-4" />
              <span>Shop Ledger & Inventory</span>
            </div>
          </NavLink>

          <NavLink to="/admin/stock-alerts" className={linkClass}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <FaExclamationTriangle className="w-4 h-4" />
                <span>Stock Alerts</span>
              </div>

              {alertCount > 0 && (
                <span className="ml-2 inline-flex items-center justify-center px-2 py-0.5 text-xs font-bold rounded-full bg-red-600 text-white">
                  {alertCount}
                </span>
              )}
            </div>
          </NavLink>

          <NavLink to="/admin/dispatch" className={linkClass}>
            <div className="flex items-center gap-3">
              <FaTruck className="w-4 h-4" />
              <span>Dispatch</span>
            </div>
          </NavLink>

          <NavLink to="/admin/dispatch-history" className={linkClass}>
            <div className="flex items-center gap-3">
              <FaHistory className="w-4 h-4" />
              <span>Dispatch History</span>
            </div>
          </NavLink>

          <NavLink to="/admin/dispatch-analytics" className={linkClass}>
            <div className="flex items-center gap-3">
              <FaChartLine className="w-4 h-4" />
              <span>Dispatch Analytics</span>
            </div>
          </NavLink>
        </div>
      )}

      {isShop && (
        <div className="space-y-2">
          <NavLink to="/shop/dashboard" className={linkClass}>
            <div className="flex items-center gap-3">
              <FaHome className="w-4 h-4" />
              <span>Dashboard</span>
            </div>
          </NavLink>

          <NavLink to="/shop/inventory" className={linkClass}>
            <div className="flex items-center gap-3">
              <FaBox className="w-4 h-4" />
              <span>Inventory</span>
            </div>
          </NavLink>

          <NavLink to="/shop/pos" className={linkClass}>
            <div className="flex items-center gap-3">
              <FaShoppingCart className="w-4 h-4" />
              <span>POS Billing</span>
            </div>
          </NavLink>

          <NavLink to="/shop/sales" className={linkClass}>
            <div className="flex items-center gap-3">
              <FaReceipt className="w-4 h-4" />
              <span>Sales History</span>
            </div>
          </NavLink>

          <NavLink to="/shop/dispatch" className={linkClass}>
            <div className="flex items-center gap-3">
              <FaTruck className="w-4 h-4" />
              <span>Dispatch Confirmation</span>
            </div>
          </NavLink>

          <NavLink to="/shop/returns" className={linkClass}>
            <div className="flex items-center gap-3">
              <FaUndoAlt className="w-4 h-4" />
              <span>Returns</span>
            </div>
          </NavLink>

          <hr className="my-3" />

          <NavLink to="/shop/staff" className={linkClass}>
            <div className="flex items-center gap-3">
              <FaUsers className="w-4 h-4" />
              <span>Our Staff</span>
            </div>
          </NavLink>

          <NavLink to="/shop/payment" className={linkClass}>
            <div className="flex items-center gap-3">
              <FaMoneyBillWave className="w-4 h-4" />
              <span>Staff Payments</span>
            </div>
          </NavLink>
        </div>
      )}
    </aside>
  );
};