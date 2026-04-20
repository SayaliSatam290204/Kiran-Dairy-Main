import { useState, useEffect } from "react";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import { Card } from "../../components/ui/Card.jsx";
import { Button } from "../../components/ui/Button.jsx";
import { Input } from "../../components/ui/Input.jsx";
import { Skeleton } from "../../components/ui/Skeleton.jsx";
import { adminApi } from "../../api/adminApi.js";

export const BatchDispatch = () => {
  const navigate = useNavigate();
  const [shops, setShops] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);

  const [selectedShops, setSelectedShops] = useState([]);
  const [customizePerShop, setCustomizePerShop] = useState(false);
  // Shared items (when not customizing per shop)
  const [sharedItems, setSharedItems] = useState([{ productId: "", quantity: "" }]);
  // Per-shop items (when customizing)
  const [perShopItems, setPerShopItems] = useState({});

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [shopsRes, productsRes] = await Promise.all([
        adminApi.getAllShops(),
        adminApi.getProducts()
      ]);

      console.log("Shops Response:", shopsRes);
      console.log("Products Response:", productsRes);

      const shopsData = Array.isArray(shopsRes.data.data) ? shopsRes.data.data : (Array.isArray(shopsRes.data) ? shopsRes.data : []);
      const productsData = Array.isArray(productsRes.data.data) ? productsRes.data.data : (Array.isArray(productsRes.data) ? productsRes.data : []);

      console.log("Shops Data:", shopsData);
      console.log("Products Data:", productsData);

      setShops(shopsData);
      setProducts(productsData);

      if (shopsData.length === 0) {
        toast.error("No shops available. Please create shops first.");
      }
    } catch (error) {
      console.error("Failed to load data:", error);
      toast.error(
        error.response?.data?.message || "Failed to load shops or products"
      );
    } finally {
      setLoading(false);
    }
  };

  const handleShopToggle = (shopId) => {
    setSelectedShops((prev) => {
      const updated = prev.includes(shopId)
        ? prev.filter((id) => id !== shopId)
        : [...prev, shopId];
      
      // If customizing per shop, initialize items for this shop if it's newly selected
      if (customizePerShop && updated.includes(shopId) && !perShopItems[shopId]) {
        setPerShopItems((prev) => ({
          ...prev,
          [shopId]: [{ productId: "", quantity: "" }]
        }));
      }
      
      return updated;
    });
  };

  const handleSharedItemChange = (index, field, value) => {
    const newItems = [...sharedItems];
    newItems[index] = { ...newItems[index], [field]: value };
    setSharedItems(newItems);
  };

  const handlePerShopItemChange = (shopId, index, field, value) => {
    const newItems = [...(perShopItems[shopId] || [])];
    newItems[index] = { ...newItems[index], [field]: value };
    setPerShopItems((prev) => ({
      ...prev,
      [shopId]: newItems
    }));
  };

  const addSharedItem = () => {
    setSharedItems([...sharedItems, { productId: "", quantity: "" }]);
  };

  const removeSharedItem = (index) => {
    setSharedItems(sharedItems.filter((_, i) => i !== index));
  };

  const addPerShopItem = (shopId) => {
    setPerShopItems((prev) => ({
      ...prev,
      [shopId]: [...(prev[shopId] || []), { productId: "", quantity: "" }]
    }));
  };

  const removePerShopItem = (shopId, index) => {
    setPerShopItems((prev) => ({
      ...prev,
      [shopId]: (prev[shopId] || []).filter((_, i) => i !== index)
    }));
  };

  const handleCustomizeToggle = (value) => {
    setCustomizePerShop(value);
    if (value && selectedShops.length > 0) {
      // Initialize per-shop items for all selected shops
      const newPerShopItems = {};
      selectedShops.forEach((shopId) => {
        newPerShopItems[shopId] = [{ productId: "", quantity: "" }];
      });
      setPerShopItems(newPerShopItems);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validation
    if (selectedShops.length < 1) {
      toast.error("Please select at least 1 shop");
      return;
    }

    if (customizePerShop) {
      // Validate per-shop items
      for (const shopId of selectedShops) {
        const items = perShopItems[shopId] || [];
        if (items.length === 0 || items.some((item) => !item.productId || !item.quantity)) {
          toast.error(`All shops must have items with quantities`);
          return;
        }
      }
    } else {
      // Validate shared items
      if (sharedItems.some((item) => !item.productId || !item.quantity)) {
        toast.error("All items must have product and quantity");
        return;
      }
    }

    try {
      setCreating(true);

      // Create dispatch for each shop (if per-shop) or single batch (if shared)
      if (customizePerShop) {
        // Create individual dispatch for each shop with its own items
        for (const shopId of selectedShops) {
          const items = perShopItems[shopId];
          const dispatchData = {
            shopId,
            items: items.map((item) => ({
              productId: item.productId,
              quantity: parseInt(item.quantity)
            }))
          };
          await adminApi.createDispatch(dispatchData);
        }
        toast.success(
          `Dispatches created successfully for ${selectedShops.length} shop(s)!`
        );
      } else {
        // Create separate dispatch for each shop with the same items so each shop confirms independently
        await Promise.all(
          selectedShops.map((shopId) => {
            const dispatchData = {
              shopId,
              items: sharedItems.map((item) => ({
                productId: item.productId,
                quantity: parseInt(item.quantity)
              }))
            };
            return adminApi.createDispatch(dispatchData);
          })
        );
        toast.success(
          `Dispatches created successfully for ${selectedShops.length} shop(s)!`
        );
      }

      // Reset form
      setSelectedShops([]);
      setSharedItems([{ productId: "", quantity: "" }]);
      setPerShopItems({});
      setCustomizePerShop(false);

      // Navigate to dispatch history
      setTimeout(() => navigate("/admin/dispatch-history"), 1500);
    } catch (error) {
      console.error("Failed to create dispatch:", error);
      toast.error(
        error.response?.data?.message || "Failed to create dispatch"
      );
    } finally {
      setCreating(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <h1 className="text-3xl font-bold">Dispatch</h1>
        <Skeleton className="h-64 w-full" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Dispatch</h1>
        <p className="text-sm text-gray-600 mt-1">
          Create a dispatch to one or more shops
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Shop Selection */}
        <Card>
          <h2 className="text-xl font-bold mb-4 text-gray-900">
            Select Shops ({selectedShops.length})
          </h2>

          {shops.length === 0 ? (
            <p className="text-gray-600 text-sm">No shops available</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {shops.map((shop) => (
                <label
                  key={shop._id}
                  className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg hover:bg-blue-50 cursor-pointer transition"
                >
                  <input
                    type="checkbox"
                    checked={selectedShops.includes(shop._id)}
                    onChange={() => handleShopToggle(shop._id)}
                    className="w-5 h-5 accent-blue-600"
                  />
                  <div className="flex-1">
                    <p className="font-medium text-gray-900">{shop.name}</p>
                    <p className="text-xs text-gray-600">{shop.location}</p>
                  </div>
                </label>
              ))}
            </div>
          )}
        </Card>

        {/* Customization Toggle */}
        {selectedShops.length > 0 && (
          <Card>
            <div className="flex items-center gap-4">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={customizePerShop}
                  onChange={(e) => handleCustomizeToggle(e.target.checked)}
                  className="w-5 h-5 accent-blue-600"
                />
                <span className="font-medium text-gray-900">
                  {customizePerShop ? "Customize items per shop" : "Same items for all shops"}
                </span>
              </label>
              <p className="text-sm text-gray-600">
                {customizePerShop
                  ? "Each shop gets different items/quantities"
                  : "All shops get the same items/quantities"}
              </p>
            </div>
          </Card>
        )}

        {/* Items Section */}
        {selectedShops.length > 0 && (
          <>
            {customizePerShop ? (
              /* Per-Shop Items */
              <>
                {selectedShops.map((shopId) => {
                  const shop = shops.find((s) => s._id === shopId);
                  const items = perShopItems[shopId] || [];

                  return (
                    <Card key={shopId} className="border-left-4 border-blue-500">
                      <h3 className="text-lg font-bold mb-4 text-gray-900">
                        Items for {shop?.name}
                      </h3>

                      {items.length === 0 ? (
                        <p className="text-gray-600 text-sm mb-4">No items added</p>
                      ) : (
                        <div className="space-y-3 mb-4">
                          {items.map((item, idx) => (
                            <div
                              key={idx}
                              className="flex gap-3 items-start border border-gray-200 rounded-lg p-3 bg-gray-50"
                            >
                              <div className="flex-1">
                                <label className="block text-xs font-medium text-gray-700 mb-1">
                                  Product
                                </label>
                                <select
                                  value={item.productId}
                                  onChange={(e) =>
                                    handlePerShopItemChange(
                                      shopId,
                                      idx,
                                      "productId",
                                      e.target.value
                                    )
                                  }
                                  className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                >
                                  <option value="">Select Product</option>
                                  {products.map((product) => (
                                    <option key={product._id} value={product._id}>
                                      {product.name} (SKU: {product.sku})
                                    </option>
                                  ))}
                                </select>
                              </div>

                              <div className="w-32">
                                <label className="block text-xs font-medium text-gray-700 mb-1">
                                  Quantity
                                </label>
                                <input
                                  type="number"
                                  value={item.quantity}
                                  onChange={(e) =>
                                    handlePerShopItemChange(
                                      shopId,
                                      idx,
                                      "quantity",
                                      e.target.value
                                    )
                                  }
                                  placeholder="0"
                                  min="1"
                                  className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                              </div>

                              <button
                                type="button"
                                onClick={() => removePerShopItem(shopId, idx)}
                                className="mt-6 px-3 py-2 bg-red-100 hover:bg-red-200 text-red-700 rounded text-sm font-medium transition-colors"
                              >
                                Remove
                              </button>
                            </div>
                          ))}
                        </div>
                      )}

                      <button
                        type="button"
                        onClick={() => addPerShopItem(shopId)}
                        className="w-full px-4 py-2 border-2 border-dashed border-gray-300 hover:border-blue-400 text-gray-700 rounded-lg text-sm font-medium transition-colors"
                      >
                        + Add Item
                      </button>
                    </Card>
                  );
                })}
              </>
            ) : (
              /* Shared Items */
              <Card>
                <h2 className="text-xl font-bold mb-4 text-gray-900">
                  Dispatch Items
                </h2>

                {sharedItems.length === 0 ? (
                  <p className="text-gray-600 text-sm mb-4">No items added</p>
                ) : (
                  <div className="space-y-3 mb-4">
                    {sharedItems.map((item, idx) => (
                      <div
                        key={idx}
                        className="flex gap-3 items-start border border-gray-200 rounded-lg p-3 bg-gray-50"
                      >
                        <div className="flex-1">
                          <label className="block text-xs font-medium text-gray-700 mb-1">
                            Product
                          </label>
                          <select
                            value={item.productId}
                            onChange={(e) =>
                              handleSharedItemChange(idx, "productId", e.target.value)
                            }
                            className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                          >
                            <option value="">Select Product</option>
                            {products.map((product) => (
                              <option key={product._id} value={product._id}>
                                {product.name} (SKU: {product.sku})
                              </option>
                            ))}
                          </select>
                        </div>

                        <div className="w-32">
                          <label className="block text-xs font-medium text-gray-700 mb-1">
                            Quantity
                          </label>
                          <input
                            type="number"
                            value={item.quantity}
                            onChange={(e) =>
                              handleSharedItemChange(idx, "quantity", e.target.value)
                            }
                            placeholder="0"
                            min="1"
                            className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                        </div>

                        <button
                          type="button"
                          onClick={() => removeSharedItem(idx)}
                          className="mt-6 px-3 py-2 bg-red-100 hover:bg-red-200 text-red-700 rounded text-sm font-medium transition-colors"
                        >
                          Remove
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                <button
                  type="button"
                  onClick={addSharedItem}
                  className="w-full px-4 py-2 border-2 border-dashed border-gray-300 hover:border-blue-400 text-gray-700 rounded-lg text-sm font-medium transition-colors"
                >
                  + Add Item
                </button>
              </Card>
            )}
          </>
        )}

        {/* Summary */}
        {selectedShops.length > 0 && (
          <Card className="bg-blue-50 border-blue-200">
            <h3 className="font-semibold text-gray-900 mb-3">
              Dispatch Summary
            </h3>
            <div className="space-y-2 text-sm">
              <p>
                <span className="font-medium">Shops:</span> {selectedShops.length}{" "}
                ({shops
                  .filter((s) => selectedShops.includes(s._id))
                  .map((s) => s.name)
                  .join(", ")})
              </p>
              {customizePerShop ? (
                <p>
                  <span className="font-medium">Mode:</span> Each shop gets
                  customized items
                </p>
              ) : (
                <>
                  <p>
                    <span className="font-medium">Items:</span> {sharedItems.length}{" "}
                    product(s)
                  </p>
                  <p>
                    <span className="font-medium">Units per shop:</span>{" "}
                    {sharedItems.reduce(
                      (sum, item) => sum + (parseInt(item.quantity) || 0),
                      0
                    )}
                  </p>
                </>
              )}
            </div>
          </Card>
        )}

        {/* Action Buttons */}
        <Card>
          <div className="flex gap-3 justify-end">
            <Button
              type="button"
              onClick={() => navigate("/admin/dashboard")}
              className="bg-gray-300 hover:bg-gray-400 text-gray-900 px-6 py-2"
              disabled={creating}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2"
              disabled={
                creating ||
                selectedShops.length < 1 ||
                (customizePerShop
                  ? Object.values(perShopItems).some(
                      (items) =>
                        !items ||
                        items.length === 0 ||
                        items.some((item) => !item.productId || !item.quantity)
                    )
                  : sharedItems.some((item) => !item.productId || !item.quantity))
              }
            >
              {creating ? "Creating..." : "Create Dispatch"}
            </Button>
          </div>
        </Card>
      </form>
    </div>
  );
};
