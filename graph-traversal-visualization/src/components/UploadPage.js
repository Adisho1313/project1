// src/UploadPage.js
import React from 'react';
import Papa from 'papaparse';
import { useNavigate } from 'react-router-dom'; // Import useNavigate
import './App.css'; // Assuming you consolidated styles into App.css

const UploadPage = () => {
    const navigate = useNavigate(); // Initialize useNavigate

    const handleFileChange = (event) => {
        const file = event.target.files[0];
        if (file) {
            Papa.parse(file, {
                header: true,
                complete: (result) => {
                    // Store parsed data in local storage or state management
                    localStorage.setItem('csvData', JSON.stringify(result.data));
                    navigate('/select-columns'); // Navigate to select-columns page
                },
            });
        }
    };

    return (
        <div className="upload">
            <h2>Import CSV</h2>
            <input type="file" accept=".csv" onChange={handleFileChange} className="file-input" />
            {/* <p className="drag-drop-text">Drag and drop your CSV file here!</p> */}
        </div>
    );
};

export default UploadPage;
