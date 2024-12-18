import { useState, useMemo } from "react";

function ExcelViewer({ excelData }) {
  const [filters, setFilters] = useState({});
  const [searchQuery, setSearchQuery] = useState({});
  const [currentPage, setCurrentPage] = useState(1);
  const rowsPerPage = 30;

  const handleFilterChange = (key, value) => {
    setFilters((prevFilters) => ({
      ...prevFilters,
      [key]: value,
    }));
    setCurrentPage(1);
  };

  const handleManualSearchChange = (key, value) => {
    setSearchQuery((prevQuery) => ({
      ...prevQuery,
      [key]: value,
    }));
    setCurrentPage(1);
  };

  const getUniqueValues = (key) => {
    if (!excelData || !Array.isArray(excelData)) return [];

    const uniqueValues = new Set(
      excelData
        .map((row) => row[key])
        .filter((value) => value !== undefined && value !== null)
    );

    return Array.from(uniqueValues).sort((a, b) => {
      // Numeric sorting if both are numbers
      if (typeof a === "number" && typeof b === "number") {
        return a - b;
      }
      // String sorting for other types
      return a.toString().localeCompare(b.toString());
    });
  };

  const filteredData = useMemo(() => {
    if (!Array.isArray(excelData)) return [];

    return excelData.filter(
      (row) =>
        Object.keys(filters).every((key) => {
          // Skip filtering if no filter is set
          if (!filters[key]) return true;

          // Numeric column handling
          if (typeof row[key] === "number") {
            return row[key] === Number(filters[key]);
          }

          // String column handling
          return row[key]?.toString() === filters[key];
        }) &&
        Object.keys(searchQuery).every(
          (key) =>
            !searchQuery[key] ||
            row[key]
              ?.toString()
              .toLowerCase()
              .includes(searchQuery[key].toLowerCase())
        )
    );
  }, [excelData, filters, searchQuery]);

  const paginatedData = filteredData.slice(
    (currentPage - 1) * rowsPerPage,
    currentPage * rowsPerPage
  );

  const totalPages = Math.ceil(filteredData.length / rowsPerPage);

  const resetFilters = () => {
    setFilters({});
    setSearchQuery({});
    setCurrentPage(1);
  };

  return (
    <div className="bg-white rounded-lg shadow">
      {/* Manual Search Form */}
      <div className="p-4 border-b">
        <h4 className="text-lg font-bold mb-4">Manual Search</h4>
        <form className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {Array.isArray(excelData) &&
            excelData.length > 0 &&
            Object.keys(excelData[0]).map((key) => (
              <div key={key} className="flex flex-col">
                <label htmlFor={key} className="text-sm font-semibold">
                  {key}
                </label>
                <input
                  type="text"
                  id={key}
                  value={searchQuery[key] || ""}
                  onChange={(e) =>
                    handleManualSearchChange(key, e.target.value)
                  }
                  className="p-2 border border-gray-300 rounded"
                  placeholder={`Search ${key}`}

                />
              </div>
            ))}
        </form>
      </div>

      {/* Data Table */}
      <div className="overflow-x-auto">
        <table className="min-w-full table-fixed divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              {Array.isArray(excelData) &&
                excelData.length > 0 &&
                Object.keys(excelData[0]).map((key) => (
                  <th
                    key={key}
                    className="px-6 py-3 w-48 min-w-[12rem] text-left text-xs font-medium text-gray-700 uppercase tracking-wider"
                  >
                    <div className="font-bold mb-2 truncate">{key}</div>
                    <select
                      className="w-full p-1 text-sm border border-gray-300 rounded"
                      value={filters[key] || ""}
                      onChange={(e) => handleFilterChange(key, e.target.value)}
                    >
                      <option value="">All</option>
                      {getUniqueValues(key).map((value, index) => (
                        <option key={index} value={value}>
                          {value}
                        </option>
                      ))}
                    </select>
                  </th>
                ))}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {paginatedData.map((row, index) => (
              <tr key={index} className="hover:bg-gray-50">
                {Object.keys(row).map((key) => (
                  <td
                    key={key}
                    className="px-6 py-4 w-48 min-w-[12rem] overflow-hidden text-ellipsis text-sm text-black"
                  >
                    <div className="truncate">{row[key]}</div>
                  </td>
                ))}
              </tr>
            ))}
            {paginatedData.length === 0 && (
              <tr>
                <td
                  colSpan={
                    Array.isArray(excelData) && excelData.length > 0
                      ? Object.keys(excelData[0]).length
                      : 1
                  }
                  className="px-6 py-4 text-center text-sm text-black"
                >
                  No data found for the selected filters.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Controls */}
      <div className="flex justify-between items-center p-4 border-t">
        <button
          onClick={resetFilters}
          className="bg-yellow-600 text-white px-4 py-2 rounded hover:bg-yellow-700"
        >
          Reset Filters
        </button>
        <div className="flex items-center gap-4">
          <button
            onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
            disabled={currentPage === 1}
            className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Previous
          </button>
          <span className="text-sm text-black">
            Page {currentPage} of {totalPages || 1}
          </span>
          <button
            onClick={() =>
              setCurrentPage((prev) => Math.min(prev + 1, totalPages))
            }
            disabled={currentPage === totalPages || totalPages === 0}
            className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
}

export default ExcelViewer;