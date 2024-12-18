// src/components/SheetVisibilityControl.jsx
import React from 'react';

function SheetVisibilityControl({ sheetNames, visibleSheets, onChange }) {
  return (
    <div className="bg-white rounded-lg shadow p-6 mb-6">
      <h3 className="text-lg font-bold mb-4">Manage Sheet Visibility</h3>
      <p className="text-sm text-gray-600 mb-4">Select which sheets will be visible to users:</p>
      <div className="flex flex-wrap gap-4">
        {sheetNames.map((sheetName) => (
          <label key={sheetName} className="flex items-center min-w-[150px]">
            <input
              type="checkbox"
              checked={visibleSheets.includes(sheetName)}
              onChange={(e) => {
                if (e.target.checked) {
                  onChange([...visibleSheets, sheetName]);
                } else {
                  onChange(visibleSheets.filter(sheet => sheet !== sheetName));
                }
              }}
              className="form-checkbox h-4 w-4 text-yellow-600"
            />
            <span className="ml-2 truncate">{sheetName}</span>
          </label>
        ))}
      </div>
    </div>
  );
}

export default SheetVisibilityControl;