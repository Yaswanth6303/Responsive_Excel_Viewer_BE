import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import * as XLSX from "xlsx";
import { useAuth } from "../context/AuthContext";
import ExcelViewer from "./ExcelViewer";
import SheetVisibilityControl from "./SheetVisibilityControl";
import { toast, Toaster } from "react-hot-toast";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "./ui/alert-dialog";
import logo from "../assets/logo.svg";

function AdminDashboard() {
  const [excelFile, setExcelFile] = useState(null);
  const [typeError, setTypeError] = useState(null);
  const [excelData, setExcelData] = useState(null);
  const [sheetNames, setSheetNames] = useState([]);
  const [selectedSheet, setSelectedSheet] = useState("");
  const [visibleSheets, setVisibleSheets] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const [showSheetControls, setShowSheetControls] = useState(true);
  const [showClearWarning, setShowClearWarning] = useState(false);

  const [pendingChanges, setPendingChanges] = useState({
    visibleSheets: null,
    excelData: null,
    sheetNames: null,
    selectedSheet: null,
  });

  const [temporaryState, setTemporaryState] = useState({
    excelData: null,
    sheetNames: [],
    selectedSheet: "",
    visibleSheets: [],
  });
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  const { user, logout } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    loadSavedData();
  }, []);

  const loadSavedData = () => {
    try {
      const savedData = localStorage.getItem("excelData");
      const savedSheets = localStorage.getItem("sheetNames");
      const savedSelectedSheet = localStorage.getItem("selectedSheet");
      const savedVisibleSheets = localStorage.getItem("visibleSheets");

      if (savedData && savedSheets) {
        setExcelData(JSON.parse(savedData));
        setSheetNames(JSON.parse(savedSheets));
        setSelectedSheet(savedSelectedSheet || "");
        setVisibleSheets(
          savedVisibleSheets ? JSON.parse(savedVisibleSheets) : []
        );
      } else {
        // Reset state if no saved data exists
        setExcelData(null);
        setSheetNames([]);
        setSelectedSheet("");
        setVisibleSheets([]);
      }
    } catch (error) {
      console.error("Error loading saved data:", error);
      clearLocalStorage();
    }
  };

  const clearLocalStorage = () => {
    localStorage.removeItem("excelData");
    localStorage.removeItem("sheetNames");
    localStorage.removeItem("selectedSheet");
    localStorage.removeItem("visibleSheets");
  };

  const handleFile = (e) => {
    const fileTypes = [
      "application/vnd.ms-excel",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "text/csv",
    ];

    const selectedFile = e.target.files[0];

    if (selectedFile) {
      if (fileTypes.includes(selectedFile.type)) {
        setTypeError(null);
        const reader = new FileReader();

        reader.readAsArrayBuffer(selectedFile);
        reader.onload = (e) => {
          setExcelFile(e.target.result);
          setUploadSuccess(false);
        };
        reader.onerror = () => {
          setTypeError("Error reading file");
          setExcelFile(null);
        };
      } else {
        setTypeError("Please select only Excel file types");
        setExcelFile(null);
      }
    }
  };

  const handleFileSubmit = async (e) => {
    e.preventDefault();
    if (excelData) {
      setShowClearWarning(true);
      return; // Prevent further execution if data exists
    }
    if (excelFile !== null) {
      try {
        setIsLoading(true);
        const workbook = XLSX.read(excelFile, { type: "buffer" });
        const sheets = workbook.SheetNames;

        if (sheets.length === 0) {
          setTypeError("The Excel file appears to be empty");
          return;
        }

        const allSheetsData = {};
        sheets.forEach((sheet) => {
          const worksheet = workbook.Sheets[sheet];
          allSheetsData[sheet] = XLSX.utils.sheet_to_json(worksheet);
        });

        setPendingChanges({
          excelData: allSheetsData,
          sheetNames: sheets,
          selectedSheet: sheets[0],
          visibleSheets: [sheets[0]],
        });
        setHasUnsavedChanges(true);
        setUploadSuccess(true);
        setTypeError(null);
      } catch (error) {
        console.error("Error processing file:", error);
        setTypeError(
          "Error processing the Excel file. Please check the file format."
        );
      } finally {
        setIsLoading(false);
      }
    }
  };

  const handleSheetChange = (sheetName) => {
    // Always update the selected sheet, even if it's the same as the current one
    setPendingChanges((prev) => ({
      ...prev,
      selectedSheet: sheetName,
    }));

    // Only set hasUnsavedChanges if the sheet is different from the current selected sheet
    if (sheetName !== (selectedSheet || pendingChanges.selectedSheet)) {
      setHasUnsavedChanges(false);
    }
  };

  const handleVisibleSheetsChange = (newVisibleSheets) => {
    if (newVisibleSheets.length === 0) {
      alert("At least one sheet must be visible to users");
      return;
    }

    setPendingChanges((prev) => ({
      ...prev,
      visibleSheets: newVisibleSheets,
      selectedSheet: !newVisibleSheets.includes(
        prev.selectedSheet || selectedSheet
      )
        ? newVisibleSheets[0]
        : prev.selectedSheet || selectedSheet,
    }));
    setHasUnsavedChanges(true);
  };

  const handleConfirmChanges = () => {
    // Apply changes to the state
    if (pendingChanges.excelData) {
      setExcelData(pendingChanges.excelData);
    }
    if (pendingChanges.sheetNames) {
      setSheetNames(pendingChanges.sheetNames);
    }
    if (pendingChanges.selectedSheet) {
      setSelectedSheet(pendingChanges.selectedSheet);
    }
    if (pendingChanges.visibleSheets) {
      setVisibleSheets(pendingChanges.visibleSheets);
    }

    // Save the changes to localStorage
    if (pendingChanges.excelData) {
      localStorage.setItem(
        "excelData",
        JSON.stringify(pendingChanges.excelData)
      );
    }
    if (pendingChanges.sheetNames) {
      localStorage.setItem(
        "sheetNames",
        JSON.stringify(pendingChanges.sheetNames)
      );
    }
    if (pendingChanges.selectedSheet) {
      localStorage.setItem("selectedSheet", pendingChanges.selectedSheet);
    }
    if (pendingChanges.visibleSheets) {
      localStorage.setItem(
        "visibleSheets",
        JSON.stringify(pendingChanges.visibleSheets)
      );
    }

    // Clear the temporary state and pending changes
    setTemporaryState({
      excelData: null,
      sheetNames: [],
      selectedSheet: "",
      visibleSheets: [],
    });

    setPendingChanges({
      visibleSheets: null,
      excelData: null,
      sheetNames: null,
      selectedSheet: null,
    });

    setHasUnsavedChanges(false);
    setShowConfirmDialog(false);

    toast.success("Changes have been applied successfully!");
  };

  const handleCancelChanges = () => {
    // Restore data from temporary state if it exists
    if (temporaryState.excelData !== null) {
      setExcelData(temporaryState.excelData);
      setSheetNames(temporaryState.sheetNames);
      setSelectedSheet(temporaryState.selectedSheet);
      setVisibleSheets(temporaryState.visibleSheets);

      // Restore local storage with the original data
      if (temporaryState.excelData) {
        localStorage.setItem(
          "excelData",
          JSON.stringify(temporaryState.excelData)
        );
      }
      if (temporaryState.sheetNames) {
        localStorage.setItem(
          "sheetNames",
          JSON.stringify(temporaryState.sheetNames)
        );
      }
      if (temporaryState.selectedSheet) {
        localStorage.setItem("selectedSheet", temporaryState.selectedSheet);
      }
      if (temporaryState.visibleSheets) {
        localStorage.setItem(
          "visibleSheets",
          JSON.stringify(temporaryState.visibleSheets)
        );
      }

      // Clear temporary state
      setTemporaryState({
        excelData: null,
        sheetNames: [],
        selectedSheet: "",
        visibleSheets: [],
      });
    }

    // Restore visibility of sheet controls
    setShowSheetControls(true);

    setPendingChanges({
      visibleSheets: null,
      excelData: null,
      sheetNames: null,
      selectedSheet: null,
    });
    setHasUnsavedChanges(false);
    setShowConfirmDialog(false);
    toast.error("Changes have been discarded!");
  };

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const handleClearData = () => {
    // Clear local storage to remove any saved data
    clearLocalStorage(); // Ensure local storage is cleared

    // Store current state before clearing
    setTemporaryState({
      excelData: excelData,
      sheetNames: sheetNames,
      selectedSheet: selectedSheet,
      visibleSheets: visibleSheets,
    });

    // Set pending changes to clear all data
    setPendingChanges({
      visibleSheets: [],
      excelData: null,
      sheetNames: [],
      selectedSheet: "",
    });

    setExcelData(null);
    setSelectedSheet("");
    setShowSheetControls(false);
    setHasUnsavedChanges(true);
    toast.success(
      "Data cleared from display. Click 'Apply Changes' to confirm."
    );
  };

  const getChangeSummary = () => {
    const changes = [];

    if (pendingChanges.excelData) {
      changes.push({
        type: "file",
        description: "New Excel file loaded",
        icon: "📄",
      });
    }

    if (pendingChanges.visibleSheets) {
      const currentVisible = visibleSheets || [];
      const newVisible = pendingChanges.visibleSheets || [];

      const addedSheets = newVisible.filter(
        (sheet) => !currentVisible.includes(sheet)
      );
      const removedSheets = currentVisible.filter(
        (sheet) => !newVisible.includes(sheet)
      );

      if (addedSheets.length > 0) {
        changes.push({
          type: "visibility-added",
          description: `Made visible: ${addedSheets.join(", ")}`,
          icon: "👁️",
        });
      }
      if (removedSheets.length > 0) {
        changes.push({
          type: "visibility-removed",
          description: `Hidden from users: ${removedSheets.join(", ")}`,
          icon: "🔒",
        });
      }
    }

    if (
      pendingChanges.selectedSheet &&
      pendingChanges.selectedSheet !== selectedSheet
    ) {
      changes.push({
        type: "selection",
        description: `Changed selected sheet to: ${pendingChanges.selectedSheet}`,
        icon: "📑",
      });
    }

    return changes.length > 0
      ? changes
      : [
          {
            type: "none",
            description: "No changes to apply",
            icon: "ℹ️",
          },
        ];
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <Toaster
        toastOptions={{
          success: {
            style: {
              background: "#4CAF50",
              color: "#fff",
            },
          },
          error: {
            style: {
              background: "#F44336",
              color: "#fff",
            },
          },
        }}
      />

      {/* Navigation Bar */}
      <div className="min-h-screen bg-gray-50 h-[600px]">
        <p className="bg-white h-[85px] pt-2">
          <img src={logo} alt="Logo" class="mx-auto" />
        </p>
        <nav className="bg-blue-950 shadow-sm h-16 z-10 sticky top-0">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
            <h1 className="text-xl text-white font-semibold">
              Admin Dashboard
            </h1>
            <div className="flex items-center gap-4">
              <span className="text-white">Welcome Admin</span>
              <button
                onClick={handleLogout}
                className="bg-yellow-600 text-white px-4 py-2 rounded hover:bg-red-600 transition-colors"
              >
                Logout
              </button>
            </div>
          </div>
        </nav>

        {/* Main Content */}
        <div className="max-w-7xl mx-auto p-4">
          {/* File Upload Section */}
          <div className="bg-white rounded-lg shadow p-6 mb-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold">Upload Excel File</h3>
              {(excelData || pendingChanges.excelData) && (
                <button
                  onClick={handleClearData}
                  className="text-orange-600 hover:text-red-600 text-sm"
                >
                  Clear Uploaded Data
                </button>
              )}
            </div>

            <form
              className="flex flex-col gap-4 w-full max-w-md"
              onSubmit={handleFileSubmit}
            >
              <div className="flex flex-col gap-2">
                <input
                  type="file"
                  className="p-2 border border-gray-300 rounded"
                  required
                  onChange={handleFile}
                  accept=".xlsx,.xls,.csv"
                  disabled={!!excelData} // Disable if excelData exists
                />
                {typeError && (
                  <p className="text-red-500 text-sm">{typeError}</p>
                )}
                {uploadSuccess && (
                  <p className="text-yellow-600 text-sm">
                    {" "}
                    File uploaded successfully! Don't forget to apply changes.{" "}
                  </p>
                )}
                {showClearWarning && (
                  <p className="text-red-500 text-sm">
                    {" "}
                    Clear the old Excel file before uploading a new one.{" "}
                  </p>
                )}
              </div>
              <button
                type="submit"
                disabled={!excelFile || isLoading || !!excelData} // Disable if excelData exists
                className="bg-yellow-600 text-white py-2 px-4 rounded hover:bg-yellow-700 transition-colors 
                       disabled:opacity-50 disabled:cursor-not-allowed flex justify-center items-center gap-2"
              >
                {isLoading ? (
                  <>
                    {" "}
                    <span className="animate-spin">↻</span> Processing...{" "}
                  </>
                ) : (
                  "Upload"
                )}
              </button>
            </form>
          </div>

          {/* Sheet Visibility Control */}
          {showSheetControls &&
            (sheetNames.length > 0 ||
              pendingChanges.sheetNames?.length > 0) && (
              <SheetVisibilityControl
                sheetNames={pendingChanges.sheetNames || sheetNames}
                visibleSheets={pendingChanges.visibleSheets || visibleSheets}
                onChange={handleVisibleSheetsChange}
              />
            )}

          {/* Sheet Selection */}
          {showSheetControls &&
            (sheetNames.length > 1 ||
              pendingChanges.sheetNames?.length > 1) && (
              <div className="bg-white rounded-lg shadow p-6 mb-6">
                <h3 className="text-lg font-bold mb-4">Select Sheet to View</h3>
                <div className="flex flex-wrap gap-4">
                  {(pendingChanges.sheetNames || sheetNames).map(
                    (sheetName) => (
                      <label
                        key={sheetName}
                        className="inline-flex items-center"
                      >
                        <input
                          type="radio"
                          className="form-radio text-yellow-600"
                          name="sheet"
                          value={sheetName}
                          checked={
                            (pendingChanges.selectedSheet || selectedSheet) ===
                            sheetName
                          }
                          onChange={() => handleSheetChange(sheetName)}
                        />
                        <span className="ml-2">{sheetName}</span>
                      </label>
                    )
                  )}
                </div>
              </div>
            )}

          {/* Excel Data Viewer */}
          {(excelData || pendingChanges.excelData) &&
            (pendingChanges.selectedSheet || selectedSheet) && (
              <ExcelViewer
                excelData={
                  (pendingChanges.excelData || excelData)[
                    pendingChanges.selectedSheet || selectedSheet
                  ]
                }
              />
            )}

          {/* No Data Message */}
          {!excelData && !pendingChanges.excelData && !isLoading && (
            <div className="bg-white rounded-lg shadow p-6 text-center">
              <p className="text-gray-500">
                No data available. Please upload an Excel file to view its
                contents.
              </p>
            </div>
          )}
        </div>

        {/* Fixed Action Bar */}
        {hasUnsavedChanges && (
          <div className="fixed bottom-0 left-0 right-0 bg-blue-950 border-t border-gray-200 shadow-lg">
            <div className="max-w-7xl mx-auto px-4 py-4 sm:px-6 lg:px-8">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <span className="text-yellow-600">●</span>
                  <span className="text-white">You have unsaved changes</span>
                </div>
                <div className="flex space-x-4">
                  <button
                    onClick={() => setShowConfirmDialog(true)}
                    className="bg-yellow-600 text-white px-6 py-2 rounded-md hover:bg-yellow-700 transition-colors flex items-center space-x-2"
                  >
                    <span>Apply Changes</span>
                  </button>
                  <button
                    onClick={handleCancelChanges}
                    className="text-white hover:text-gray-400 px-4 py-2"
                  >
                    Discard Changes
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Confirmation Dialog */}
        <AlertDialog
          open={showConfirmDialog}
          onOpenChange={setShowConfirmDialog}
        >
          <AlertDialogContent className="max-w-md">
            <AlertDialogHeader>
              <AlertDialogTitle className="text-xl mb-2">
                Confirm Changes
              </AlertDialogTitle>
              <AlertDialogDescription>
                <div className="mt-4">
                  <h4 className="font-medium text-gray-900 mb-3">
                    The following changes will be applied:
                  </h4>
                  <div className="space-y-3">
                    {getChangeSummary().map((change, index) => (
                      <div
                        key={index}
                        className={`
                        flex items-start gap-3 p-3 rounded-lg
                        ${
                          change.type === "visibility-added"
                            ? "bg-yellow-50"
                            : ""
                        }
                        ${
                          change.type === "visibility-removed"
                            ? "bg-yellow-50"
                            : ""
                        }
                        ${change.type === "file" ? "bg-blue-50" : ""}
                        ${change.type === "selection" ? "bg-orange-50" : ""}
                        ${change.type === "none" ? "bg-gray-50" : ""}
                      `}
                      >
                        <span className="text-lg">{change.icon}</span>
                        <span className="text-sm text-gray-700">
                          {change.description}
                        </span>
                      </div>
                    ))}
                  </div>

                  {getChangeSummary().some(
                    (change) => change.type !== "none"
                  ) && (
                    <p className="mt-4 text-sm text-gray-500">
                      These changes will be visible to users after confirmation.
                    </p>
                  )}
                </div>
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter className="mt-6">
              <AlertDialogCancel
                onClick={handleCancelChanges}
                className="hover:bg-gray-100"
              >
                Cancel
              </AlertDialogCancel>
              <AlertDialogAction
                onClick={handleConfirmChanges}
                className={`
                bg-yellow-600 text-white hover:bg-yellow-700
                ${
                  getChangeSummary().every((change) => change.type === "none")
                    ? "opacity-50 cursor-not-allowed"
                    : ""
                }
              `}
                disabled={getChangeSummary().every(
                  (change) => change.type === "none"
                )}
              >
                Apply Changes
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  );
}

export default AdminDashboard;
