import { useState, useEffect } from "react";
import toast from "react-hot-toast";
import { FaCheckCircle, FaExclamationTriangle, FaTruck } from "react-icons/fa";
import { adminApi } from "../../api/adminApi.js";
import { dispatchApi } from "../../api/dispatchApi.js";
import { Card } from "../../components/ui/Card.jsx";
import { Badge } from "../../components/ui/Badge.jsx";
import { formatCurrency } from "../../utils/formatCurrency.js";
import { formatDate } from "../../utils/formatDate.js";


export const StockAlerts = () => {
  const [activeTab, setActiveTab] = useState('stock'); // 'stock' | 'requests'
  const [stockAlerts, setStockAlerts] = useState([]);
  const [requestAlerts, setRequestAlerts] = useState([]);
  const [alertCount, setAlertCount] = useState({
    totalAlerts: 0,
    criticalCount: 0,
    lowCount: 0,
    pendingRequests: 0
  });
  const [loading, setLoading] = useState(false);
  const [filterShop, setFilterShop] = useState("");
  const [shops, setShops] = useState([]);

  useEffect(() => {
    fetchAlertCounts();
    fetchStockAlerts();
    fetchShops();
    fetchRestockRequests();

    const interval = setInterval(() => {
      fetchAlertCounts();
      fetchStockAlerts();
      fetchRestockRequests();
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (filterShop) {
      fetchStockAlerts(filterShop);
      fetchRestockRequests(filterShop);
    }
  }, [filterShop]);

  const fetchShops = async () => {
    try {
      const response = await adminApi.getAllShops();
      setShops(response.data.data || []);
    } catch (error) {
      console.error("Failed to fetch shops:", error);
    }
  };

  const fetchAlertCounts = async () => {
    try {
      const response = await adminApi.getAlertCount();
      setAlertCount({
        ...response.data.data,
        pendingRequests: 0 // Update with real count later
      });
    } catch (error) {
      console.error("Failed to fetch alert count:", error);
    }
  };

  const fetchStockAlerts = async (shopId = "") => {
    try {
      setLoading(true);
      const response = await adminApi.getStockAlerts(shopId || undefined);
      setStockAlerts(response.data.data || []);
    } catch (error) {
      toast.error("Failed to fetch stock alerts");
    } finally {
      setLoading(false);
    }
  };

  const fetchRestockRequests = async (shopId = "") => {
    try {
      setLoading(true);
      const response = await adminApi.getRestockRequests({ shopId: shopId || undefined });
      setRequestAlerts(response.data.data || []);
    } catch (error) {
      toast.error("Failed to fetch restock requests");
    } finally {
      setLoading(false);
    }
  };

  const LOW_STOCK_THRESHOLD = 20;

  const getAlertColor = (quantity) => {
    if (quantity === 0) return "bg-red-50 border-red-200";
    if (quantity <= 5) return "bg-orange-50 border-orange-200";
    if (quantity <= LOW_STOCK_THRESHOLD) return "bg-yellow-50 border-yellow-200";
    return "bg-green-50 border-green-200";
  };

  const getRequestStatusBadge = (status) => {
    switch (status) {
      case 'pending':
        return <Badge variant="yellow">Pending</Badge>;
      case 'approved':
        return <Badge variant="green">Approved</Badge>;
      case 'rejected':
        return <Badge variant="red">Rejected</Badge>;
      default:
        return <Badge variant="gray">Unknown</Badge>;
    }
  };

  const quickDispatch = async (request) => {
    try {
      const dispatchData = {
        shopId: request.shopId._id,
        items: [{
          productId: request.productId._id,
          quantity: request.requestedQty
        }],
        dispatchNotes: `Quick dispatch for restock request #${request._id.substring(0,8)} - Requested by ${request.shopId.name}`,
        deliveryTime: 24
      };

      await dispatchApi.create(dispatchData);
      await adminApi.updateRestockRequestStatus(request._id, { status: 'approved' });

      toast.success(`Quick dispatch created for ${request.requestedQty} units to ${request.shopId.name}`);
      fetchRestockRequests(filterShop);
    } catch (error) {
      toast.error('Failed to create dispatch');
      console.error(error);
    }
  };


  const currentData = activeTab === 'stock' ? stockAlerts : requestAlerts;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">
          {activeTab === 'stock' ? 'Stock Alerts' : 'Shop Restock Requests'}
        </h1>
        <div className="text-sm text-gray-600">
          Last updated: {new Date().toLocaleTimeString()}
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-yellow-50 to-yellow-100 border-yellow-300">
          <div>
            <div className="text-sm text-gray-600">Low Stock Items</div>
            <div className="text-4xl font-bold text-yellow-700 mt-2">
              {alertCount.totalAlerts}
            </div>
          </div>
        </Card>
        <Card className="bg-gradient-to-br from-red-50 to-red-100 border-red-300">
          <div>
            <div className="text-sm text-gray-600">Critical</div>
            <div className="text-4xl font-bold text-red-700 mt-2">
              {alertCount.criticalCount}
            </div>
          </div>
        </Card>
        <Card className="bg-gradient-to-br from-orange-50 to-orange-100 border-orange-300">
          <div>
            <div className="text-sm text-gray-600">Pending Requests</div>
            <div className="text-4xl font-bold text-orange-700 mt-2">
              {requestAlerts.length}
            </div>
          </div>
        </Card>
        <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-300">
          <div>
            <div className="text-sm text-gray-600">Filter:</div>
            <select
              value={filterShop}
              onChange={(e) => setFilterShop(e.target.value)}
              className="mt-2 px-3 py-1 border rounded focus:ring-2 focus:ring-blue-500 bg-white"
            >
              <option value="">All Shops</option>
              {shops.map((shop) => (
                <option key={shop._id} value={shop._id}>
                  {shop.name}
                </option>
              ))}
            </select>
          </div>
        </Card>
      </div>

      {/* Tab Switcher */}
      <Card>
        <div className="flex border-b">
          <button
            className={`px-6 py-3 font-semibold border-b-2 ${
              activeTab === 'stock'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-600 hover:text-gray-900'
            }`}
            onClick={() => setActiveTab('stock')}
          >
            Stock Alerts ({stockAlerts.length})
          </button>
          <button
            className={`px-6 py-3 font-semibold border-b-2 ${
              activeTab === 'requests'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-600 hover:text-gray-900'
            }`}
            onClick={() => setActiveTab('requests')}
          >
            Shop Requests ({requestAlerts.length})
          </button>
        </div>
      </Card>

      {/* Content */}
      {loading ? (
        <Card>
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p>Loading {activeTab === 'stock' ? 'stock alerts...' : 'requests...'}</p>
          </div>
        </Card>
      ) : currentData.length === 0 ? (
        <Card>
          <div className="text-center py-12">
            <FaCheckCircle className="text-6xl text-green-500 mx-auto mb-4" />
            <p className="text-xl font-semibold text-gray-600">
              {activeTab === 'stock' 
                ? 'No low stock items!' 
                : 'No pending restock requests!'
              }
            </p>
            <p className="text-gray-500 mt-2">
              {activeTab === 'stock' 
                ? 'All products have healthy stock levels.' 
                : 'All shops have sufficient stock or requests resolved.'
              }
            </p>
          </div>
        </Card>
      ) : (
        <div className="space-y-4">
          {currentData.map((item) => (
            <Card key={item._id} className="p-6 hover:shadow-md transition-shadow">
              <div className="flex justify-between items-start mb-4">
                <div className="flex-1">
                  <h3 className="text-xl font-bold">{item.productId?.name || item.productId?.sku}</h3>
                  <p className="text-sm text-gray-600 mb-1">
                    {item.shopId?.name} • {item.shopId?.location}
                  </p>
                  {activeTab === 'requests' && (
                    <div className="flex gap-2 mt-2">
                      <Badge variant="orange">Requested: {item.requestedQty} units</Badge>
                      {getRequestStatusBadge(item.status)}
                    </div>
                  )}
                </div>
                <div className="text-right">
                  <div className="text-3xl font-bold">
                    {item.quantity || item.currentQty || 0}
                  </div>
                  <div className="text-xs text-gray-500">
                    units
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                <div>
                  <div className="text-xs text-gray-600 uppercase tracking-wide">Unit Price</div>
                  <div className="font-bold text-lg text-green-600">
                    {formatCurrency(item.productId?.price || 0)}
                  </div>
                </div>
                <div>
                  <div className="text-xs text-gray-600 uppercase tracking-wide">Category</div>
                  <Badge>{item.productId?.category}</Badge>
                </div>
                <div>
                  <div className="text-xs text-gray-600 uppercase tracking-wide">Requested</div>
                  <div className="font-bold text-lg">
                    {activeTab === 'requests' ? item.requestedQty : 'N/A'}
                  </div>
                </div>
                <div>
                  <div className="text-xs text-gray-600 uppercase tracking-wide">Date</div>
                  <div className="text-sm">
                    {formatDate(item.createdAt || item.lastUpdated)}
                  </div>
                </div>
              </div>

              {/* Quick Action Button */}
              {activeTab === 'requests' && item.status === 'pending' && (
                <div className="flex gap-3 pt-4 border-t">
                  <button
                    onClick={() => quickDispatch(item)}
                    className="flex-1 bg-gradient-to-r from-green-500 to-green-600 text-white py-3 px-6 rounded-lg font-semibold hover:from-green-600 hover:to-green-700 flex items-center gap-2 justify-center shadow-lg hover:shadow-xl transition-all"
                  >
                    <FaTruck />
                    Quick Dispatch
                  </button>
                  <button
                    className="px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 font-semibold"
                    onClick={() => {
                      // Mark as rejected
                      toast('Reject functionality coming soon');
                    }}
                  >
                    Reject
                  </button>
  when               </div>
              )}
            </Card>
          ))}
        </div>
      )}

      {/* Legend */}
      <Card className="bg-gray-50 p-6">
        <h3 className="font-semibold mb-4">Legend</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div>
            <h4 className="font-medium mb-2">Stock Status</h4>
            <div className="flex gap-2 flex-wrap">
              <Badge variant="red" className="text-xs">OUT OF STOCK</Badge>
              <Badge variant="orange" className="text-xs">CRITICAL (≤5)</Badge>
              <Badge variant="yellow" className="text-xs">LOW STOCK (≤20)</Badge>
            </div>
          </div>
          <div>
            <h4 className="font-medium mb-2">Request Status</h4>
            <div className="flex gap-2 flex-wrap">
              <Badge variant="yellow" className="text-xs">Pending</Badge>
              <Badge variant="green" className="text-xs">Approved</Badge>
              <Badge variant="red" className="text-xs">Rejected</Badge>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
};

