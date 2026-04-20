import { useState, useEffect } from "react";
import toast from "react-hot-toast";
import { Card } from "../../components/ui/Card.jsx";
import { DataTable } from "../../components/common/DataTable.jsx";
import { Skeleton } from "../../components/ui/Skeleton.jsx";
import { Badge } from "../../components/ui/Badge.jsx";
import { Modal } from "../../components/ui/Modal.jsx";
import { shopApi } from "../../api/shopApi.js";
import { formatCurrency } from "../../utils/formatCurrency.js";
import { formatDate } from "../../utils/formatDate.js";

export const Inventory = () => {
  const LOW_STOCK_THRESHOLD = 20;
  const [inventory, setInventory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [summary, setSummary] = useState({
    totalProducts: 0,
    totalUnits: 0,
    lowStockCount: 0,
    outOfStockCount: 0
  });

  const [showRestockModal, setShowRestockModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [restockQty, setRestockQty] = useState('');

  useEffect(() => {
    const fetchInventory = async () => {
      try {
        const response = await shopApi.getInventory();
        const inventoryData = response.data.data || [];
        setInventory(inventoryData);

        // Calculate summary
        let lowStock = 0;
        let outOfStock = 0;
        let totalUnits = 0;

        inventoryData.forEach((item) => {
          totalUnits += item.quantity || 0;
          if (item.quantity === 0) {
            outOfStock++;
          } else if (item.quantity <= LOW_STOCK_THRESHOLD) {
            lowStock++;
          }
        });

        setSummary({
          totalProducts: inventoryData.length,
          totalUnits,
          lowStockCount: lowStock,
          outOfStockCount: outOfStock
        });
      } catch (error) {
        console.error("Failed to fetch inventory:", error);
        toast.error(error.response?.data?.message || "Failed to load inventory");
      } finally {
        setLoading(false);
      }
    };

    fetchInventory();
  }, []);

  const getStockColor = (quantity) => {
    if (quantity === 0) return "red";
    if (quantity <= LOW_STOCK_THRESHOLD) return "yellow";
    return "green";
  };

  const getStockLabel = (quantity) => {
    if (quantity === 0) return "OUT OF STOCK";
    if (quantity <= LOW_STOCK_THRESHOLD) return "LOW STOCK";
    return "IN STOCK";
  };

  const handleRestockRequest = (row) => {
    if (row.quantity > LOW_STOCK_THRESHOLD) return;
    setSelectedProduct(row);
    setRestockQty('');
    setShowRestockModal(true);
  };

  const submitRestockRequest = async (e) => {
    e.preventDefault();
    if (!selectedProduct || !restockQty || parseInt(restockQty) < 1) {
      toast.error('Enter valid quantity');
      return;
    }

    try {
      await shopApi.createRestockRequest({
        productId: selectedProduct.productId._id,
        requestedQty: parseInt(restockQty),
        notes: `Current stock: ${selectedProduct.quantity}`
      });
      toast.success('Restock request sent to admin!');
      setShowRestockModal(false);
      setSelectedProduct(null);
      setRestockQty('');
    } catch (error) {
      toast.error('Failed to send request. Server error.');
    }
  };

  const columns = [
    { 
      key: "productName", 
      label: "Product Name", 
      render: (val, row) => (
        <div>
          <p className="font-semibold text-gray-900">{row.productId?.name || "-"}</p>
          <p className="text-xs text-gray-500">SKU: {row.productId?.sku || "N/A"}</p>
        </div>
      )
    },
    { 
      key: "quantity", 
      label: "Available Quantity",
      render: (val, row) => (
        <div className="flex items-center gap-2">
          <span className="font-bold text-lg">{val || 0}</span>
          {row.quantity <= LOW_STOCK_THRESHOLD && (
            <Badge variant="yellow" className="cursor-pointer text-xs" onClick={(e) => {
              e.stopPropagation();
              handleRestockRequest(row);
            }}>
              Request Restock
            </Badge>
          )}
        </div>
      )
    },
    { 
      key: "price", 
      label: "Unit Price", 
      render: (val, row) => formatCurrency(row.productId?.price || 0) 
    },
    {
      key: "status",
      label: "Stock Status",
      render: (val, row) => (
        <Badge variant={getStockColor(row.quantity)}>
          {getStockLabel(row.quantity)}
        </Badge>
      ),
    },
    {
      key: "category",
      label: "Category",
      render: (val, row) => row.productId?.category || "-"
    },
    {
      key: "lastUpdated",
      label: "Last Updated",
      render: (val) => formatDate(val) || "-"
    }
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Inventory Management</h1>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
          <div>
            <p className="text-sm font-medium text-gray-600 mb-2">Total Products</p>
            <p className="text-3xl font-bold text-blue-600">{summary.totalProducts}</p>
            <p className="text-xs text-gray-500 mt-1">Different products</p>
          </div>
        </Card>

        <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
          <div>
            <p className="text-sm font-medium text-gray-600 mb-2">Total Units</p>
            <p className="text-3xl font-bold text-green-600">{summary.totalUnits}</p>
            <p className="text-xs text-gray-500 mt-1">In stock</p>
          </div>
        </Card>

        <Card className="bg-gradient-to-br from-yellow-50 to-yellow-100 border-yellow-200">
          <div>
            <p className="text-sm font-medium text-gray-600 mb-2">Low Stock</p>
            <p className="text-3xl font-bold text-yellow-600">{summary.lowStockCount}</p>
            <p className="text-xs text-gray-500 mt-1">20 units or less</p>
          </div>
        </Card>

        <Card className="bg-gradient-to-br from-red-50 to-red-100 border-red-200">
          <div>
            <p className="text-sm font-medium text-gray-600 mb-2">Out of Stock</p>
            <p className="text-3xl font-bold text-red-600">{summary.outOfStockCount}</p>
            <p className="text-xs text-gray-500 mt-1">No stock</p>
          </div>
        </Card>
      </div>

      {/* Inventory Table */}
      <Card>
        {loading ? (
          <div className="space-y-3">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-64 w-full" />
          </div>
        ) : (
          <DataTable
            columns={columns}
            data={inventory}
            onRowClick={handleRestockRequest}
            emptyState={
              <div>
                <div className="text-lg font-semibold">No products in inventory</div>
                <div className="text-sm mt-1">Wait for admin dispatch to receive stock.</div>
              </div>
            }
          />
        )}
      </Card>

      {/* Restock Request Modal */}
      <Modal isOpen={showRestockModal} title="Request Restock" onClose={() => setShowRestockModal(false)}>
        {selectedProduct && (
          <form onSubmit={submitRestockRequest} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Product</label>
              <div className="bg-gray-50 p-3 rounded-lg">
                <p className="font-semibold">{selectedProduct.productId?.name}</p>
                <p className="text-sm text-gray-600">Current: {selectedProduct.quantity} units</p>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Quantity Needed</label>
              <input
                type="number"
                min="1"
                value={restockQty}
                onChange={(e) => setRestockQty(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Enter quantity needed"
                required
              />
            </div>
            <textarea
              placeholder="Additional notes (optional)"
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              rows="3"
              maxLength="200"
            />
            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={() => setShowRestockModal(false)}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
              >
                Send Request
              </button>
            </div>
          </form>
        )}
      </Modal>

      {/* Stock Status Info */}
      {inventory.length > 0 && (
        <Card className="bg-blue-50 border-blue-200">
          <h3 className="font-semibold text-gray-900 mb-3">Stock Information</h3>
          <ul className="space-y-2 text-sm text-gray-700">
            <li>
              <span className="font-medium">Green (IN STOCK):</span> 20+ units
            </li>
            <li>
              <span className="font-medium">Yellow (LOW STOCK):</span> {'<20 units - '}<span className="font-bold">Click "Request Restock"</span>
            </li>


            <li>
              <span className="font-medium">Red (OUT OF STOCK):</span> 0 units - Request urgently
            </li>
          </ul>
        </Card>
      )}
    </div>
  );
};

