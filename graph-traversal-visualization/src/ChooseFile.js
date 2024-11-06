// src/ChooseFile.js
import React, { useState } from 'react';

const ChooseFile = () => {
  const [selectedFile, setSelectedFile] = useState(null);

  const handleFileChange = (e) => {
    setSelectedFile(e.target.files[0]);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (selectedFile) {
      console.log("File selected:", selectedFile);
      // Process the file here (e.g., send it to a server or parse it)
    } else {
      console.log("No file selected.");
    }
  };

  return (
    <div className="container mt-5">
      <h2>Choose a File to Import</h2>
      <form onSubmit={handleSubmit}>
        <div className="mb-3">
          <input type="file" className="form-control" onChange={handleFileChange} />
        </div>
        <button type="submit" className="btn btn-primary">Submit</button>
      </form>
    </div>
  );
};

export default ChooseFile;
