// src/components/ProblemUpload.js

import React, { useState } from 'react';
import { uploadProblemImage } from '../services/api';
import { MathJax } from 'better-react-mathjax';
import { toast } from 'react-toastify';

function ProblemUpload() {
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploadStatus, setUploadStatus] = useState('');
  const [problemData, setProblemData] = useState(null);
  const [error, setError] = useState('');

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      console.log('Selected file:', file);
      // Validate file type
      const validTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/bmp', 'image/tiff'];
      if (!validTypes.includes(file.type)) {
        setError('Unsupported file type. Please upload a JPEG, PNG, GIF, BMP, or TIFF image.');
        setSelectedFile(null);
        return;
      }

      // Validate file size (e.g., max 5MB)
      const maxSize = 5 * 1024 * 1024; // 5MB
      if (file.size > maxSize) {
        setError('File size exceeds 5MB. Please upload a smaller image.');
        setSelectedFile(null);
        return;
      }

      setSelectedFile(file);
      setUploadStatus('');
      setProblemData(null);
      setError('');
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      setError('Please select an image to upload.');
      return;
    }

    try {
      setUploadStatus('Uploading and processing...');
      const formData = new FormData();
      formData.append('image', selectedFile); // Ensure the key is 'image'

      // Log FormData contents (for debugging)
      for (let pair of formData.entries()) {
        console.log(pair[0]+ ', ' + pair[1]);
      }

      const response = await uploadProblemImage(selectedFile);
      setUploadStatus('Upload and processing successful!');
      setProblemData(response.data);
      toast.success('Image uploaded and processed successfully!');
    } catch (err) {
      console.error(err);
      setUploadStatus('Upload failed.');
      if (err.response && err.response.data) {
        setError(err.response.data.error || 'An error occurred.');
        toast.error(err.response.data.error || 'An error occurred during upload.');
      } else {
        setError('An error occurred while uploading.');
        toast.error('An error occurred during upload.');
      }
    }
  };

  return (
    <div>
      <h2>Upload Problem Image</h2>
      <div className="mb-3">
        <label htmlFor="imageUpload" className="form-label">Select Image</label>
        <input
          type="file"
          className="form-control"
          id="imageUpload"
          accept=".jpeg,.jpg,.png,.gif,.bmp,.tiff"
          onChange={handleFileChange}
        />
      </div>
      <button className="btn btn-primary mb-3" onClick={handleUpload}>Upload and Convert</button>

      {uploadStatus && <p>{uploadStatus}</p>}
      {error && <p className="text-danger">{error}</p>}

      {problemData && (
        <div className="mt-4">
          <h3>Processed Problem</h3>
          <p><strong>Title:</strong> {problemData.title}</p>
          <p><strong>Difficulty:</strong> {problemData.difficulty}</p>
          <p><strong>Estimated Time:</strong> {problemData.estimated_time}</p>
          <p><strong>Keywords:</strong> {problemData.keywords.join(', ')}</p>
          <p><strong>Author:</strong> {problemData.author}</p>
          <p><strong>Status:</strong> {problemData.status}</p>
          <div>
            <strong>LaTeX Content:</strong>
            <MathJax>{problemData.latex_content}</MathJax>
          </div>
          <div className="mt-3">
            <button className="btn btn-success me-2" onClick={() => window.location.href = `/problems/${problemData.id}`}>View Problem</button>
            <button className="btn btn-secondary" onClick={() => window.location.reload()}>Upload Another</button>
          </div>
        </div>
      )}
    </div>
  );
}

export default ProblemUpload;
