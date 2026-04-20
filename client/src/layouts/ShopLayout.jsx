import { Navbar } from "../components/common/Navbar.jsx";
import { Sidebar } from "../components/common/Sidebar.jsx";

export const ShopLayout = ({ children }) => {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Sticky Top Navbar */}
      <div className="sticky top-0 z-50">
        <Navbar />
      </div>

      <div className="flex">
        {/* Sidebar */}
        <aside className="h-[calc(100vh-64px)] sticky top-16">
          <Sidebar />
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-6 min-h-[calc(100vh-64px)]">
          {children}
        </main>
      </div>
    </div>
  );
};