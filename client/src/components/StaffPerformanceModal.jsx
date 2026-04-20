import { Modal } from "./ui/Modal.jsx";
import { Badge } from "./ui/Badge.jsx";
import { formatCurrency } from "../utils/formatCurrency.js";

export const StaffPerformanceModal = ({ isOpen, onClose, staff, performance }) => {
  if (!staff || !performance) return null;

  const { daily = [], weekly = {}, monthly = {}, yearly = {} } = performance;

  const hasNoData =
    daily.length === 0 &&
    Object.keys(weekly).length === 0 &&
    Object.keys(monthly).length === 0 &&
    Object.keys(yearly).length === 0;

const Section = ({ title, subtitle, variant = 'neutral', children }) => (
    <section className={`rounded-2xl border p-5 shadow-sm ${
      variant === 'staff' ? 'bg-gradient-to-br from-indigo-50 to-blue-50 border-indigo-200' :
      variant === 'performance' ? 'bg-gradient-to-br from-emerald-50 to-green-50 border-emerald-200' :
      'border-slate-200 bg-white'
    }`}>
      <div className="mb-4">
        <h3 className="text-lg font-bold text-slate-900">{title}</h3>
        {subtitle && <p className="mt-1 text-sm text-slate-500">{subtitle}</p>}
      </div>
      {children}
    </section>
  );

const MetricTable = ({ rows, variant = 'neutral' }) => (
    <div className="overflow-x-auto rounded-xl border border-slate-200">
      <table className="min-w-full divide-y divide-slate-200 text-sm">
        <tbody className="divide-y divide-slate-100 bg-white">
          {rows.map((row) => (
            <tr key={row.label} className="hover:bg-slate-50">
              <td className={`w-1/2 px-4 py-3 font-semibold ${
                variant === 'staff' ? 'text-indigo-700' : 'text-slate-700'
              }`}>{row.label}</td>
              <td className={`px-4 py-3 text-right font-medium ${
                variant === 'staff' ? 'text-indigo-900' :
                variant === 'performance' ? 'text-emerald-700' : 'text-slate-900'
              }`}>{row.value}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );

  const summaryRows = [
    { label: "Weekly Sales", value: weekly.totalSales || 0 },
    { label: "Monthly Revenue", value: formatCurrency(monthly.totalAmount || 0) },
    { label: "Yearly Items Sold", value: yearly.itemsSold || 0 },
    { label: "Monthly Avg Sale", value: formatCurrency(monthly.avgSaleAmount || 0) },
  ];

  const staffInfoRows = [
    { label: "Staff Name", value: staff.name || "N/A" },
    { label: "Email", value: staff.email || "N/A" },
    { label: "Phone", value: staff.phone || "N/A" },
    { label: "Base Salary", value: formatCurrency(staff.baseSalary || 0) },
  ];

  const weeklyRows = [
    { label: "Total Sales", value: weekly.totalSales || 0 },
    { label: "Revenue", value: formatCurrency(weekly.totalAmount || 0) },
    { label: "Items Sold", value: weekly.itemsSold || 0 },
    { label: "Avg Sale", value: formatCurrency(weekly.avgSaleAmount || 0) },
  ];

  const monthlyRows = [
    { label: "Total Sales", value: monthly.totalSales || 0 },
    { label: "Revenue", value: formatCurrency(monthly.totalAmount || 0) },
    { label: "Items Sold", value: monthly.itemsSold || 0 },
    { label: "Avg Sale", value: formatCurrency(monthly.avgSaleAmount || 0) },
  ];

  const yearlyRows = [
    { label: "Total Sales", value: yearly.totalSales || 0 },
    { label: "Revenue", value: formatCurrency(yearly.totalAmount || 0) },
    { label: "Items Sold", value: yearly.itemsSold || 0 },
    { label: "Avg Sale", value: formatCurrency(yearly.avgSaleAmount || 0) },
  ];

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`${staff.name} - Performance Overview`}
      size="xl"
    >
      <div className="mx-auto max-h-[80vh] w-full space-y-5 overflow-y-auto pr-1">
<Section title="Staff Details" subtitle="Basic information and assigned shifts." variant="staff">
          <MetricTable rows={staffInfoRows} variant="staff" />

          {staff.shifts && staff.shifts.length > 0 && (
            <div className="mt-4">
              <p className="mb-2 text-sm font-semibold text-indigo-700">Assigned Shifts</p>
              <div className="flex flex-wrap gap-2">
                {staff.shifts.map((shift) => (
                  <Badge
                    key={shift}
                    className="rounded-full bg-indigo-100 px-3 py-1 text-xs font-semibold capitalize text-indigo-700 border border-indigo-200"
                  >
                    {shift} Shift
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </Section>

        <Section
          title="Performance Summary"
          subtitle="Quick snapshot of current weekly, monthly and yearly performance."
          variant="performance"
        >
<MetricTable rows={summaryRows} variant="performance" />
        </Section>

        {daily.length > 0 && (
          <Section
            title="Daily Performance"
            subtitle="Recent performance entries shown in row format."
            variant="performance"
          >
            <div className="overflow-x-auto rounded-xl border border-slate-200">
              <table className="min-w-full divide-y divide-slate-200 text-sm">
                <thead className="bg-slate-50">
                  <tr>
                    <th className="px-4 py-3 text-left font-semibold text-slate-700">Date / Entry</th>
                    <th className="px-4 py-3 text-left font-semibold text-slate-700">Shift</th>
                    <th className="px-4 py-3 text-right font-semibold text-slate-700">Sales</th>
                    <th className="px-4 py-3 text-right font-semibold text-slate-700">Revenue</th>
                    <th className="px-4 py-3 text-right font-semibold text-slate-700">Items Sold</th>
                    <th className="px-4 py-3 text-right font-semibold text-slate-700">Avg Sale</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 bg-white">
                  {daily.map((day, idx) => (
                    <tr key={idx} className="hover:bg-slate-50">
                      <td className="px-4 py-3 font-medium text-slate-900">
                        {day.date || day.shift || `Entry ${idx + 1}`}
                      </td>
                      <td className="px-4 py-3 text-slate-700">{day.shift || "-"}</td>
                      <td className="px-4 py-3 text-right font-medium text-emerald-700">
                        {day.totalSales || 0}
                      </td>
                      <td className="px-4 py-3 text-right font-bold text-emerald-600">
                        {formatCurrency(day.totalAmount || 0)}
                      </td>
                      <td className="px-4 py-3 text-right font-medium text-emerald-700">
                        {day.itemsSold || 0}
                      </td>
                      <td className="px-4 py-3 text-right font-medium text-emerald-700">
                        {formatCurrency(day.avgSaleAmount || 0)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Section>
        )}

        {Object.keys(weekly).length > 0 && (
          <Section
            title="Weekly Performance"
            subtitle="Current week totals in table row format."
          >
            <MetricTable rows={weeklyRows} variant="performance" />
          </Section>
        )}

        {Object.keys(monthly).length > 0 && (
          <Section
            title="Monthly Performance"
            subtitle="Current month totals in table row format."
          >
            <MetricTable rows={monthlyRows} variant="performance" />
          </Section>
        )}

        {Object.keys(yearly).length > 0 && (
          <Section
            title="Yearly Performance"
            subtitle="Current year totals in table row format."
          >
            <MetricTable rows={yearlyRows} variant="performance" />
          </Section>
        )}

        {hasNoData && (
          <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 px-6 py-10 text-center">
            <div className="mx-auto max-w-md">
              <h3 className="text-lg font-semibold text-slate-900">No performance data available</h3>
              <p className="mt-2 text-sm text-slate-500">
                This staff member does not have sales performance records yet for the selected
                periods.
              </p>
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
};
