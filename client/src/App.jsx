import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import { AuthProvider } from "./context/AuthContext.jsx";

// Auth Pages
import { Login } from "./pages/auth/Login.jsx";
import { Register } from "./pages/auth/Register.jsx";

// Admin Pages
import { AdminDashboard } from "./pages/admin/AdminDashboard.jsx";
import { SuperAdminDashboard } from "./pages/admin/SuperAdminDashboard.jsx";
import Landing from "./pages/Landing.jsx";

import { BatchDispatch } from "./pages/admin/BatchDispatch.jsx";
import { DispatchHistory } from "./pages/admin/DispatchHistory.jsx";
import { DispatchAnalytics } from "./pages/admin/DispatchAnalytics.jsx";
import { AdminLogs } from "./pages/admin/AdminLogs.jsx";
import { Reports } from "./pages/admin/Reports.jsx";

import { Staff } from "./pages/admin/Staff.jsx";
import { StaffPayment } from "./pages/admin/StaffPayment.jsx";
import { Returns as AdminReturns } from "./pages/admin/Returns.jsx";
import { Shops } from "./pages/admin/Shops.jsx";
import { ShopLedger } from "./pages/admin/ShopLedger.jsx";
import { StockAlerts } from "./pages/admin/StockAlerts.jsx";
import { Products } from "./pages/admin/Products.jsx";
import { CreateProduct } from "./pages/admin/CreateProduct.jsx";
import { ProductDetail } from "./pages/admin/ProductDetail.jsx";

// Shop Pages
import { ShopDashboard } from "./pages/shop/ShopDashboard.jsx";
import { Inventory } from "./pages/shop/Inventory.jsx";
import { POS } from "./pages/shop/POS.jsx";
import { SalesHistory } from "./pages/shop/SalesHistory.jsx";
import { Returns } from "./pages/shop/Returns.jsx";
import { ShopStaff } from "./pages/shop/Staff.jsx";
import { ShopPayment } from "./pages/shop/Payment.jsx";
import { DispatchConfirmation } from "./pages/shop/DispatchConfirmation.jsx";

// Components / Layouts
import { ProtectedRoute } from "./components/common/ProtectedRoute.jsx";
import { AdminLayout } from "./layouts/AdminLayout.jsx";
import { ShopLayout } from "./layouts/ShopLayout.jsx";

import "./index.css";

function App() {
  return (
    <AuthProvider>
      <Router future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
        {/* Global Toast Notifications */}
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 3000,
            style: {
              fontSize: "14px",
            },
          }}
        />

        <Routes>
  {/* Public Landing */}
          <Route path="/" element={<Landing />} />


          {/* Auth */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* Super Admin */}
          <Route
            path="/super-admin/dashboard"
            element={
              <ProtectedRoute allowedRoles={["super-admin"]}>
                <AdminLayout>
                  <SuperAdminDashboard />
                </AdminLayout>
              </ProtectedRoute>
            }
          />

          {/* Admin */}
          <Route
            path="/admin/dashboard"
            element={
              <ProtectedRoute allowedRoles={["admin"]}>
                <AdminLayout>
                  <AdminDashboard />
                </AdminLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/dispatch"
            element={
              <ProtectedRoute allowedRoles={["admin"]}>
                <AdminLayout>
                  <BatchDispatch />
                </AdminLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/dispatch-history"
            element={
              <ProtectedRoute allowedRoles={["admin"]}>
                <AdminLayout>
                  <DispatchHistory />
                </AdminLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/dispatch-analytics"
            element={
              <ProtectedRoute allowedRoles={["admin"]}>
                <AdminLayout>
                  <DispatchAnalytics />
                </AdminLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/logs"
            element={
              <ProtectedRoute allowedRoles={["admin"]}>
                <AdminLayout>
                  <AdminLogs />
                </AdminLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/reports"
            element={
              <ProtectedRoute allowedRoles={["admin"]}>
                <AdminLayout>
                  <Reports />
                </AdminLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/staff"
            element={
              <ProtectedRoute allowedRoles={["admin"]}>
                <AdminLayout>
                  <Staff />
                </AdminLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/staff-payment"
            element={
              <ProtectedRoute allowedRoles={["admin"]}>
                <AdminLayout>
                  <StaffPayment />
                </AdminLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/returns"
            element={
              <ProtectedRoute allowedRoles={["admin"]}>
                <AdminLayout>
                  <AdminReturns />
                </AdminLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/shops"
            element={
              <ProtectedRoute allowedRoles={["admin"]}>
                <AdminLayout>
                  <Shops />
                </AdminLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/shop-ledger"
            element={
              <ProtectedRoute allowedRoles={["admin"]}>
                <AdminLayout>
                  <ShopLedger />
                </AdminLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/stock-alerts"
            element={
              <ProtectedRoute allowedRoles={["admin"]}>
                <AdminLayout>
                  <StockAlerts />
                </AdminLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/products"
            element={
              <ProtectedRoute allowedRoles={["admin"]}>
                <AdminLayout>
                  <Products />
                </AdminLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/products/create"
            element={
              <ProtectedRoute allowedRoles={["admin"]}>
                <AdminLayout>
                  <CreateProduct />
                </AdminLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/products/:productId"
            element={
              <ProtectedRoute allowedRoles={["admin"]}>
                <AdminLayout>
                  <ProductDetail />
                </AdminLayout>
              </ProtectedRoute>
            }
          />

          {/* Shop */}
          <Route
            path="/shop/dashboard"
            element={
              <ProtectedRoute allowedRoles={["shop"]}>
                <ShopLayout>
                  <ShopDashboard />
                </ShopLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/shop/inventory"
            element={
              <ProtectedRoute allowedRoles={["shop"]}>
                <ShopLayout>
                  <Inventory />
                </ShopLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/shop/pos"
            element={
              <ProtectedRoute allowedRoles={["shop"]}>
                <ShopLayout>
                  <POS />
                </ShopLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/shop/sales"
            element={
              <ProtectedRoute allowedRoles={["shop"]}>
                <ShopLayout>
                  <SalesHistory />
                </ShopLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/shop/returns"
            element={
              <ProtectedRoute allowedRoles={["shop"]}>
                <ShopLayout>
                  <Returns />
                </ShopLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/shop/staff"
            element={
              <ProtectedRoute allowedRoles={["shop"]}>
                <ShopLayout>
                  <ShopStaff />
                </ShopLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/shop/payment"
            element={
              <ProtectedRoute allowedRoles={["shop"]}>
                <ShopLayout>
                  <ShopPayment />
                </ShopLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/shop/dispatch"
            element={
              <ProtectedRoute allowedRoles={["shop"]}>
                <ShopLayout>
                  <DispatchConfirmation />
                </ShopLayout>
              </ProtectedRoute>
            }
          />

          <Route
          path="/unauthorized"
          element={
          <div className="min-h-screen flex items-center justify-center bg-gray-50 p-6">
            <div className="bg-white border rounded-xl p-8 text-center max-w-md w-full">
              <h2 className="text-xl font-bold mb-2">Unauthorized</h2>
              <p className="text-gray-600 mb-4">You don’t have access to this page.</p>
              <button
              onClick={() => window.history.back()}
              className="px-4 py-2 rounded-md bg-blue-600 text-white hover:bg-blue-700"
              >
                Go Back
                </button>
                </div>
                </div>
              }
              />
          
          {/* 404 */}
          <Route
            path="*"
            element={<div className="p-6 text-center">404 - Page Not Found</div>}
          />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;