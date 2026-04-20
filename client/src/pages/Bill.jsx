// src/pages/Bill.jsx
import { formatCurrency } from "../utils/formatCurrency.js";
import { formatDate, formatDateTime } from "../utils/formatDate.js";

export const Bill = ({ billData }) => {
  if (!billData) {
    return (
      <div className="bg-white p-6 rounded-lg border text-center text-gray-600">
        No bill data
      </div>
    );
  }

  // Safe total calc (works even if subtotal is missing)
  const items = billData.items || [];
  const total = items.reduce((sum, item) => {
    const subtotal =
      item.subtotal ?? (Number(item.price || 0) * Number(item.quantity || 0));
    return sum + Number(subtotal || 0);
  }, 0);

  return (
    <div className="bg-white p-6 rounded-lg border max-w-md mx-auto">
      <h1 className="text-center text-2xl font-bold mb-2">Kiran Dairy Farm</h1>
      <p className="text-center text-xs text-gray-500 mb-4">
        Sales Invoice / Bill
      </p>

      <div className="flex justify-between text-sm mb-3">
        <div>
          <p className="font-semibold">Bill No:</p>
          <p className="text-gray-700">{billData.billNo || "-"}</p>
        </div>
        <div className="text-right">
          <p className="font-semibold">Date:</p>
          <p className="text-gray-700">{formatDate(billData.saleDate)}</p>
          <p className="font-semibold mt-1">Time:</p>
          <p className="text-gray-700">{formatDateTime(billData.saleDate).split(', ')[1]}</p>
        </div>
      </div>

      <hr className="my-4" />

      <table className="w-full text-sm">
        <thead>
          <tr className="text-gray-700">
            <th className="text-left pb-2">Item</th>
            <th className="text-center pb-2">Qty</th>
            <th className="text-right pb-2">Price</th>
            <th className="text-right pb-2">Total</th>
          </tr>
        </thead>

        <tbody>
          {items.length === 0 ? (
            <tr>
              <td colSpan="4" className="text-center py-6 text-gray-500">
                No items
              </td>
            </tr>
          ) : (
            items.map((item, idx) => {
              const subtotal =
                item.subtotal ??
                (Number(item.price || 0) * Number(item.quantity || 0));

              return (
                <tr key={idx} className="border-b">
                  <td className="py-2">{item.productName || "Item"}</td>
                  <td className="text-center">{item.quantity || 0}</td>
                  <td className="text-right">{formatCurrency(item.price || 0)}</td>
                  <td className="text-right">{formatCurrency(subtotal || 0)}</td>
                </tr>
              );
            })
          )}
        </tbody>
      </table>

      <hr className="my-4" />

      <div className="flex justify-between font-bold text-lg mb-4">
        <span>Total:</span>
        <span>{formatCurrency(total)}</span>
      </div>

      <div className="bg-gray-50 p-3 rounded mb-4">
        {billData.paymentMethod === "split" && billData.paymentDetails ? (
          <div>
            <p className="text-sm font-semibold mb-2">Payment Breakdown:</p>
            {billData.paymentDetails.upi && (
              <p className="text-xs text-gray-700 mb-1">
                UPI ({billData.paymentDetails.upi.provider?.toUpperCase() || 'UPI'}): {formatCurrency(billData.paymentDetails.upi.amount || 0)}
              </p>
            )}
            {billData.paymentDetails.cash && (
              <p className="text-xs text-gray-700 mb-1">
                Cash: {formatCurrency(billData.paymentDetails.cash.amount || 0)}
              </p>
            )}
            {billData.paymentDetails.card && (
              <p className="text-xs text-gray-700 mb-1">
                Card: {formatCurrency(billData.paymentDetails.card.amount || 0)}
              </p>
            )}
          </div>
        ) : (
          <p className="text-sm">
            <span className="font-semibold">Payment Method:</span> {billData.paymentMethod?.toUpperCase() || "-"}
            {billData.paymentDetails?.upi?.provider && (
              <span> ({billData.paymentDetails.upi.provider.toUpperCase()})</span>
            )}
          </p>
        )}
      </div>

      <hr className="my-4" />

      <p className="text-center text-xs text-gray-500">
        Thank you for your business!
      </p>
    </div>
  );
};