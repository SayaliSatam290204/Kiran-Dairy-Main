import { Link } from "react-router-dom";
import { FaShieldAlt } from "react-icons/fa";
import posImage from "../assets/POS Dashboard.jpeg";
import {
  FaShoppingCart,
  FaBox,
  FaTruck,
  FaChartLine,
  FaStore,
  FaUserTie,
  FaTractor,
  FaIndustry,
  FaPallet,
  FaBarcode,
  FaFileInvoiceDollar
} from "react-icons/fa";
import { 
  ProductRevenuePieChart,
  BranchRevenueBarChart,
  TopBranchesBarChart,
  StaffPerformanceBar 
} from '../components/common/ChartContainer.jsx';
import { shopApi } from '../api/shopApi.js';
import { useState, useEffect } from 'react';

const Landing = () => {
  const [previewData, setPreviewData] = useState({
    branchData: [],
    topBranchesData: [],
    staffData: []
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPreviewData = async () => {
      try {
        const response = await shopApi.getPreviewData();
        setPreviewData(response.data.data || {
          branchData: [],
          topBranchesData: [],
          staffData: []
        });
      } catch (error) {
        console.error('Preview data fetch failed:', error);
        console.log('Using backend fallback mock data');
      } finally {
        setLoading(false);
        console.log('Preview data loaded:', previewData);
      }
    };

    fetchPreviewData();
  }, []);

  return (
    <div className="[&_.animate-float]:animate-[float_6s_ease-in-out_infinite] [&_.animate-stagger-child:nth-child(1)]:animate-[stagger-fade_0.6s_0.1s_ease-out_forwards] [&_.animate-stagger-child:nth-child(2)]:animate-[stagger-fade_0.6s_0.2s_ease-out_forwards] [&_.animate-stagger-child:nth-child(3)]:animate-[stagger-fade_0.6s_0.3s_ease-out_forwards] [&_.animate-stagger-child:nth-child(4)]:animate-[stagger-fade_0.6s_0.4s_ease-out_forwards] [&_.particle]:animate-[particles_20s_ease-in-out_infinite] relative overflow-hidden min-h-screen bg-[linear-gradient(135deg,#667eea_0%,#764ba2_100%)] bg-[length:400%_400%] bg-[position:0%_50%] [background-size:400%_400%] animate-[gradient-shift_15s_ease_infinite]">



      {/* ================= NAVBAR ================= */}
      <header>
        <nav className="max-w-7xl mx-auto px-4 py-6 flex justify-between items-center">

          {/* Logo */}
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-emerald-600 rounded-xl flex items-center justify-center">
              <FaStore className="text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold">Kiran Dairy Farm</h1>
              <p className="text-sm text-emerald-600">ERP & POS System</p>
            </div>
          </div>

          {/* LOGIN ONLY IN NAVBAR */}
          <div className="flex gap-2">
            <Link
            to="/login?role=shop"
            className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition"
            >
              Shop
              </Link>
            
            <Link
            to="/login?role=admin"
            className="px-4 py-2 border border-white text-white rounded-lg hover:bg-white hover:text-emerald-700 transition"
            >
              Admin
              </Link>
            
            <Link
            to="/login?role=super-admin"
            className="px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-700 transition"
            >
              Super Admin
              </Link>
              </div>
        </nav>
      </header>

      {/* ================= HERO ================= */}
      <section className="max-w-7xl mx-auto px-4 py-20 grid lg:grid-cols-2 gap-12 items-center relative z-10">

        {/* LEFT */}
        <div>
          <h2 className="text-5xl md:text-6xl font-bold text-white drop-shadow-2xl [text-shadow:0_2px_4px_rgba(0,0,0,0.5)] leading-tight">
            Dairy Business <br /> Management System
          </h2>


          <p className="mt-6 text-white/90 text-xl drop-shadow-lg [text-shadow:0_1px_2px_rgba(0,0,0,0.3)]">
            Complete ERP solution for dairy shops with POS billing,
            inventory control, dispatch tracking, and analytics.
          </p>


          {/* SMALL FEATURE GRID (TAILWIND ONLY) */}
          <div className="grid grid-cols-2 gap-4 mt-10">
            {/* Fast POS */}
            <div className="bg-white/80 backdrop-blur-sm p-4 rounded-xl shadow-md border border-white/50 
                  hover:bg-white hover:shadow-xl hover:-translate-y-1 transition-all duration-200">
                    <FaShoppingCart className="text-emerald-600 mb-2 text-xl" />
                    <span className="font-semibold text-slate-900 block">Fast POS</span>
            </div>

            {/* Inventory */}
            <div className="bg-white/80 backdrop-blur-sm p-4 rounded-xl shadow-md border border-white/50 
                  hover:bg-white hover:shadow-xl hover:-translate-y-1 transition-all duration-200">
                    <FaBox className="text-blue-600 mb-2 text-xl" />
                    <span className="font-semibold text-slate-900 block">Inventory</span>
            </div>

            {/* Dispatch */}
            <div className="bg-white/80 backdrop-blur-sm p-4 rounded-xl shadow-md border border-white/50 
                  hover:bg-white hover:shadow-xl hover:-translate-y-1 transition-all duration-200">
                    <FaTruck className="text-orange-600 mb-2 text-xl" />
                    <span className="font-semibold text-slate-900 block">Dispatch</span>
            </div>

            {/* Reports */}
            <div className="bg-white/80 backdrop-blur-sm p-4 rounded-xl shadow-md border border-white/50 
                  hover:bg-white hover:shadow-xl hover:-translate-y-1 transition-all duration-200">
                    <FaChartLine className="text-purple-600 mb-2 text-xl" />
                    <span className="font-semibold text-slate-900 block">Reports</span>
            </div>

          </div>
          
        </div>

        {/* RIGHT: SaaS Dashboard Laptop Mockup */}
        <div className="relative group">
          {/* Laptop bezel */}
          <div className="animate-float bg-gradient-to-br from-slate-200 to-slate-300 rounded-3xl p-2 shadow-2xl w-full max-w-md mx-auto">
            
            <div className="bg-slate-900 rounded-2xl overflow-hidden h-64 md:h-72 relative">
              
              {/* POS Dashboard Image */}
              <img
              src={posImage}
              alt="POS Dashboard"
              className="w-full h-full object-cover relative z-10 contrast-110 brightness-105"
              />
              
              {/* Softer Screen reflection */}
              <div className="absolute inset-0 bg-gradient-to-t from-white/5 to-transparent pointer-events-none z-20" />
              
              {/* Screen glow */}
              <div className="absolute -inset-1 bg-gradient-to-r from-emerald-400/20 via-blue-400/20 to-purple-400/20 rounded-2xl blur opacity-70 group-hover:opacity-90 transition-all duration-500" />
            </div>
          </div>
          
          {/* Mockup label */}
          <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 bg-white/90 backdrop-blur-sm px-4 py-2 rounded-xl shadow-lg border text-xs font-semibold text-slate-700">
          POS Dashboard Preview
          </div>
        </div>
      </section>

      {/* ================= WORKFLOW ILLUSTRATION ================= */}
      <section className="py-24 bg-gradient-to-b from-slate-50 to-white">
        <div className="max-w-6xl mx-auto px-6">
          
          {/* Heading */}
          <div className="text-center mb-20">
            <h3 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent mb-6">
              Complete Dairy Workflow
            </h3>
            <p className="text-xl text-slate-600 max-w-2xl mx-auto leading-relaxed">
              From farm collection to customer billing – every step digitized and tracked in real-time
            </p>
         </div>

         <div className="relative">
      
         {/* Steps */}
         <div className="grid grid-cols-1 md:grid-cols-5 gap-6 md:gap-8 items-stretch">
        
          {/* Farm Collection */}
          <div className="group bg-white/80 backdrop-blur-sm border border-emerald-100 hover:border-emerald-300 rounded-3xl p-6 md:p-8 text-center hover:shadow-2xl transition-all duration-500 hover:-translate-y-4">
           <div className="w-16 h-16 md:w-20 md:h-20 bg-gradient-to-br from-emerald-100 to-emerald-200 rounded-2xl flex items-center justify-center mx-auto mb-4 md:mb-6 group-hover:scale-110 transition-transform">
            <FaTractor className="text-xl md:text-2xl text-emerald-600" />
           </div>
            <h4 className="text-xl md:text-2xl font-bold text-slate-900 mb-2 md:mb-3">Farm Collection</h4>
            <p className="text-slate-600 text-sm md:text-base">Milk collection with quality checks</p>
          </div>

          {/* Processing */}
          <div className="group bg-white/80 backdrop-blur-sm border border-blue-100 hover:border-blue-300 rounded-3xl p-6 md:p-8 text-center hover:shadow-2xl transition-all duration-500 hover:-translate-y-4">
           <div className="w-16 h-16 md:w-20 md:h-20 bg-gradient-to-br from-blue-100 to-blue-200 rounded-2xl flex items-center justify-center mx-auto mb-4 md:mb-6 group-hover:scale-110 transition-transform">
             <FaIndustry className="text-xl md:text-2xl text-blue-600" />
            </div>
            <h4 className="text-xl md:text-2xl font-bold text-slate-900 mb-2 md:mb-3">Processing</h4>
            <p className="text-slate-600 text-sm md:text-base">Pasteurization & product manufacturing</p>
          </div>

          {/* Dispatch */}
          <div className="group bg-white/80 backdrop-blur-sm border border-orange-100 hover:border-orange-300 rounded-3xl p-6 md:p-8 text-center hover:shadow-2xl transition-all duration-500 hover:-translate-y-4">
           <div className="w-16 h-16 md:w-20 md:h-20 bg-gradient-to-br from-orange-100 to-orange-200 rounded-2xl flex items-center justify-center mx-auto mb-4 md:mb-6 group-hover:scale-110 transition-transform">
            <FaPallet className="text-xl md:text-2xl text-orange-600" />
           </div>
            <h4 className="text-xl md:text-2xl font-bold text-slate-900 mb-2 md:mb-3">Dispatch</h4>
            <p className="text-slate-600 text-sm md:text-base">Inventory allocation & delivery</p>
          </div>

          {/* Shop POS */}
          <div className="group bg-white/80 backdrop-blur-sm border border-purple-100 hover:border-purple-300 rounded-3xl p-6 md:p-8 text-center hover:shadow-2xl transition-all duration-500 hover:-translate-y-4">
           <div className="w-16 h-16 md:w-20 md:h-20 bg-gradient-to-br from-purple-100 to-purple-200 rounded-2xl flex items-center justify-center mx-auto mb-4 md:mb-6 group-hover:scale-110 transition-transform">
            <FaBarcode className="text-xl md:text-2xl text-purple-600" />
           </div>
           <h4 className="text-xl md:text-2xl font-bold text-slate-900 mb-2 md:mb-3">Shop POS</h4>
           <p className="text-slate-600 text-sm md:text-base">Fast billing & stock sync</p>
          </div>

          {/* Analytics */}
          <div className="group bg-white/80 backdrop-blur-sm border border-slate-100 hover:border-slate-300 rounded-3xl p-6 md:p-8 text-center hover:shadow-2xl transition-all duration-500 hover:-translate-y-4">
           <div className="w-16 h-16 md:w-20 md:h-20 bg-gradient-to-br from-slate-100 to-slate-200 rounded-2xl flex items-center justify-center mx-auto mb-4 md:mb-6 group-hover:scale-110 transition-transform">
            <FaFileInvoiceDollar className="text-xl md:text-2xl text-slate-700" />
           </div>
           <h4 className="text-xl md:text-2xl font-bold text-slate-900 mb-2 md:mb-3">Analytics</h4>
           <p className="text-slate-600 text-sm md:text-base">Real-time business insights</p>
          </div>

        </div>

        {/* Connecting lines (Desktop only) */}
        <div className="absolute inset-0 pointer-events-none hidden lg:block">
          
          <div className="absolute left-[20%] right-[60%] top-1/2 -translate-y-1/2 h-1 bg-gradient-to-r from-emerald-400/60 to-blue-400/60 rounded-full opacity-40"></div>
          <div className="absolute left-[40%] right-[40%] top-1/2 -translate-y-1/2 h-1 bg-gradient-to-r from-blue-400/60 to-orange-400/60 rounded-full opacity-40"></div>
          <div className="absolute left-[60%] right-[20%] top-1/2 -translate-y-1/2 h-1 bg-gradient-to-r from-orange-400/60 to-purple-400/60 rounded-full opacity-40"></div>
          <div className="absolute left-[80%] right-0 top-1/2 -translate-y-1/2 h-1 bg-gradient-to-r from-purple-400/60 to-slate-400/60 rounded-full opacity-40"></div>
        
        </div>
      </div>
      </div>
     </section>
      

      {/* ================= SYSTEM PREVIEW ================= */}
      <section className="py-24 bg-white/50 backdrop-blur-sm">

        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-20">
            <h3 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent mb-6">
              Live System Preview
            </h3>
            <p className="text-xl text-slate-600 max-w-3xl mx-auto leading-relaxed">
              See your dashboard in action - real-time analytics, revenue tracking, and performance insights
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {/* Revenue Chart */}
            <div className="group bg-white/70 backdrop-blur-xl border border-white/50 hover:border-emerald-200/50 hover:shadow-2xl transition-all duration-500 rounded-3xl p-8 animate-stagger-child hover:scale-[1.02]">
              <h4 className="text-2xl font-bold text-slate-900 mb-6 flex items-center gap-3">
                <FaChartLine className="text-emerald-600" />
                Branch Revenue
              </h4>
              <div className="h-80 flex items-center justify-center">
                {loading ? (
                  <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600 mx-auto mb-4"></div>
                    <p className="text-slate-500">Loading revenue data...</p>
                  </div>
                ) : previewData.branchData.length > 0 ? (
                  <div className="w-full h-[260px] md:h-[300px]">
                    <BranchRevenueBarChart data={previewData.branchData} />
                  </div>
                ) : (
                  <div className="text-center text-slate-500 py-12">
                    <FaChartLine className="text-4xl text-slate-400 mx-auto mb-4" />
                    <p>No branch revenue data yet</p>
                    <p className="text-sm">Start sales to see live analytics</p>
                  </div>
                )}
              </div>
            </div>

            {/* Top Branches */}
            <div className="group bg-white/70 backdrop-blur-xl border border-white/50 hover:border-blue-200/50 hover:shadow-2xl transition-all duration-500 rounded-3xl p-8 animate-stagger-child hover:scale-[1.02]">
              <h4 className="text-2xl font-bold text-slate-900 mb-6 flex items-center gap-3">
                <FaStore className="text-blue-600" />
                Top Performing Shops
              </h4>
              <div className="h-80 flex items-center justify-center">
                {loading ? (
                  <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                    <p className="text-slate-500">Loading top shops...</p>
                  </div>
                ) : previewData.topBranchesData.length > 0 ? (
                  <div className="w-full h-[260px] md:h-[300px]">
                    <TopBranchesBarChart data={previewData.topBranchesData} />
                  </div>
                ) : (
                  <div className="text-center text-slate-500 py-12">
                    <FaStore className="text-4xl text-slate-400 mx-auto mb-4" />
                    <p>No top shops data yet</p>
                    <p className="text-sm">Complete transactions to rank performance</p>
                  </div>
                )}
              </div>
            </div>

            {/* Staff Performance */}
            <div className="group bg-white/70 backdrop-blur-xl border border-white/50 hover:border-purple-200/50 hover:shadow-2xl transition-all duration-500 rounded-3xl p-8 animate-stagger-child hover:scale-[1.02]">
              <h4 className="text-2xl font-bold text-slate-900 mb-6 flex items-center gap-3">
                <FaUserTie className="text-purple-600" />
                Staff Performance
              </h4>
              <div className="h-80 flex items-center justify-center">
                {loading ? (
                  <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
                    <p className="text-slate-500">Loading staff performance...</p>
                  </div>
                ) : previewData.staffData.length > 0 ? (
                  <div className="w-full h-[260px] md:h-[300px]">
                    <StaffPerformanceBar data={previewData.staffData} />
                  </div>
                ) : (
                  <div className="text-center text-slate-500 py-12">
                    <FaUserTie className="text-4xl text-slate-400 mx-auto mb-4" />
                    <p>No staff performance data yet</p>
                    <p className="text-sm">Hire staff & make sales to track performance</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ================= FEATURES ================= */}
      <section className="py-20 bg-gradient-to-b from-emerald-50 to-white">

        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center mb-16">
            <h3 className="text-4xl font-bold text-gray-900 mb-4">
              Everything Your Dairy Needs
            </h3>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Complete system for POS, inventory, dispatch and analytics
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 [&>div]:animate-stagger-child">
            <div className="group relative bg-gradient-to-br from-emerald-50/80 to-emerald-100/60 backdrop-blur-xl border border-emerald-200/50 hover:border-emerald-400 hover:shadow-2xl hover:shadow-emerald-500/10 hover:-translate-y-3 hover:scale-[1.02] transition-all duration-700 rounded-3xl p-10 shadow-xl overflow-hidden animate-stagger-child">
              <div className="absolute inset-0 bg-gradient-to-r from-emerald-400/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
              <FaShoppingCart className="text-emerald-600 text-5xl mb-6 relative z-10 group-hover:scale-110 group-hover:rotate-6 transition-all duration-500" />
              <h4 className="text-2xl font-bold text-slate-900 mb-4 relative z-10">Lightning POS</h4>
              <p className="text-slate-700 relative z-10">Instant checkout, auto stock sync, UPI ready</p>
            </div>

            <div className="group relative bg-gradient-to-br from-blue-50/80 to-blue-100/60 backdrop-blur-xl border border-blue-200/50 hover:border-blue-400 hover:shadow-2xl hover:shadow-blue-500/10 hover:-translate-y-3 hover:scale-[1.02] transition-all duration-700 rounded-3xl p-10 shadow-xl overflow-hidden animate-stagger-child">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-400/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
              <FaBox className="text-blue-600 text-5xl mb-6 relative z-10 group-hover:scale-110 group-hover:rotate-6 transition-all duration-500" />
              <h4 className="text-2xl font-bold text-slate-900 mb-4 relative z-10">Smart Inventory</h4>
              <p className="text-slate-700 relative z-10">Low stock alerts, expiry tracking, auto reordering</p>
            </div>

            <div className="group relative bg-gradient-to-br from-orange-50/80 to-orange-100/60 backdrop-blur-xl border border-orange-200/50 hover:border-orange-400 hover:shadow-2xl hover:shadow-orange-500/10 hover:-translate-y-3 hover:scale-[1.02] transition-all duration-700 rounded-3xl p-10 shadow-xl overflow-hidden animate-stagger-child">
              <div className="absolute inset-0 bg-gradient-to-r from-orange-400/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
              <FaTruck className="text-orange-600 text-5xl mb-6 relative z-10 group-hover:scale-110 group-hover:rotate-6 transition-all duration-500" />
              <h4 className="text-2xl font-bold text-slate-900 mb-4 relative z-10">Dispatch Control</h4>
              <p className="text-slate-700 relative z-10">Route optimization, delivery tracking, proof of delivery</p>
            </div>

            <div className="group relative bg-gradient-to-br from-purple-50/80 to-purple-100/60 backdrop-blur-xl border border-purple-200/50 hover:border-purple-400 hover:shadow-2xl hover:shadow-purple-500/10 hover:-translate-y-3 hover:scale-[1.02] transition-all duration-700 rounded-3xl p-10 shadow-xl overflow-hidden animate-stagger-child">
              <div className="absolute inset-0 bg-gradient-to-r from-purple-400/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
              <FaChartLine className="text-purple-600 text-5xl mb-6 relative z-10 group-hover:scale-110 group-hover:rotate-6 transition-all duration-500" />
              <h4 className="text-2xl font-bold text-slate-900 mb-4 relative z-10">Advanced Analytics</h4>
              <p className="text-slate-700 relative z-10">Revenue trends, staff performance, demand forecasting</p>
            </div>
          </div>
        </div>
      </section>

      {/* ================= CTA ================= */}
      <section className="py-20 bg-gradient-to-r from-emerald-600 to-teal-600 text-white">
        <div className="max-w-4xl mx-auto text-center px-4">
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            Ready to Transform Your Dairy Business?
          </h2>
          <p className="text-xl mb-10 opacity-90 leading-relaxed">
            Complete ERP & POS system for faster billing, smart inventory, and business insights.
          </p>
        <div className="flex flex-col sm:flex-row gap-6 justify-center items-center pt-8">
            <Link 
              to="/login?role=shop" 
              className="animate-float group relative bg-white/90 backdrop-blur-xl text-emerald-800 px-10 py-5 rounded-3xl font-bold text-lg shadow-2xl hover:shadow-emerald-500/20 hover:shadow-3xl hover:-translate-y-2 hover:scale-[1.05] border border-emerald-200 hover:border-emerald-400 transition-all duration-700 min-w-[200px] overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-emerald-400/0 to-emerald-500/20 opacity-0 group-hover:opacity-100 transition-all duration-700" />
              <FaStore className="text-emerald-600 text-2xl group-hover:scale-110 group-hover:rotate-12 transition-all duration-700 mx-auto block mb-2 relative z-10" />
              <span className="relative z-10 block">Start Shop Now</span>
            </Link>
            <Link 
              to="/login?role=admin" 
              className="animate-float [animation-delay:0.2s] group relative bg-gradient-to-r from-slate-900/90 to-slate-800/90 backdrop-blur-xl text-white border-2 border-white/30 px-10 py-5 rounded-3xl font-bold text-lg shadow-2xl hover:shadow-slate-500/30 hover:shadow-3xl hover:-translate-y-2 hover:scale-[1.05] hover:border-white/60 transition-all duration-700 min-w-[200px] overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-700" />
              <FaUserTie className="text-white/90 text-2xl group-hover:scale-110 group-hover:rotate-12 transition-all duration-700 mx-auto block mb-2 relative z-10" />
              <span className="relative z-10 block">Admin Dashboard</span>
            </Link>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="bg-dark text-white text-center py-3">
        © 2026 Kiran Dairy ERP System
      </footer>

    </div>
  );
};

export default Landing;