import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import UploadPage from './UploadPage';
import ColumnSelectionPage from './ColumnSelectionPage';
import VisualizationPage from './VisualizationPage';
import 'bootstrap/dist/css/bootstrap.min.css';

import './App.css';

const App = () => {
  const [csvData, setCsvData] = useState([]); // State to hold the CSV data

  return (
    <Router>
      <div className="App">
        {/* <h1>CSV Call Graph Visualization</h1> */}
        <Routes>
          <Route path="/" element={<UploadPage onFileParsed={setCsvData} />} />
          <Route path="/select-columns" element={<ColumnSelectionPage data={csvData} />} />
          <Route path="/visualize" element={<VisualizationPage data={csvData} />} />
        </Routes>
      </div>
    </Router>
  );
};

export default App;
