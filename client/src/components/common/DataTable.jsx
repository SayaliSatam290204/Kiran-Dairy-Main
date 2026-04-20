// src/components/common/DataTable.jsx
import { useMemo, useState } from "react";

/**
 * columns: [{ key, label, render? }]
 * data: array of objects
 * onRowClick?: (row) => void
 * searchableKeys?: ["name","email"]  (default: all column keys)
 * pageSizeOptions?: [5,10,20,50]
 * keyField?: "id"  (unique identifier field for key prop)
 * isLoading?: false  (shows loading state)
 */
export const DataTable = ({
  columns = [],
  data = [],
  onRowClick,
  searchableKeys,
  pageSizeOptions = [5, 10, 20, 50],
  initialPageSize = 10,
  emptyState,
  keyField = "id",
  isLoading = false,
}) => {
  const [query, setQuery] = useState("");
  const [sortKey, setSortKey] = useState(null);
  const [sortOrder, setSortOrder] = useState("asc"); // asc | desc
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(initialPageSize);

  const keysToSearch = useMemo(() => {
    if (Array.isArray(searchableKeys) && searchableKeys.length > 0) return searchableKeys;
    return columns.map((c) => c.key);
  }, [searchableKeys, columns]);

  const filtered = useMemo(() => {
    if (!Array.isArray(data)) return [];
    const q = query.trim().toLowerCase();
    if (!q) return data;

    return data.filter((row) =>
      keysToSearch.some((k) => {
        const v = row?.[k];
        if (v === null || v === undefined) return false;
        // Skip objects and arrays in search
        if (typeof v === 'object') return false;
        return String(v).toLowerCase().includes(q);
      })
    );
  }, [data, query, keysToSearch]);

  const sorted = useMemo(() => {
    if (!sortKey) return filtered;
    const copy = [...filtered];
    copy.sort((a, b) => {
      const va = a?.[sortKey];
      const vb = b?.[sortKey];

      // handle nulls
      if (va == null && vb == null) return 0;
      if (va == null) return sortOrder === "asc" ? -1 : 1;
      if (vb == null) return sortOrder === "asc" ? 1 : -1;

      // numeric compare when possible
      const na = Number(va);
      const nb = Number(vb);
      const bothNumeric = !Number.isNaN(na) && !Number.isNaN(nb);

      let cmp = 0;
      if (bothNumeric) cmp = na - nb;
      else cmp = String(va).localeCompare(String(vb));

      return sortOrder === "asc" ? cmp : -cmp;
    });
    return copy;
  }, [filtered, sortKey, sortOrder]);

  const total = sorted.length;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const currentPage = Math.min(page, totalPages);

  const paged = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return sorted.slice(start, start + pageSize);
  }, [sorted, currentPage, pageSize]);

  const toggleSort = (key) => {
    setPage(1);
    if (sortKey !== key) {
      setSortKey(key);
      setSortOrder("asc");
      return;
    }
    setSortOrder((prev) => (prev === "asc" ? "desc" : "asc"));
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="border rounded-lg bg-white p-10 text-center">
        <div className="text-gray-600">
          <div className="inline-block animate-spin">...</div>
          <div className="text-lg font-semibold mt-2">Loading data...</div>
        </div>
      </div>
    );
  }

  // Empty state
  if (!data || data.length === 0) {
    return (
      <div className="border rounded-lg bg-white p-10 text-center text-gray-600">
        {emptyState ?? (
          <>
            <div className="text-lg font-semibold">Nothing to show</div>
            <div className="text-sm mt-1">No data available yet.</div>
          </>
        )}
      </div>
    );
  }

  return (
    <div className="bg-white border rounded-lg">
      {/* Top controls */}
      <div className="p-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div className="flex-1">
          <input
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setPage(1);
            }}
            placeholder="Search..."
            className="w-full md:max-w-sm px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div className="flex items-center gap-3 justify-end">
          <span className="text-sm text-gray-600">
            {total} result{total === 1 ? "" : "s"}
          </span>

          <select
            value={pageSize}
            onChange={(e) => {
              setPageSize(Number(e.target.value));
              setPage(1);
            }}
            className="px-3 py-2 border border-gray-300 rounded-md bg-white"
          >
            {pageSizeOptions.map((n) => (
              <option key={n} value={n}>
                {n} / page
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-gray-100">
              {columns.map((col) => {
                const active = sortKey === col.key;
                return (
                  <th
                    key={col.key}
                    onClick={() => toggleSort(col.key)}
                    className="border-b p-3 text-left font-semibold select-none cursor-pointer"
                    title="Click to sort"
                  >
                    <div className="flex items-center gap-2">
                      <span>{col.label}</span>
                      <span className="text-xs text-gray-500">
                        {active ? (sortOrder === "asc" ? "▲" : "▼") : ""}
                      </span>
                    </div>
                  </th>
                );
              })}
            </tr>
          </thead>

          <tbody>
            {paged.length === 0 ? (
              <tr>
                <td colSpan={columns.length} className="p-8 text-center text-gray-600">
                  No matching results.
                </td>
              </tr>
            ) : (
              paged.map((row, idx) => (
                <tr
                  key={idx}
                  className={`border-b hover:bg-gray-50 ${
                    onRowClick ? "cursor-pointer" : ""
                  }`}
                  onClick={() => onRowClick && onRowClick(row)}
                >
                  {columns.map((col) => (
                    <td key={col.key} className="p-3">
                      {col.render ? col.render(row?.[col.key], row) : row?.[col.key]}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="p-4 flex items-center justify-between">
        <div className="text-sm text-gray-600">
          Page {currentPage} of {totalPages}
        </div>

        <div className="flex items-center gap-2">
          <button
            className="px-3 py-2 border rounded-md disabled:opacity-50"
            onClick={() => setPage(1)}
            disabled={currentPage === 1}
          >
            {"<<"}
          </button>
          <button
            className="px-3 py-2 border rounded-md disabled:opacity-50"
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={currentPage === 1}
          >
            Prev
          </button>
          <button
            className="px-3 py-2 border rounded-md disabled:opacity-50"
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages}
          >
            Next
          </button>
          <button
            className="px-3 py-2 border rounded-md disabled:opacity-50"
            onClick={() => setPage(totalPages)}
            disabled={currentPage === totalPages}
          >
            {">>"}
          </button>
        </div>
      </div>
    </div>
  );
};