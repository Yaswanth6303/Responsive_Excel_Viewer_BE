// Updated UserDashboard.jsx
import { useState, useEffect } from "react";
import ExcelViewer from "./ExcelViewer";
import logo from '../assets/logo.svg';

function UserDashboard() {
  const [excelData, setExcelData] = useState(null);
  const [sheetNames, setSheetNames] = useState([]);
  const [visibleSheets, setVisibleSheets] = useState([]);
  const [selectedSheet, setSelectedSheet] = useState("");

  useEffect(() => {
    const savedData = localStorage.getItem("excelData");
    const savedSheets = localStorage.getItem("sheetNames");
    const savedVisibleSheets = localStorage.getItem("visibleSheets");
    const savedSelectedSheet = localStorage.getItem("selectedSheet");

    if (savedData && savedSheets && savedVisibleSheets) {
      try {
        const parsedData = JSON.parse(savedData);
        const parsedVisibleSheets = JSON.parse(savedVisibleSheets);

        // Only load visible sheets
        const filteredData = {};
        parsedVisibleSheets.forEach((sheet) => {
          if (parsedData[sheet]) {
            filteredData[sheet] = parsedData[sheet];
          }
        });

        setExcelData(filteredData);
        setVisibleSheets(parsedVisibleSheets);
        setSheetNames(parsedVisibleSheets);

        // Set selected sheet to either the saved selection (if visible) or the first visible sheet
        const initialSheet = parsedVisibleSheets.includes(savedSelectedSheet)
          ? savedSelectedSheet
          : parsedVisibleSheets[0];
        setSelectedSheet(initialSheet || "");
      } catch (error) {
        console.error("Error loading saved data:", error);
      }
    }
  }, []);

  const handleSheetChange = (sheetName) => {
    setSelectedSheet(sheetName);
    localStorage.setItem("selectedSheet", sheetName);
  };

  return (
    <div className="min-h-screen bg-gray-50 h-[600px]">
      <p className="bg-white h-[85px] pt-2"><img src={logo} alt="Logo" class="mx-auto"/></p>
      <nav className="bg-blue-950 shadow-sm h-16 z-10 sticky top-0">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <h1 className="text-xl text-white font-semibold">User Dashboard</h1>
          <span className="text-white">Welcome, User</span>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto p-4">
        {/* Sheet Selection - Only shown when there are multiple visible sheets */}
        {sheetNames.length > 1 && (
          <div className="bg-white rounded-lg shadow p-6 mb-6">
            <h3 className="text-lg font-bold mb-4">Select Sheet</h3>
            <div className="flex flex-wrap gap-4">
              {sheetNames.map((sheetName) => (
                <label key={sheetName} className="inline-flex items-center">
                  <input
                    type="radio"
                    className="form-radio text-yellow-600"
                    name="sheet"
                    value={sheetName}
                    checked={selectedSheet === sheetName}
                    onChange={() => handleSheetChange(sheetName)}
                  />
                  <span className="ml-2">{sheetName}</span>
                </label>
              ))}
            </div>
          </div>
        )}

        {excelData && selectedSheet ? (
          <ExcelViewer excelData={excelData[selectedSheet]} />
        ) : (
          <div className="bg-white rounded-lg shadow p-6 text-center">
            <p className="text-gray-500">
              {visibleSheets.length === 0
                ? "To be updated."
                : "Please select a sheet to view its contents."}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

export default UserDashboard;
