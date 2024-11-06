import React, { useState } from 'react';

const ColumnSelector = ({ columns, onSelectionChange }) => {
  const [sourceColumn, setSourceColumn] = useState('');
  const [targetColumn, setTargetColumn] = useState('');

  const handleSourceChange = (e) => {
    setSourceColumn(e.target.value);
    onSelectionChange(e.target.value, targetColumn1);
  };

  const handleTargetChange = (e) => {
    setTargetColumn(e.target.value);
    onSelectionChange(sourceColumn, e.target.value);
  };

  return (
    <div className='select-card'>
      <label htmlFor="source">Source Column:</label>
      <select id="source" value={sourceColumn} onChange={handleSourceChange}>
        <option value="">--Select--</option>
        {columns.map((col, index) => (
          <option key={index} value={col}>{col}</option>
        ))}
      </select>

      <label htmlFor="target">Target Column:</label>
      <select id="target" value={targetColumn} onChange={handleTargetChange}>
        <option value="">--Select--</option>
        {columns.map((col, index) => (
          <option key={index} value={col}>{col}</option>
        ))}
      </select>
    </div>
  );
};

export default ColumnSelector;
