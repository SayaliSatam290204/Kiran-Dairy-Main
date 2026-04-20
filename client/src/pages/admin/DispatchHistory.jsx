import { useState, useEffect } from "react";
import toast from "react-hot-toast";
import { Card } from "../../components/ui/Card.jsx";
import { DataTable } from "../../components/common/DataTable.jsx";
import { Skeleton } from "../../components/ui/Skeleton.jsx";
import { Badge } from "../../components/ui/Badge.jsx";
import { adminApi } from "../../api/adminApi.js";
import { formatDate } from "../../utils/formatDate.js";

export const DispatchHistory = () => {
  const [dispatches, setDispatches] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDispatches = async () => {
      try {
        const response = await adminApi.getDispatches();
        setDispatches(response.data.data || []);
      } catch (error) {
        console.error("Failed to fetch dispatches:", error);
        toast.error(error.response?.data?.message || "Failed to load dispatch history");
      } finally {
        setLoading(false);
      }
    };

    fetchDispatches();
  }, []);

  const columns = [
    { key: "dispatchNo", label: "Dispatch No" },
    {
      key: "shopName",
      label: "Shop",
      render: (val, row) => {
        if (row.isBatchDispatch && Array.isArray(row.shopIds) && row.shopIds.length > 0) {
          const shops = row.shopIds.map((shop) => shop?.name || "Unknown");
          return shops.join(', ');
        }
        return row.shopId?.name || "-";
      }
    },
    {
      key: "status",
      label: "Status",
      render: (val) => {
        const s = String(val || "").toLowerCase();
        let variant = "gray";
        if (s === "received") variant = "green";
        else if (s === "dispatched") variant = "blue";
        else if (s === "pending") variant = "yellow";
        else if (s === "created") variant = "gray";
        return <Badge variant={variant}>{String(val || "-").toUpperCase()}</Badge>;
      },
    },
    { key: "dispatchDate", label: "Dispatched", render: (val) => formatDate(val) },
    {
      key: "receivedDate",
      label: "Received",
      render: (val) => val ? formatDate(val) : "-"
    },
    {
      key: "confirmedBy",
      label: "Confirmed By",
      render: (val, row) => {
        if (row.status === "received" && row.confirmedBy?.name) {
          return `${row.confirmedBy.name}`;
        }
        return "-";
      }
    }
  ];

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">Dispatch History</h1>

      <Card>
        {loading ? (
          <div className="space-y-3">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-64 w-full" />
          </div>
        ) : (
          <DataTable
            columns={columns}
            data={dispatches}
            emptyState={
              <div>
                <div className="text-lg font-semibold">No dispatch history yet</div>
                <div className="text-sm mt-1">Create your first dispatch to see it here.</div>
              </div>
            }
          />
        )}
      </Card>
    </div>
  );
};