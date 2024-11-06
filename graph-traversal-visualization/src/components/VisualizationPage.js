// src/VisualizationPage.js
import React from 'react';
import { useLocation } from 'react-router-dom';
import CallGraph from './CallGraph';

const VisualizationPage = () => {
  const location = useLocation();
  const { data, columns } = location.state || {}; // Extract passed data and columns from route state

  // If no data or columns are passed, show an error message
  if (!data || !columns) {
    return <div>No data or columns selected for visualization.</div>;
  }

  return (
    <div className="visualization-page">
      <CallGraph data={data} columnSelections={columns} />
    </div>
  );
};

export default VisualizationPage;
