import { useState, useEffect } from "react";
import toast from "react-hot-toast";
import { FaMapMarkerAlt, FaUser, FaPhone, FaChevronDown, FaChevronUp } from "react-icons/fa";
import { adminApi } from "../../api/adminApi.js";
import { uploadApi } from "../../api/uploadApi.js";
import { Modal } from "../../components/ui/Modal.jsx";
import { Button } from "../../components/ui/Button.jsx";
import { Input } from "../../components/ui/Input.jsx";
import { Card } from "../../components/ui/Card.jsx";
import { Badge } from "../../components/ui/Badge.jsx";
import { formatCurrency } from "../../utils/formatCurrency.js";

export const ShopLedger = () => {
  const [shopsData, setShopsData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [expandedShop, setExpandedShop] = useState(null);

  // Modal states
  const [showAddProductModal, setShowAddProductModal] = useState(false);
  const [showCreateProductModal, setShowCreateProductModal] = useState(false);
  const [selectedShopId, setSelectedShopId] = useState(null);
  const [allProducts, setAllProducts] = useState([]);

  // Add existing product form
  const [formData, setFormData] = useState({
    productId: "",
    quantity: 0
  });

  // Create new product form
  const [newProductForm, setNewProductForm] = useState({
    name: "",
    sku: "",
    description: "",
    price: "",
    unit: "liter",
    category: "Liquid Milk",
    subcategory: "",
    image: ""
  });
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState(null);

  const categoryOptions = {
    "Liquid Milk": ["Toned Milk", "Full Cream Milk", "Cow Milk", "Buffalo Milk"],
    "Fermented Products": ["Curd", "Yogurt", "Lassi", "Chaas"],
    "Fat-rich Products": ["Butter", "Ghee", "Cream"],
    "Cheese & Paneer": ["Paneer", "Cheese"],
    "Sweet Products": ["Mithai"],
    "Frozen Dairy": ["Ice Cream"],
    "Powdered Dairy": ["Milk Powder", "Protein Powder"],
    "Value-added / Flavored": ["Flavored Milk", "Probiotic Milk"]
  };

  useEffect(() => {
    fetchShopsWithInventory();
    fetchAllProducts();
  }, []);

  const fetchShopsWithInventory = async () => {
    try {
      setLoading(true);
      const response = await adminApi.getShopsWithInventory();
      setShopsData(response.data.data || []);
    } catch (error) {
      toast.error("Failed to fetch shop ledger");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const fetchAllProducts = async () => {
    try {
      const response = await adminApi.getAllProducts();
      setAllProducts(response.data.data || []);
    } catch (error) {
      console.error("Failed to fetch products:", error);
    }
  };

  // ===== Add Existing Product to Shop =====
  const handleOpenAddProductModal = (shopId) => {
    setSelectedShopId(shopId);
    setFormData({ productId: "", quantity: 0 });
    setShowAddProductModal(true);
  };

  const handleAddProductToShop = async () => {
    if (!formData.productId || formData.quantity <= 0) {
      toast.error("Select product and enter quantity");
      return;
    }

    try {
      await adminApi.addProductToShop(selectedShopId, {
        productId: formData.productId,
        quantity: parseInt(formData.quantity)
      });

      toast.success("Product added to shop successfully");
      setShowAddProductModal(false);
      fetchShopsWithInventory();
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to add product");
    }
  };

  // ===== Create New Product =====
  const handleOpenCreateProductModal = (shopId) => {
    setSelectedShopId(shopId);
    setNewProductForm({
      name: "",
      sku: "",
      description: "",
      price: "",
      unit: "liter",
      category: "Liquid Milk",
      subcategory: "",
      image: ""
    });
    setPreview(null);
    setShowCreateProductModal(true);
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const res = await uploadApi.uploadProductImage(file);
      const url = res.data.data.url; // "/uploads/products/xxx.jpg"
      setNewProductForm((p) => ({ ...p, image: url }));
      setPreview(`${import.meta.env.VITE_API_BASE_URL}${url}`);
      toast.success("Image uploaded successfully");
    } catch (err) {
      toast.error(err.response?.data?.message || "Image upload failed");
    } finally {
      setUploading(false);
    }
  };

  const handleCreateProduct = async () => {
    if (!newProductForm.name || !newProductForm.sku || !newProductForm.price) {
      toast.error("Fill required fields: Name, SKU, Price");
      return;
    }

    try {
      // Create product
      const productRes = await adminApi.createProduct({
        name: newProductForm.name,
        sku: newProductForm.sku.toUpperCase(),
        description: newProductForm.description,
        price: parseFloat(newProductForm.price),
        unit: newProductForm.unit,
        category: newProductForm.category,
        subcategory: newProductForm.subcategory,
        image: newProductForm.image,
        imageUrl: newProductForm.image // For backward compatibility
      });

      const newProduct = productRes.data.data;
      toast.success("Product created successfully");

      // Now add it to the shop
      if (selectedShopId) {
        await adminApi.addProductToShop(selectedShopId, {
          productId: newProduct._id,
          quantity: 100 // Default initial quantity
        });
        toast.success("Product added to shop");
      }

      setShowCreateProductModal(false);
      fetchShopsWithInventory();
      fetchAllProducts();
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to create product");
    }
  };

  // Get products already in shop
  const getShopProductIds = (shopId) => {
    const shop = shopsData.find(s => s._id === shopId);
    return shop?.inventory?.map(inv => inv.productId?._id) || [];
  };

  // Filter products not in this shop
  const getAvailableProducts = (shopId) => {
    const shopProductIds = getShopProductIds(shopId);
    return allProducts.filter(p => !shopProductIds.includes(p._id));
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Shop Ledger & Inventory</h1>
        <div className="text-sm text-gray-600">
          {shopsData.length} Active Shops
        </div>
      </div>

      {loading ? (
        <div className="text-center py-10">Loading...</div>
      ) : shopsData.length === 0 ? (
        <Card>
          <div className="text-center py-10">
            <p className="text-gray-600">No shops available</p>
          </div>
        </Card>
      ) : (
        <div className="space-y-4">
          {shopsData.map((shop) => (
            <Card key={shop._id} className="overflow-hidden">
              {/* Shop Header */}
              <div
                className="cursor-pointer hover:bg-gray-50 p-4 border-b"
                onClick={() =>
                  setExpandedShop(expandedShop === shop._id ? null : shop._id)
                }
              >
                <div className="flex justify-between items-center">
                  <div className="flex-1">
                    <h3 className="text-lg font-bold">{shop.name}</h3>
                    <div className="flex gap-4 text-sm text-gray-600 mt-1">
                      <span className="flex items-center gap-1"><FaMapMarkerAlt className="text-red-500" /> {shop.location}</span>
                      <span className="flex items-center gap-1"><FaUser className="text-blue-500" /> {shop.ownerName}</span>
                      <span className="flex items-center gap-1"><FaPhone className="text-green-500" /> {shop.contactNo}</span>
                    </div>
                  </div>

                  <div className="text-right">
                    <div className="text-2xl font-bold text-blue-600">
                      {shop.totalStock}
                    </div>
                    <div className="text-xs text-gray-600">
                      {shop.totalProducts} Products
                    </div>
                  </div>

                  <div className="ml-4 text-lg text-gray-600">
                    {expandedShop === shop._id ? <FaChevronUp /> : <FaChevronDown />}
                  </div>
                </div>
              </div>

              {/* Shop Inventory (Expanded) */}
              {expandedShop === shop._id && (
                <div className="p-4 bg-gray-50">
                  {/* Add Product Buttons */}
                  <div className="mb-4 flex gap-2">
                    <Button
                      onClick={() => handleOpenAddProductModal(shop._id)}
                      className="text-sm"
                    >
                      + Add Existing Product
                    </Button>
                    <Button
                      onClick={() => handleOpenCreateProductModal(shop._id)}
                      className="text-sm bg-green-600 hover:bg-green-700"
                    >
                      + Create & Add New Product
                    </Button>
                  </div>

                  {/* Products Table */}
                  {shop.inventory?.length === 0 ? (
                    <div className="text-center py-6">
                      <p className="text-gray-500">No products in this shop</p>
                    </div>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm border-collapse">
                        <thead>
                          <tr className="border-b bg-white">
                            <th className="text-left py-2 px-3">Product</th>
                            <th className="text-left py-2 px-3">Category</th>
                            <th className="text-left py-2 px-3">Unit</th>
                            <th className="text-right py-2 px-3">Price</th>
                            <th className="text-right py-2 px-3">Stock</th>
                            <th className="text-right py-2 px-3">Total Value</th>
                          </tr>
                        </thead>
                        <tbody>
                          {shop.inventory.map((item) => {
                            const product = item.productId;
                            if (!product) return null;

                            const totalValue = product.price * item.quantity;

                            return (
                              <tr key={item._id} className="border-b hover:bg-gray-100">
                                <td className="py-3 px-3">
                                  <div className="flex items-center gap-2">
                                    {product.imageUrl ? (
                                      <img
                                        src={product.imageUrl}
                                        alt={product.name}
                                        className="w-8 h-8 rounded object-cover"
                                        onError={(e) =>
                                          (e.currentTarget.src =
                                            "https://dummyimage.com/32x32/e5e7eb/111827.png")
                                        }
                                      />
                                    ) : (
                                      <div className="w-8 h-8 rounded bg-gray-200" />
                                    )}
                                    <div>
                                      <p className="font-semibold">
                                        {product.name}
                                      </p>
                                      <p className="text-xs text-gray-600">
                                        {product.sku}
                                      </p>
                                    </div>
                                  </div>
                                </td>

                                <td className="py-3 px-3">
                                  <Badge>{product.category}</Badge>
                                </td>

                                <td className="py-3 px-3 text-sm">
                                  {product.unit}
                                </td>

                                <td className="py-3 px-3 text-right font-semibold">
                                  {formatCurrency(product.price)}
                                </td>

                                <td className="py-3 px-3 text-right">
                                  {item.quantity <= 5 ? (
                                    <Badge variant="red">{item.quantity}</Badge>
                                  ) : (
                                    <span className="font-semibold">
                                      {item.quantity}
                                    </span>
                                  )}
                                </td>

                                <td className="py-3 px-3 text-right font-bold text-green-600">
                                  {formatCurrency(totalValue)}
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>

                      {/* Shop Total Value */}
                      <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-200 flex justify-between items-center">
                        <span className="font-bold">Total Inventory Value:</span>
                        <span className="text-lg font-bold text-blue-600">
                          {formatCurrency(
                            shop.inventory.reduce(
                              (sum, item) =>
                                sum +
                                (item.productId?.price || 0) * (item.quantity || 0),
                              0
                            )
                          )}
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </Card>
          ))}
        </div>
      )}

      {/* Modal: Add Existing Product */}
      <Modal
        isOpen={showAddProductModal}
        title="Add Product to Shop"
        onClose={() => setShowAddProductModal(false)}
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-semibold mb-2">
              Select Product
            </label>
            <select
              value={formData.productId}
              onChange={(e) =>
                setFormData({ ...formData, productId: e.target.value })
              }
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">-- Choose Product --</option>
              {getAvailableProducts(selectedShopId).map((product) => (
                <option key={product._id} value={product._id}>
                  {product.name} (₹{product.price}/{product.unit})
                </option>
              ))}
            </select>
            {getAvailableProducts(selectedShopId).length === 0 && (
              <p className="text-sm text-gray-600 mt-2">
                All products are already added to this shop.{" "}
                <button
                  className="text-blue-600 font-semibold"
                  onClick={() => {
                    setShowAddProductModal(false);
                    handleOpenCreateProductModal(selectedShopId);
                  }}
                >
                  Create new product
                </button>
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-semibold mb-2">
              Initial Quantity
            </label>
            <Input
              type="number"
              min="0"
              value={formData.quantity}
              onChange={(e) =>
                setFormData({ ...formData, quantity: e.target.value })
              }
              placeholder="Enter quantity"
            />
          </div>

          <div className="flex gap-2 justify-end">
            <Button
              onClick={() => setShowAddProductModal(false)}
              className="bg-gray-400 hover:bg-gray-500"
            >
              Cancel
            </Button>
            <Button onClick={handleAddProductToShop} className="bg-blue-600">
              Add Product
            </Button>
          </div>
        </div>
      </Modal>

      {/* Modal: Create New Product */}
      <Modal
        isOpen={showCreateProductModal}
        title="Create New Dairy Product"
        onClose={() => setShowCreateProductModal(false)}
        size="lg"
      >
        <div className="space-y-4 max-h-[600px] overflow-y-auto">
          {/* Image Upload */}
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center">
            {preview ? (
              <img
                src={preview}
                alt="preview"
                className="w-32 h-32 object-cover mx-auto rounded-lg mb-2"
              />
            ) : (
              <div className="text-gray-500">
                <p className="text-3xl mb-2">📷</p>
                <p>No image selected</p>
              </div>
            )}
            <input
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              disabled={uploading}
              className="hidden"
              id="product-image-input"
            />
            <label
              htmlFor="product-image-input"
              className="mt-2 inline-block px-4 py-2 bg-blue-600 text-white rounded-lg cursor-pointer hover:bg-blue-700 disabled:opacity-50"
            >
              {uploading ? "Uploading..." : "Choose Image"}
            </label>
          </div>

          {/* Product Name */}
          <div>
            <label className="block text-sm font-semibold mb-2">
              Product Name *
            </label>
            <Input
              value={newProductForm.name}
              onChange={(e) =>
                setNewProductForm({ ...newProductForm, name: e.target.value })
              }
              placeholder="e.g., Amul Fresh Milk"
              disabled={uploading}
            />
          </div>

          {/* SKU */}
          <div>
            <label className="block text-sm font-semibold mb-2">
              SKU (Stock Keeping Unit) *
            </label>
            <Input
              value={newProductForm.sku}
              onChange={(e) =>
                setNewProductForm({ ...newProductForm, sku: e.target.value })
              }
              placeholder="e.g., MILK-TONED-001"
              disabled={uploading}
            />
            <p className="text-xs text-gray-600 mt-1">
              Unique identifier (will be auto-uppercased)
            </p>
          </div>

          {/* Category */}
          <div>
            <label className="block text-sm font-semibold mb-2">
              Category *
            </label>
            <select
              value={newProductForm.category}
              onChange={(e) =>
                setNewProductForm({
                  ...newProductForm,
                  category: e.target.value,
                  subcategory: ""
                })
              }
              className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg focus:border-blue-600 focus:outline-none"
              disabled={uploading}
            >
              {Object.keys(categoryOptions).map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>

          {/* Subcategory */}
          {categoryOptions[newProductForm.category]?.length > 0 && (
            <div>
              <label className="block text-sm font-semibold mb-2">
                Subcategory
              </label>
              <select
                value={newProductForm.subcategory}
                onChange={(e) =>
                  setNewProductForm({
                    ...newProductForm,
                    subcategory: e.target.value
                  })
                }
                className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg focus:border-blue-600 focus:outline-none"
                disabled={uploading}
              >
                <option value="">Select subcategory...</option>
                {categoryOptions[newProductForm.category].map((sub) => (
                  <option key={sub} value={sub}>
                    {sub}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Unit */}
          <div>
            <label className="block text-sm font-semibold mb-2">
              Unit *
            </label>
            <select
              value={newProductForm.unit}
              onChange={(e) =>
                setNewProductForm({ ...newProductForm, unit: e.target.value })
              }
              className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg focus:border-blue-600 focus:outline-none"
              disabled={uploading}
            >
              <option value="liter">Litre</option>
              <option value="kg">Kilogram (KG)</option>
              <option value="piece">Piece</option>
              <option value="dozen">Dozen</option>
            </select>
          </div>

          {/* Price */}
          <div>
            <label className="block text-sm font-semibold mb-2">
              Price (₹) *
            </label>
            <Input
              type="number"
              step="0.01"
              min="0"
              value={newProductForm.price}
              onChange={(e) =>
                setNewProductForm({ ...newProductForm, price: e.target.value })
              }
              placeholder="e.g., 60.00"
              disabled={uploading}
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-semibold mb-2">
              Description
            </label>
            <textarea
              value={newProductForm.description}
              onChange={(e) =>
                setNewProductForm({
                  ...newProductForm,
                  description: e.target.value
                })
              }
              placeholder="e.g., 100% pure cow milk"
              className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg focus:border-blue-600 focus:outline-none resize-none"
              rows="3"
              disabled={uploading}
            />
          </div>

          {/* Buttons */}
          <div className="flex gap-2 justify-end pt-4 border-t">
            <Button
              onClick={() => setShowCreateProductModal(false)}
              className="bg-gray-400 hover:bg-gray-500"
              disabled={uploading}
            >
              Cancel
            </Button>
            <Button
              onClick={handleCreateProduct}
              className="bg-green-600 hover:bg-green-700"
              disabled={uploading}
            >
              Create & Add Product
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
