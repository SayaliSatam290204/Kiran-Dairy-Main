import { useState, useEffect } from "react";
import toast from "react-hot-toast";
import { adminApi } from "../../api/adminApi.js";
import { Modal } from "../../components/ui/Modal.jsx";
import { Button } from "../../components/ui/Button.jsx";
import { Input } from "../../components/ui/Input.jsx";
import { Card } from "../../components/ui/Card.jsx";

export const Shops = () => {
  const [shops, setShops] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState(null);

  const [formData, setFormData] = useState({
    name: "",
    location: "",
    ownerName: "",
    contactNo: "",
    email: "",
    address: "",
    password: "",
    isActive: true
  });

  useEffect(() => {
    fetchShops();
  }, []);

  const fetchShops = async () => {
    try {
      setLoading(true);
      const response = await adminApi.getAllShops();
      setShops(response.data.data);
    } catch (error) {
      toast.error("Failed to fetch shops");
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (shop = null) => {
    if (shop) {
      setEditingId(shop._id);
      setFormData({
        name: shop.name || "",
        location: shop.location || "",
        ownerName: shop.ownerName || "",
        contactNo: shop.contactNo || "",
        email: shop.email || "",
        address: shop.address || "",
        password: "",
        isActive: shop.isActive ?? true
      });
    } else {
      setEditingId(null);
      setFormData({
        name: "",
        location: "",
        ownerName: "",
        contactNo: "",
        email: "",
        address: "",
        password: "",
        isActive: true
      });
    }
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingId(null);
    setFormData({
      name: "",
      location: "",
      ownerName: "",
      contactNo: "",
      email: "",
      address: "",
      password: "",
      isActive: true
    });
  };

  const handleChangeForm = (e) => {
    const { name, value, type, checked } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (
      !formData.name ||
      !formData.location ||
      !formData.ownerName ||
      !formData.contactNo ||
      !formData.email ||
      !formData.address
    ) {
      return toast.error("Please fill all required fields");
    }

    const digitsOnly = formData.contactNo.replace(/\D/g, "");
    if (digitsOnly.length !== 10) {
      return toast.error("Contact number must be 10 digits");
    }

    if (!editingId && !formData.password) {
      return toast.error("Please set a password for the shop");
    }

    try {
      if (editingId) {
        await adminApi.updateShop(editingId, formData);
        toast.success("Shop updated successfully");
      } else {
        await adminApi.createShop(formData);
        toast.success("Shop created successfully (Username = Shop Name, Password = Set by admin)");
      }

      handleCloseModal();
      fetchShops();
    } catch (error) {
      toast.error(error.response?.data?.message || "Operation failed");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this shop?")) return;

    try {
      await adminApi.deleteShop(id);
      toast.success("Shop deleted successfully");
      fetchShops();
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to delete shop");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900">Shop Management</h1>
        <Button onClick={() => handleOpenModal()} className="bg-blue-600 hover:bg-blue-700 text-white">
          + Add Shop
        </Button>
      </div>

      {loading ? (
        <div className="text-center py-12">
          <p className="text-gray-500">Loading shops...</p>
        </div>
      ) : shops.length === 0 ? (
        <Card className="text-center py-12">
          <p className="text-gray-500">No shops found. Add one to get started.</p>
        </Card>
      ) : (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Shop Name / Username</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Owner</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Location</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Email</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Phone</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Status</th>
                <th className="px-6 py-3 text-right text-sm font-semibold text-gray-900">Actions</th>
              </tr>
            </thead>

            <tbody className="divide-y">
              {shops.map((shop) => (
                <tr key={shop._id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 text-sm font-medium text-gray-900">{shop.name}</td>
                  <td className="px-6 py-4 text-sm text-gray-600">{shop.ownerName}</td>
                  <td className="px-6 py-4 text-sm text-gray-600">{shop.location}</td>
                  <td className="px-6 py-4 text-sm text-gray-600">{shop.email}</td>
                  <td className="px-6 py-4 text-sm text-gray-600">{shop.contactNo}</td>

                  <td className="px-6 py-4 text-sm">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-semibold ${
                        shop.isActive ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
                      }`}
                    >
                      {shop.isActive ? "Active" : "Inactive"}
                    </span>
                  </td>

                  <td className="px-6 py-4 text-sm text-right space-x-2">
                    <button
                      onClick={() => handleOpenModal(shop)}
                      className="text-blue-600 hover:text-blue-700 font-semibold"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(shop._id)}
                      className="text-red-600 hover:text-red-700 font-semibold"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {showModal && (
        <Modal isOpen={showModal} onClose={handleCloseModal} title={editingId ? "Edit Shop" : "Add Shop"}>
          <form onSubmit={handleSubmit} className="space-y-0">
            <div className="mb-6">
              <h3 className="text-sm font-semibold text-gray-700 mb-4">Shop Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  label="Shop Name (Username) *"
                  name="name"
                  value={formData.name}
                  onChange={handleChangeForm}
                  required
                  className="mb-0"
                />
                <Input
                  label="Location *"
                  name="location"
                  value={formData.location}
                  onChange={handleChangeForm}
                  required
                  className="mb-0"
                />
              </div>
            </div>

            <div className="mb-6">
              <h3 className="text-sm font-semibold text-gray-700 mb-4">Owner Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  label="Owner Name *"
                  name="ownerName"
                  value={formData.ownerName}
                  onChange={handleChangeForm}
                  required
                  className="mb-0"
                />
                <Input
                  label="Email *"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChangeForm}
                  required
                  className="mb-0"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                <Input
                  label="Phone Number *"
                  name="contactNo"
                  value={formData.contactNo}
                  onChange={handleChangeForm}
                  required
                  className="mb-0"
                />
                <Input
                  label="Password *"
                  name="password"
                  type="password"
                  value={formData.password}
                  onChange={handleChangeForm}
                  placeholder={editingId ? "Leave empty to keep current password" : "Set shop password"}
                  className="mb-0"
                />
              </div>

              <p className="text-xs text-gray-500 mt-2">
                Shop Login Credentials: <b>Username = Shop Name</b> | <b>Password = Set {editingId ? "or update" : "below"}</b>
              </p>
            </div>

            <div className="mb-6">
              <h3 className="text-sm font-semibold text-gray-700 mb-4">Address</h3>
              <Input
                label="Full Address *"
                name="address"
                value={formData.address}
                onChange={handleChangeForm}
                required
                placeholder="Enter complete shop address"
              />
            </div>

            <div className="mb-6">
              <h3 className="text-sm font-semibold text-gray-700 mb-4">Status</h3>
              <div className="bg-gray-50 p-4 rounded-md border border-gray-200">
                <label className="flex items-center p-2 hover:bg-white rounded cursor-pointer transition">
                  <input
                    type="checkbox"
                    name="isActive"
                    checked={formData.isActive}
                    onChange={handleChangeForm}
                    className="w-4 h-4 mr-3 rounded border-gray-300"
                  />
                  <span className="text-sm font-medium text-gray-700">Shop is Active</span>
                </label>
              </div>
            </div>

            <div className="flex gap-3 pt-6 border-t border-gray-200">
              <Button type="submit" className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-md font-semibold">
                {editingId ? "Update Shop" : "Create Shop"}
              </Button>

              <Button
                type="button"
                onClick={handleCloseModal}
                className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-900 py-2 rounded-md font-semibold"
              >
                Cancel
              </Button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};