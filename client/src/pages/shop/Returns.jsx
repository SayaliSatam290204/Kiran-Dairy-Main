import { useState, useEffect } from "react";
import toast from "react-hot-toast";
import { FaLightbulb } from "react-icons/fa";
import { Card } from "../../components/ui/Card.jsx";
import { Button } from "../../components/ui/Button.jsx";
import { Modal } from "../../components/ui/Modal.jsx";
import { Input } from "../../components/ui/Input.jsx";
import { DataTable } from "../../components/common/DataTable.jsx";
import { Skeleton } from "../../components/ui/Skeleton.jsx";
import { Badge } from "../../components/ui/Badge.jsx";
import { returnApi } from "../../api/returnApi.js";
import { shopApi } from "../../api/shopApi.js";
import { formatDate } from "../../utils/formatDate.js";
import { formatCurrency } from "../../utils/formatCurrency.js";

const RETURN_REASONS = [
  { value: "damaged", label: "Damaged" },
  { value: "expired", label: "Expired" },
  { value: "excess", label: "Excess Stock / Remaining" }
];

export const Returns = () => {
  const [returns, setReturns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [inventory, setInventory] = useState([]);
  const [showModal, setShowModal] = useState(false);

  const [selectedItems, setSelectedItems] = useState([]);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchReturns();
    fetchInventory();
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

  const fetchInventory = async () => {
    try {
      const response = await shopApi.getInventory();
      setInventory(response.data.data || []);
    } catch (error) {
      console.error("Failed to fetch inventory:", error);
      toast.error(error.response?.data?.message || "Failed to load inventory");
    }
  };

  const handleAddItem = () => {
    setSelectedItems((prev) => [
      ...prev,
      { productId: "", quantity: 0, reason: "damaged" }
    ]);
  };

  const handleRemoveItem = (index) => {
    setSelectedItems((prev) => prev.filter((_, i) => i !== index));
  };

  const handleItemChange = (index, field, value) => {
    setSelectedItems((prev) => {
      const updated = [...prev];
      updated[index] = {
        ...updated[index],
        [field]: value
      };
      return updated;
    });
  };

  const handleSubmitReturn = async (e) => {
    e.preventDefault();

    if (selectedItems.length === 0) {
      toast.error("Please add at least one item");
      return;
    }

    for (const item of selectedItems) {
      if (!item.productId || item.quantity <= 0 || !item.reason) {
        toast.error("Please fill all item details");
        return;
      }

      const inventoryRow = inventory.find(
        (inv) => inv.productId?._id === item.productId
      );

      if (!inventoryRow) {
        toast.error("Selected product not found in inventory");
        return;
      }

      if (item.quantity > (inventoryRow.quantity || 0)) {
        toast.error(
          `Return quantity cannot exceed stock for ${inventoryRow.productId?.name || "selected product"}`
        );
        return;
      }
    }

    setSubmitting(true);

    try {
      await returnApi.create({
        items: selectedItems.map((item) => ({
          productId: item.productId,
          quantity: item.quantity,
          reason: item.reason
        }))
      });

      toast.success("Return request submitted successfully");
      setShowModal(false);
      setSelectedItems([]);
      fetchReturns();
      fetchInventory();
    } catch (error) {
      console.error("Error creating return:", error);
      toast.error(error.response?.data?.message || "Failed to create return");
    } finally {
      setSubmitting(false);
    }
  };

  const columns = [
    { key: "returnNo", label: "Return No" },
    {
      key: "status",
      label: "Status",
      render: (val) => {
        const s = String(val || "").toLowerCase();
        const v = s === "approved" ? "green" : s === "rejected" ? "red" : "blue";
        return <Badge variant={v}>{String(val || "-").toUpperCase()}</Badge>;
      }
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
              .map((it) => {
                const reason = RETURN_REASONS.find((r) => r.value === it.reason);
                return reason ? reason.label : it.reason;
              })
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
      label: "Date",
      render: (val) => formatDate(val)
    }
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Returns Management</h1>
        <Button
          onClick={() => setShowModal(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white"
        >
          + Create Return Request
        </Button>
      </div>

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
                  Click "Create Return Request" to submit a return for damaged,
                  expired, or excess products.
                </div>
              </div>
            }
          />
        )}
      </Card>

      {showModal && (
        <Modal
          isOpen={showModal}
          onClose={() => {
            setShowModal(false);
            setSelectedItems([]);
          }}
          title="Create Return Request"
        >
          <form onSubmit={handleSubmitReturn} className="space-y-6">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p className="text-sm text-blue-700 flex items-center gap-2">
                <FaLightbulb className="text-yellow-500 flex-shrink-0" />
                <span><strong>Select products</strong> from your inventory that need
                to be returned due to damage, expiration, or excess stock. Admin
                will review and approve your request.</span>
              </p>
            </div>

            <div className="space-y-4">
              {selectedItems.map((item, index) => (
                <div
                  key={index}
                  className="bg-gray-50 border border-gray-200 rounded-lg p-4 space-y-3"
                >
                  <div className="flex justify-between items-center">
                    <h4 className="font-semibold text-gray-900">Item {index + 1}</h4>
                    <button
                      type="button"
                      onClick={() => handleRemoveItem(index)}
                      className="text-red-600 hover:text-red-700 text-sm font-semibold"
                    >
                      Remove
                    </button>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Product *
                    </label>
                    <select
                      value={item.productId}
                      onChange={(e) =>
                        handleItemChange(index, "productId", e.target.value)
                      }
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">Select product...</option>
                      {inventory
                        .filter((inv) => inv.productId?._id)
                        .map((inv) => (
                          <option
                            key={inv.productId._id}
                            value={inv.productId._id}
                          >
                            {inv.productId?.name || "Unknown"} (Stock: {inv.quantity})
                          </option>
                        ))}
                    </select>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Quantity to Return *
                      </label>
                      <Input
                        type="number"
                        value={item.quantity}
                        onChange={(e) =>
                          handleItemChange(
                            index,
                            "quantity",
                            parseInt(e.target.value, 10) || 0
                          )
                        }
                        min="1"
                        required
                        placeholder="0"
                        className="mb-0"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Reason *
                      </label>
                      <select
                        value={item.reason}
                        onChange={(e) =>
                          handleItemChange(index, "reason", e.target.value)
                        }
                        required
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        {RETURN_REASONS.map((reason) => (
                          <option key={reason.value} value={reason.value}>
                            {reason.label}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <button
              type="button"
              onClick={handleAddItem}
              className="w-full px-4 py-2 border-2 border-dashed border-blue-300 rounded-lg text-blue-600 hover:bg-blue-50 font-semibold transition"
            >
              + Add Another Item
            </button>

            <div className="flex gap-3 pt-6 border-t border-gray-200">
              <Button
                type="submit"
                disabled={submitting}
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-md font-semibold"
              >
                {submitting ? "Submitting..." : "Submit Return Request"}
              </Button>

              <Button
                type="button"
                onClick={() => {
                  setShowModal(false);
                  setSelectedItems([]);
                }}
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