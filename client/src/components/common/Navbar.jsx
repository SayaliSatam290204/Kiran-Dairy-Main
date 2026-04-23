// src/components/common/Navbar.jsx
import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { FaUser } from "react-icons/fa";
import { useAuth } from "../../hooks/useAuth.js";
import { Modal } from "../ui/Modal.jsx";
import { Badge } from "../ui/Badge.jsx";
import { Button } from "../ui/Button.jsx";

export const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [menuOpen, setMenuOpen] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);

  const roleLabel = useMemo(() => {
    const r = user?.role;
    if (!r) return "";
    return r.toUpperCase();
  }, [user]);

  const roleVariant = user?.role === "admin" ? "blue" : "green";

  const handleLogout = () => {
    setConfirmOpen(true);
    setMenuOpen(false);
  };

  const doLogout = () => {
    setConfirmOpen(false);
    setMenuOpen(false);
    logout();
    toast.success("Logged out successfully!");
    navigate("/", { replace: true });
  };

  return (
    <>
      <nav className="bg-white border-b px-4 py-3 flex justify-between items-center">
        <div className="flex items-center gap-3">
          <h1 className="text-xl font-bold text-blue-700">Kiran Dairy Farm</h1>
          {roleLabel && <Badge variant={roleVariant}>{roleLabel}</Badge>}
        </div>

        <div className="relative">
          <button
            onClick={() => setMenuOpen((v) => !v)}
            className="flex items-center gap-3 px-3 py-2 rounded-md hover:bg-gray-100"
          >
            <div className="w-9 h-9 rounded-full bg-blue-600 text-white flex items-center justify-center font-semibold">
              {(user?.name || "U").trim().charAt(0).toUpperCase()}
            </div>
            <div className="hidden sm:block text-left">
              <div className="text-sm font-semibold text-gray-900">{user?.name || "User"}</div>
              <div className="text-xs text-gray-500">{user?.email || ""}</div>
            </div>
            <span className="text-gray-600 text-sm">▾</span>
          </button>

          {menuOpen && (
            <div
              className="absolute right-0 mt-2 w-56 bg-white border rounded-lg shadow-lg overflow-hidden z-50"
              onMouseLeave={() => setMenuOpen(false)}
            >
              <div className="px-4 py-3 border-b">
                <div className="text-sm font-semibold text-gray-900">{user?.name || "User"}</div>
                <div className="text-xs text-gray-500">{user?.email || ""}</div>
              </div>

              {user?.role === "admin" && (
                <button
                  onClick={() => {
                    navigate("/admin/profile");
                    setMenuOpen(false);
                  }}
                  className="w-full text-left px-4 py-3 hover:bg-gray-50 text-gray-900 font-medium flex items-center gap-2"
                >
                  <FaUser size={16} />
                  <span>Profile</span>
                </button>
              )}

              <button
                onClick={handleLogout}
                className="w-full text-left px-4 py-3 hover:bg-gray-50 text-red-600 font-medium"
              >
                Logout
              </button>
            </div>
          )}
        </div>
      </nav>

      {/* Logout confirm modal */}
      <Modal isOpen={confirmOpen} title="Confirm Logout" onClose={() => setConfirmOpen(false)}>
        <p className="text-gray-700 mb-4">Are you sure you want to logout?</p>
        <div className="flex justify-end gap-2">
          <Button variant="secondary" onClick={() => setConfirmOpen(false)}>
            Cancel
          </Button>
          <Button variant="danger" onClick={doLogout}>
            Logout
          </Button>
        </div>
      </Modal>
    </>
  );
};