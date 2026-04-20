import { useState, useEffect } from "react";
import toast from "react-hot-toast";
import { Card } from "../../components/ui/Card.jsx";
import { Button } from "../../components/ui/Button.jsx";
import { Modal } from "../../components/ui/Modal.jsx";
import { Input } from "../../components/ui/Input.jsx";
import { DataTable } from "../../components/common/DataTable.jsx";
import { Skeleton } from "../../components/ui/Skeleton.jsx";
import { Badge } from "../../components/ui/Badge.jsx";
import { returnApi } from "../../api/returnApi.js";
import { formatDate } from "../../utils/formatDate.js";
import { formatCurrency } from "../../utils/formatCurrency.js";

const RETURN_REASONS = {
  damaged: "Damaged",
  expired: "Expired",
  excess: "Excess Stock"
};

export const Returns = () => {
  const [returns, setReturns] = useState([]);
  const [loading, setLoading] = useState(true);

  // Action modal state
  const [actionModal, setActionModal] = useState({
    isOpen: false,
    type: null, // 'approve' or 'reject'
    returnId: null,
    returnData: null,
    rejectionReason: ""
  });

  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    fetchReturns();
    const interval = setInterval(fetchReturns, 10000); // Refresh every 10 seconds
    return () => clearInterval(interval);
  }, []);

  const fetchReturns = async () => {
    try {
      const response = await returnApi.getAll();
      setReturns(response.data.data || []);
    } catch (error) {
      console.error("Failed to fetch returns:", error);
      toast.error(error.response?.data?.message || "Failed to load returns");
    } finally {
      setLoading(false);
    }
  };

  const handleActionClick = (returnId, action) => {
    const returnData = returns.find(r => r._id === returnId);
    setActionModal({
      isOpen: true,
      type: action,
      returnId,
      returnData,
      rejectionReason: ""
    });
  };

  const handleConfirmAction = async () => {
    setProcessing(true);

    try {
      const status = actionModal.type === "approve" ? "approved" : "rejected";
      const payload = { status };

      if (actionModal.type === "reject") {
        if (!actionModal.rejectionReason.trim()) {
          toast.error("Please provide a rejection reason");
          setProcessing(false);
          return;
        }
        payload.rejectionReason = actionModal.rejectionReason;
      }

      await returnApi.updateStatus(actionModal.returnId, payload);

      toast.success(
        `Return ${status} successfully${
          actionModal.type === "reject" ? " with reason notification" : ""
        }`
      );

      setActionModal({ isOpen: false, type: null, returnId: null, returnData: null, rejectionReason: "" });
      fetchReturns();
    } catch (error) {
      console.error("Error processing return:", error);
      toast.error(error.response?.data?.message || "Failed to process return");
    } finally {
      setProcessing(false);
    }
  };

  const getStatusBadge = (status) => {
    const statusMap = {
      pending: "blue",
      approved: "green",
      rejected: "red"
    };
    return (
      <Badge variant={statusMap[status] || "gray"}>
        {status?.toUpperCase()}
      </Badge>
    );
  };

  const columns = [
    { key: "returnNo", label: "Return No" },

    {
      key: "shopId",
      label: "Shop",
      render: (val) => val?.name || "N/A"
    },

    {
      key: "status",
      label: "Status",
      render: (val) => getStatusBadge(val)
    },

    {
      key: "itemCount",
      label: "Items",
      render: (items) => (Array.isArray(items) ? items.length : 0)
    },

    {
      key: "products",
      label: "Products",
      render: (items) =>
        Array.isArray(items) && items.length
          ? items
              .map((it) => `${it?.productId?.name || "Product"} x${it.quantity}`)
              .join(" | ")
          : "—"
    },

    {
      key: "reasons",
      label: "Reasons",
      render: (items) =>
        Array.isArray(items) && items.length
          ? items
              .map((it) => RETURN_REASONS[it.reason] || it.reason)
              .join(", ")
          : "—"
    },

    {
      key: "totalRefund",
      label: "Refund Amount",
      render: (val) => formatCurrency(val || 0)
    },

    {
      key: "returnDate",
      label: "Request Date",
      render: (val) => formatDate(val)
    },

    {
      key: "_id",
      label: "Actions",
      render: (_, row) => {
        if (row.status !== "pending") {
          return <span className="text-gray-500 text-sm">—</span>;
        }

        return (
          <div className="flex gap-2">
            <button
              onClick={() => handleActionClick(row._id, "approve")}
              className="px-3 py-1 bg-green-600 hover:bg-green-700 text-white text-sm rounded font-semibold transition"
            >
              ✓ Accept
            </button>
            <button
              onClick={() => handleActionClick(row._id, "reject")}
              className="px-3 py-1 bg-red-600 hover:bg-red-700 text-white text-sm rounded font-semibold transition"
            >
              ✕ Reject
            </button>
          </div>
        );
      }
    }
  ];

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Returns Management</h1>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="p-4">
          <div className="text-sm text-gray-600 mb-1">Pending Returns</div>
          <div className="text-3xl font-bold text-blue-600">
            {returns.filter((r) => r.status === "pending").length}
          </div>
        </Card>

        <Card className="p-4">
          <div className="text-sm text-gray-600 mb-1">Approved</div>
          <div className="text-3xl font-bold text-green-600">
            {returns.filter((r) => r.status === "approved").length}
          </div>
        </Card>

        <Card className="p-4">
          <div className="text-sm text-gray-600 mb-1">Rejected</div>
          <div className="text-3xl font-bold text-red-600">
            {returns.filter((r) => r.status === "rejected").length}
          </div>
        </Card>
      </div>

      {/* Returns Table */}
      <Card>
        {loading ? (
          <div className="space-y-3">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-64 w-full" />
          </div>
        ) : (
          <DataTable
            columns={columns}
            data={returns}
            emptyState={
              <div>
                <div className="text-lg font-semibold">No returns yet</div>
                <div className="text-sm mt-1">
                  Return requests from all shops will appear here.
                </div>
              </div>
            }
          />
        )}
      </Card>

      {/* Action Modal */}
      {actionModal.isOpen && (
        <Modal
          isOpen={actionModal.isOpen}
          onClose={() =>
            setActionModal({ isOpen: false, type: null, returnId: null, returnData: null, rejectionReason: "" })
          }
          title={
            actionModal.type === "approve"
              ? "Accept Return Request"
              : "Reject Return Request"
          }
        >
          <div className="space-y-4">
            {/* Products Summary */}
            {actionModal.returnData?.items && actionModal.returnData.items.length > 0 && (
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                <h3 className="font-semibold text-gray-900 mb-3">Return Products</h3>
                <div className="space-y-2">
                  {actionModal.returnData.items.map((item, idx) => (
                    <div key={idx} className="flex justify-between items-start text-sm">
                      <div className="flex-1">
                        <p className="font-medium text-gray-900">{item?.productId?.name || "Product"}</p>
                        <p className="text-xs text-gray-600">Quantity: {item.quantity}</p>
                        <p className="text-xs text-gray-600">Reason: <span className="font-semibold">{RETURN_REASONS[item.reason] || item.reason}</span></p>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="border-t border-gray-300 mt-3 pt-3">
                  <p className="text-sm font-semibold text-gray-900">
                    Refund Amount: {formatCurrency(actionModal.returnData.totalRefund || 0)}
                  </p>
                </div>
              </div>
            )}

            {actionModal.type === "approve" ? (
              <>
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <p className="text-sm text-green-700">
                    ✓ This will <strong>approve the return</strong> and remove the returned products from the shop's inventory (products go back to farm).
                  </p>
                </div>

                <div className="flex gap-3 pt-6 border-t border-gray-200">
                  <Button
                    onClick={handleConfirmAction}
                    disabled={processing}
                    className="flex-1 bg-green-600 hover:bg-green-700 text-white py-2 rounded-md font-semibold"
                  >
                    {processing ? "Processing..." : "✓ Accept Return"}
                  </Button>

                  <Button
                    onClick={() =>
                      setActionModal({
                        isOpen: false,
                        type: null,
                        returnId: null,
                        returnData: null,
                        rejectionReason: ""
                      })
                    }
                    className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-900 py-2 rounded-md font-semibold"
                  >
                    Cancel
                  </Button>
                </div>
              </>
            ) : (
              <>
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <p className="text-sm text-red-700">
                    ✕ This will <strong>reject the return request</strong>. The shop will be notified with your reason.
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Rejection Reason *
                  </label>
                  <textarea
                    value={actionModal.rejectionReason}
                    onChange={(e) =>
                      setActionModal({
                        ...actionModal,
                        rejectionReason: e.target.value
                      })
                    }
                    placeholder="E.g., 'Items are still within warranty period' or 'Quantity mismatch'"
                    rows="3"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                  />
                </div>

                <div className="flex gap-3 pt-6 border-t border-gray-200">
                  <Button
                    onClick={handleConfirmAction}
                    disabled={processing}
                    className="flex-1 bg-red-600 hover:bg-red-700 text-white py-2 rounded-md font-semibold"
                  >
                    {processing ? "Processing..." : "✕ Reject Return"}
                  </Button>

                  <Button
                    onClick={() =>
                      setActionModal({
                        isOpen: false,
                        type: null,
                        returnId: null,
                        returnData: null,
                        rejectionReason: ""
                      })
                    }
                    className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-900 py-2 rounded-md font-semibold"
                  >
                    Cancel
                  </Button>
                </div>
              </>
            )}
          </div>
        </Modal>
      )}
    </div>
  );
};