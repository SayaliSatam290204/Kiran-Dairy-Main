import { useState, useEffect } from "react";
import toast from "react-hot-toast";
import { Card } from "../../components/ui/Card.jsx";
import { Button } from "../../components/ui/Button.jsx";
import { Badge } from "../../components/ui/Badge.jsx";
import { Modal } from "../../components/ui/Modal.jsx";
import { Input } from "../../components/ui/Input.jsx";
import { Skeleton } from "../../components/ui/Skeleton.jsx";
import { dispatchApi } from "../../api/dispatchApi.js";
import { formatDate } from "../../utils/formatDate.js";
import { useAuth } from "../../hooks/useAuth.js";

export const DispatchConfirmation = () => {
  const { user } = useAuth();
  const [dispatches, setDispatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedDispatch, setSelectedDispatch] = useState(null);
  const [confirmModal, setConfirmModal] = useState(false);
  const [receivedNotes, setReceivedNotes] = useState("");
  const [confirming, setConfirming] = useState(false);
  const [filter, setFilter] = useState("all"); // all, pending, received

  useEffect(() => {
    fetchDispatches();
  }, [user.shopId]);

  const fetchDispatches = async () => {
    try {
      setLoading(true);
      const response = await dispatchApi.getByShop(user.shopId);
      setDispatches(response.data.data || []);
    } catch (error) {
      console.error("Failed to fetch dispatches:", error);
      toast.error(
        error.response?.data?.message || "Failed to load dispatches"
      );
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case "received":
        return "green";
      case "dispatched":
        return "blue";
      case "pending":
        return "yellow";
      case "created":
        return "gray";
      default:
        return "gray";
    }
  };

  const handleConfirmReceipt = async () => {
    if (!selectedDispatch) return;

    try {
      setConfirming(true);
      await dispatchApi.updateStatus(selectedDispatch._id, {
        status: "received",
        receivedNotes: receivedNotes || undefined,
        confirmedBy: user?.id
      });

      toast.success("Dispatch confirmed as received!");
      setConfirmModal(false);
      setReceivedNotes("");
      setSelectedDispatch(null);
      await fetchDispatches();
    } catch (error) {
      console.error("Failed to confirm dispatch:", error);
      toast.error(
        error.response?.data?.message ||
          "Failed to confirm dispatch receipt"
      );
    } finally {
      setConfirming(false);
    }
  };

  const filteredDispatches = dispatches.filter((dispatch) => {
    if (filter === "all") return true;
    if (filter === "pending")
      return dispatch.status !== "received" &&
        dispatch.status !== "rejected";
    if (filter === "received") return dispatch.status === "received";
    return true;
  });

  const pendingCount = dispatches.filter(
    (d) => d.status !== "received" && d.status !== "rejected"
  ).length;
  const receivedCount = dispatches.filter((d) => d.status === "received").length;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Dispatch Confirmation</h1>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
          <div>
            <p className="text-sm font-medium text-gray-600 mb-2">
              Total Dispatches
            </p>
            <p className="text-3xl font-bold text-blue-600">{dispatches.length}</p>
            <p className="text-xs text-gray-500 mt-1">All dispatch records</p>
          </div>
        </Card>

        <Card className="bg-gradient-to-br from-yellow-50 to-yellow-100 border-yellow-200">
          <div>
            <p className="text-sm font-medium text-gray-600 mb-2">
              Pending Confirmation
            </p>
            <p className="text-3xl font-bold text-yellow-600">{pendingCount}</p>
            <p className="text-xs text-gray-500 mt-1">Awaiting confirmation</p>
          </div>
        </Card>

        <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
          <div>
            <p className="text-sm font-medium text-gray-600 mb-2">
              Confirmed Received
            </p>
            <p className="text-3xl font-bold text-green-600">{receivedCount}</p>
            <p className="text-xs text-gray-500 mt-1">Successfully received</p>
          </div>
        </Card>
      </div>

      {/* Filter Tabs */}
      <Card>
        <div className="flex gap-3 mb-6">
          <button
            onClick={() => setFilter("all")}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              filter === "all"
                ? "bg-blue-600 text-white"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            All ({dispatches.length})
          </button>
          <button
            onClick={() => setFilter("pending")}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              filter === "pending"
                ? "bg-yellow-600 text-white"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            Pending ({pendingCount})
          </button>
          <button
            onClick={() => setFilter("received")}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              filter === "received"
                ? "bg-green-600 text-white"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            Received ({receivedCount})
          </button>
        </div>

        {loading ? (
          <div className="space-y-4">
            <Skeleton className="h-24 w-full" />
            <Skeleton className="h-24 w-full" />
            <Skeleton className="h-24 w-full" />
          </div>
        ) : filteredDispatches.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-lg font-semibold text-gray-700">
              No dispatches found
            </p>
            <p className="text-sm text-gray-500 mt-1">
              {filter === "all"
                ? "You haven't received any dispatches yet."
                : filter === "pending"
                ? "All dispatches have been confirmed."
                : "You haven't confirmed any dispatches yet."}
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredDispatches.map((dispatch) => (
              <div
                key={dispatch._id}
                className="border border-gray-200 rounded-lg p-4 hover:border-gray-300 hover:shadow-sm transition-all"
              >
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center gap-3">
                      <h3 className="font-semibold text-gray-900">
                        {dispatch.dispatchNo}
                      </h3>
                      <Badge variant={getStatusColor(dispatch.status)}>
                        {dispatch.status?.toUpperCase()}
                      </Badge>
                      {dispatch.isBatchDispatch && (
                        <Badge variant="purple">Batch</Badge>
                      )}
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-3">
                      <div>
                        <p className="text-xs text-gray-500 mb-1">
                          Dispatch Date
                        </p>
                        <p className="text-sm font-medium text-gray-700">
                          {formatDate(dispatch.dispatchDate)}
                        </p>
                      </div>

                      {dispatch.dispatchedDate && (
                        <div>
                          <p className="text-xs text-gray-500 mb-1">
                            Dispatched On
                          </p>
                          <p className="text-sm font-medium text-gray-700">
                            {formatDate(dispatch.dispatchedDate)}
                          </p>
                        </div>
                      )}

                      {dispatch.receivedDate && (
                        <div>
                          <p className="text-xs text-gray-500 mb-1">
                            Received On
                          </p>
                          <p className="text-sm font-medium text-gray-700">
                            {formatDate(dispatch.receivedDate)}
                          </p>
                        </div>
                      )}

                      {dispatch.deliveryTime && (
                        <div>
                          <p className="text-xs text-gray-500 mb-1">
                            Delivery Time
                          </p>
                          <p className="text-sm font-medium text-gray-700">
                            {dispatch.deliveryTime} hours
                          </p>
                        </div>
                      )}
                    </div>

                    {/* Items List */}
                    <div className="mt-4 border-t pt-3">
                      <p className="text-xs font-semibold text-gray-600 mb-2">
                        Items ({dispatch.items.length})
                      </p>
                      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
                        {dispatch.items.map((item, idx) => (
                          <div
                            key={idx}
                            className="bg-gray-50 rounded p-2 text-xs"
                          >
                            <p className="font-medium text-gray-900">
                              {item.productId?.name}
                            </p>
                            <p className="text-gray-600">
                              Qty: {item.quantity}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>

                    {dispatch.receivedNotes && (
                      <div className="mt-3 pt-3 border-t">
                        <p className="text-xs font-semibold text-gray-600 mb-1">
                          Notes
                        </p>
                        <p className="text-sm text-gray-700">
                          {dispatch.receivedNotes}
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Action Button */}
                  <div className="ml-4">
                    {dispatch.status !== "received" &&
                      dispatch.status !== "rejected" && (
                        <Button
                          onClick={() => {
                            setSelectedDispatch(dispatch);
                            setConfirmModal(true);
                          }}
                          className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 text-sm"
                        >
                          Confirm Receipt
                        </Button>
                      )}
                    {dispatch.status === "received" && (
                      <div className="text-center">
                        <Badge variant="green">Confirmed</Badge>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* Confirmation Modal */}
      <Modal
        isOpen={confirmModal}
        onClose={() => {
          setConfirmModal(false);
          setReceivedNotes("");
          setSelectedDispatch(null);
        }}
        title="Confirm Dispatch Receipt"
      >
        {selectedDispatch && (
          <div className="space-y-4">
            <div>
              <p className="text-sm text-gray-600">
                <span className="font-semibold text-gray-900">
                  Dispatch No:
                </span>{" "}
                {selectedDispatch.dispatchNo}
              </p>
              <p className="text-sm text-gray-600 mt-1">
                <span className="font-semibold text-gray-900">Items:</span>{" "}
                {selectedDispatch.items.length} product(s)
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Received Notes (Optional)
              </label>
              <textarea
                value={receivedNotes}
                onChange={(e) => setReceivedNotes(e.target.value)}
                placeholder="Add any notes about the received items (condition, damages, etc.)"
                className="w-full border border-gray-300 rounded-lg p-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                rows="4"
              />
            </div>

            <div className="flex gap-3 justify-end">
              <Button
                onClick={() => {
                  setConfirmModal(false);
                  setReceivedNotes("");
                }}
                className="bg-gray-300 hover:bg-gray-400 text-gray-900 px-4 py-2"
                disabled={confirming}
              >
                Cancel
              </Button>
              <Button
                onClick={handleConfirmReceipt}
                className="bg-green-600 hover:bg-green-700 text-white px-4 py-2"
                disabled={confirming}
              >
                {confirming ? "Confirming..." : "Confirm Receipt"}
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};
