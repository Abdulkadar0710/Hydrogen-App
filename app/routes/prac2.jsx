import React, { useState } from 'react';
import { json } from '@shopify/remix-oxygen';

export default function Prac2() {
  const [file, setFile] = useState(null);

  const handleFileChange = (event) => {
    setFile(event.target.files[0]);
  };

  const handleUpload = async (event) => {
    event.preventDefault();
    if (!file) {
      alert('Please select a file first!');
      return;
    }

    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await fetch('/add-to-cart-from-csv', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();

      if (response.ok) { 
        alert('File uploaded successfully!');
        console.log('File upload response:', data);
      } else {
        alert('Failed to upload file.');
      }
    } catch (error) {
      console.error('Error uploading file:', error);
      alert('An error occurred while uploading the file.');
    }
  };

  return (
    <div>
      <h1>Upload CSV File</h1>
      <form onSubmit={handleUpload}>
        <input type="file" accept=".csv" onChange={handleFileChange} />
        <button type="submit">Upload</button>
      </form>
    </div>
  );
}