import { Link } from "react-router-dom";
import {
  FaShoppingCart,
  FaBox,
  FaTruck,
  FaChartLine,
  FaStore,
  FaUserTie,
  FaShieldAlt
} from "react-icons/fa";

const Landing = () => {
  const SERVER_URL = "http://localhost:5000";

  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-emerald-50 to-teal-50">

      {/* ================= NAVBAR ================= */}
      <header className="relative overflow-hidden">
        <nav className="max-w-7xl mx-auto px-4 py-6 flex justify-between items-center">

          {/* Logo */}
          <div className="flex items-center gap-3">
            <div className="w-14 h-14 bg-gradient-to-r from-emerald-500 to-teal-600 rounded-2xl flex items-center justify-center shadow-lg">
              <FaStore className="text-white text-xl" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Kiran Dairy Farm
              </h1>
              <p className="text-emerald-600 text-sm font-semibold">
                ERP & POS for Dairy Shops
              </p>
            </div>
          </div>

          {/* Buttons */}
          <div className="flex gap-3 bg-white px-5 py-2 rounded-2xl shadow-md border">
            
            <Link
              to="/login?role=shop"
              className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 transition"
            >
              <FaShoppingCart /> Shop Login
            </Link>

            <Link
              to="/login?role=admin"
              className="flex items-center gap-2 px-4 py-2 border border-emerald-600 text-emerald-700 rounded-xl hover:bg-emerald-600 hover:text-white transition"
            >
              <FaUserTie /> Admin
            </Link>

            <Link
              to="/login?role=super-admin"
              className="flex items-center gap-2 px-4 py-2 bg-gray-900 text-white rounded-xl hover:bg-black transition"
            >
              <FaShieldAlt /> Super Admin
            </Link>

          </div>
        </nav>

        {/* ================= HERO ================= */}
        <div className="max-w-7xl mx-auto px-4 py-20 grid lg:grid-cols-2 gap-16 items-center">

          {/* Left */}
          <div>
            <h2 className="text-5xl font-bold text-gray-900 leading-tight">
              Complete Dairy <br />
              Management System
            </h2>

            <p className="text-gray-600 mt-6 text-lg">
              Advanced POS, inventory tracking, dispatch management,
              stock alerts, staff management and analytics built for dairy operations.
            </p>

            {/* Features */}
            <div className="grid grid-cols-2 gap-4 mt-10">

              <div className="bg-white p-5 rounded-xl shadow">
                <div className="flex items-center gap-2 mb-2">
                  <FaShoppingCart className="text-emerald-600" />
                  <h4 className="font-semibold">Lightning POS</h4>
                </div>
                <p className="text-sm text-gray-500">
                  Fast billing, UPI/Cash/Card
                </p>
              </div>

              <div className="bg-white p-5 rounded-xl shadow">
                <div className="flex items-center gap-2 mb-2">
                  <FaChartLine className="text-blue-600" />
                  <h4 className="font-semibold">Stock Alerts</h4>
                </div>
                <p className="text-sm text-gray-500">
                  Smart restock alerts
                </p>
              </div>

              <div className="bg-white p-5 rounded-xl shadow">
                <div className="flex items-center gap-2 mb-2">
                  <FaTruck className="text-orange-600" />
                  <h4 className="font-semibold">Dispatch</h4>
                </div>
                <p className="text-sm text-gray-500">
                  Real-time tracking
                </p>
              </div>

              <div className="bg-white p-5 rounded-xl shadow">
                <div className="flex items-center gap-2 mb-2">
                  <FaBox className="text-purple-600" />
                  <h4 className="font-semibold">Analytics</h4>
                </div>
                <p className="text-sm text-gray-500">
                  Sales & reports
                </p>
              </div>

            </div>

            {/* Buttons */}
            <div className="flex gap-4 mt-10">
              <Link
                to="/login?role=shop"
                className="flex items-center gap-2 bg-emerald-600 text-white px-6 py-3 rounded-xl hover:bg-emerald-700"
              >
                <FaStore /> Start POS
              </Link>

              <Link
                to="/login?role=admin"
                className="flex items-center gap-2 bg-gray-900 text-white px-6 py-3 rounded-xl hover:bg-black"
              >
                <FaUserTie /> Admin Panel
              </Link>
            </div>
          </div>

          {/* Right Images */}
          <div className="grid grid-cols-2 gap-4">
            <img
              src={`${SERVER_URL}/uploads/products/cow-milk-1776448496096.jpeg`}
              alt="milk"
              className="rounded-xl shadow"
            />
            <img
              src={`${SERVER_URL}/uploads/products/fresh-paneer-1776494765416.jpeg`}
              alt="paneer"
              className="rounded-xl shadow"
            />
            <img
              src={`${SERVER_URL}/uploads/products/cow-ghee-1776448286076.jpeg`}
              alt="ghee"
              className="rounded-xl shadow col-span-2"
            />
          </div>

        </div>
      </header>

      {/* ================= FEATURES ================= */}
      <section className="py-20 bg-white">
        <div className="text-center mb-12">
          <h3 className="text-4xl font-bold text-gray-900">
            Everything Dairy Shops Need
          </h3>
          <p className="text-gray-600 mt-4">
            Inventory, POS, dispatch and analytics in one system.
          </p>
        </div>

        <div className="max-w-6xl mx-auto grid md:grid-cols-4 gap-6 px-4">

          <div className="p-6 bg-emerald-50 rounded-xl text-center">
            <FaShoppingCart className="mx-auto text-emerald-600 text-2xl mb-3" />
            <h4 className="font-semibold">POS</h4>
          </div>

          <div className="p-6 bg-blue-50 rounded-xl text-center">
            <FaBox className="mx-auto text-blue-600 text-2xl mb-3" />
            <h4 className="font-semibold">Inventory</h4>
          </div>

          <div className="p-6 bg-orange-50 rounded-xl text-center">
            <FaTruck className="mx-auto text-orange-600 text-2xl mb-3" />
            <h4 className="font-semibold">Dispatch</h4>
          </div>

          <div className="p-6 bg-purple-50 rounded-xl text-center">
            <FaChartLine className="mx-auto text-purple-600 text-2xl mb-3" />
            <h4 className="font-semibold">Analytics</h4>
          </div>

        </div>
      </section>

      {/* ================= CTA ================= */}
      <section className="py-20 bg-emerald-600 text-center text-white">
        <h3 className="text-4xl font-bold mb-4">
          Ready to Modernize Your Dairy?
        </h3>

        <div className="flex justify-center gap-4 mt-8">
          <Link
            to="/login?role=shop"
            className="flex items-center gap-2 bg-white text-emerald-700 px-6 py-3 rounded-xl"
          >
            <FaStore /> Start Shop
          </Link>

          <Link
            to="/login?role=admin"
            className="flex items-center gap-2 bg-gray-900 text-white px-6 py-3 rounded-xl"
          >
            <FaUserTie /> Admin Panel
          </Link>
        </div>
      </section>

      {/* ================= FOOTER ================= */}
      <footer className="bg-gray-900 text-white py-10 text-center">
        <p>© 2024 Kiran Dairy ERP. All rights reserved.</p>
      </footer>

    </div>
  );
};

export default Landing;