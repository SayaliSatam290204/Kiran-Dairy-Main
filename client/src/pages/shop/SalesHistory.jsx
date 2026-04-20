import { useState, useEffect } from "react";
import toast from "react-hot-toast";
import { Card } from "../../components/ui/Card.jsx";
import { DataTable } from "../../components/common/DataTable.jsx";
import { Skeleton } from "../../components/ui/Skeleton.jsx";
import { Badge } from "../../components/ui/Badge.jsx";
import { salesApi } from "../../api/salesApi.js";
import { formatCurrency } from "../../utils/formatCurrency.js";
import { formatDate } from "../../utils/formatDate.js";

export const SalesHistory = () => {
  const [sales, setSales] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSales = async () => {
      try {
        const response = await salesApi.getHistory();
        setSales(response.data.data || []);
      } catch (error) {
        console.error("Failed to fetch sales:", error);
        toast.error(error.response?.data?.message || "Failed to load sales history");
      } finally {
        setLoading(false);
      }
    };

    fetchSales();
  }, []);

  const columns = [
    { key: "billNo", label: "Bill No" },
    { key: "totalAmount", label: "Amount", render: (val) => formatCurrency(val || 0) },
    {
      key: "paymentMethod",
      label: "Payment",
      render: (val) => {
        const p = String(val || "").toLowerCase();
        const v = p === "cash" ? "green" : p === "card" ? "blue" : p === "online" ? "purple" : "gray";
        // Badge supports only gray/green/red/blue in our component. Use blue for all non-cash:
        const finalVariant = p === "cash" ? "green" : "blue";
        return <Badge variant={finalVariant}>{String(val || "-").toUpperCase()}</Badge>;
      },
    },
    { key: "saleDate", label: "Date", render: (val) => formatDate(val) },
  ];

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">Sales History</h1>

      <Card>
        {loading ? (
          <div className="space-y-3">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-64 w-full" />
          </div>
        ) : (
          <DataTable
            columns={columns}
            data={sales}
            emptyState={
              <div>
                <div className="text-lg font-semibold">No sales yet</div>
                <div className="text-sm mt-1">Start selling from POS to see history.</div>
              </div>
            }
          />
        )}
      </Card>
    </div>
  );
};