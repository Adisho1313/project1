// src/ColumnSelectionPage.js
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './App.css';

const ColumnSelectionPage = () => {
  const navigate = useNavigate();
  const [csvData, setCsvData] = useState([]);
  const [selectedColumns, setSelectedColumns] = useState({ source: '', target: '' });

  useEffect(() => {
    const data = localStorage.getItem('csvData');
    if (data) {
      setCsvData(JSON.parse(data)); // Parse the CSV data stored in localStorage
    } else {
      navigate('/'); // If no data is found, go back to the upload page
    }
  }, [navigate]);

  const handleColumnChange = (e) => {
    setSelectedColumns({
      ...selectedColumns,
      [e.target.name]: e.target.value,
    });
  };

  const handleVisualize = () => {
    if (selectedColumns.source && selectedColumns.target) {
      // Navigate to the VisualizationPage with CSV data and selected columns
      navigate('/visualize', { state: { data: csvData, columns: selectedColumns } });
    }
  };

  const columnNames = csvData.length > 0 ? Object.keys(csvData[0]) : [];

  return (
    <div className="select-columns-card">
      <h2>Select Columns to Visualize</h2>
      <form className="select-columns-form">
        <select name="source" onChange={handleColumnChange} className="column-select">
          <option value="">Select Source Column</option>
          {columnNames.map((col, index) => (
            <option key={index} value={col}>{col}</option>
          ))}
        </select>
        <select name="target" onChange={handleColumnChange} className="column-select">
          <option value="">Select Target Column</option>
          {columnNames.map((col, index) => (
            <option key={index} value={col}>{col}</option>
          ))}
        </select>
        <button type="button" className="primary-button" onClick={handleVisualize}>Open Visualization</button>
      </form>
    </div>
  );
};

export default ColumnSelectionPage;
