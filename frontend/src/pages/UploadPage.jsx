import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAutoML } from '../context/AutoMLContext';
import client from '../api/client';
import { UploadCloud, FileText, AlertCircle, Loader } from 'lucide-react';
import './UploadPage.css';

const UploadPage = () => {
    const [file, setFile] = useState(null);
    const [uploading, setUploading] = useState(false);
    const [error, setError] = useState(null);
    const [isDragging, setIsDragging] = useState(false);
    const { setFileUrl, setMetadata, setTargetColumn, setEdaResults, setTrainResults, setModelUrl } = useAutoML();
    const navigate = useNavigate();

    const handleFileChange = (e) => {
        if (e.target.files && e.target.files[0]) {
            setFile(e.target.files[0]);
            setError(null);
        }
    };

    const handleDragOver = (e) => {
        e.preventDefault();
        setIsDragging(true);
    };

    const handleDragLeave = (e) => {
        e.preventDefault();
        setIsDragging(false);
    };

    const handleDrop = (e) => {
        e.preventDefault();
        setIsDragging(false);
        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            const uploadedFile = e.dataTransfer.files[0];
            if (!uploadedFile.name.endsWith('.csv')) {
                setError("Please upload a valid CSV file.");
                return;
            }
            setFile(uploadedFile);
            setError(null);
        }
    };

    const handleUpload = async (e) => {
        e.preventDefault();
        if (!file) {
            setError("Please select a dataset first.");
            return;
        }

        setUploading(true);
        setError(null);

        const formData = new FormData();
        formData.append('file', file);

        try {
            const response = await client.post('/upload', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            });

            if (response.data.status === 'success') {
                setFileUrl(response.data.data.fileUrl);
                setMetadata(response.data.data.metadata);
                setTargetColumn(null);
                setEdaResults(null);
                setTrainResults(null);
                setModelUrl(null);
                navigate('/preview');
            } else {
                setError(response.data.message || "Upload sequence failed.");
            }
        } catch (err) {
            console.error("Upload error:", err);
            setError(err.response?.data?.error || "Failed to establish upload logic. Please try again.");
        } finally {
            setUploading(false);
        }
    };

    return (
        <div className="upload-page-wrapper">
            <header className="upload-page-header">
                <h1 className="upload-page-title">Upload Dataset</h1>
                <p className="upload-page-subtitle">
                    Start by uploading your CSV dataset to begin the automated machine learning workflow.
                </p>
            </header>

            <div className="upload-card-container">
                <form onSubmit={handleUpload} className="upload-form">

                    {/* Interactive Drop Zone */}
                    <label
                        className={`file-drop-area ${isDragging ? 'active' : ''}`}
                        onDragOver={handleDragOver}
                        onDragLeave={handleDragLeave}
                        onDrop={handleDrop}
                    >
                        <UploadCloud size={64} className={`upload-icon ${isDragging ? 'dragging' : ''}`} />
                        <h3 className="drop-zone-title">
                            {isDragging ? "Drop to Upload" : "Click or Drag & Drop to Upload"}
                        </h3>
                        <p className="drop-zone-subtitle">Supported formats: CSV</p>

                        <input
                            type="file"
                            accept=".csv"
                            onChange={handleFileChange}
                            style={{ display: 'none' }}
                        />
                    </label>

                    {/* File Info Card */}
                    {file && (
                        <div className="file-info-card">
                            <div className="file-info-content">
                                <div className="file-icon-wrapper">
                                    <FileText size={24} />
                                </div>
                                <div className="file-details">
                                    <span className="file-name">{file.name}</span>
                                    <span className="file-size">{(file.size / 1024).toFixed(2)} KB</span>
                                </div>
                            </div>
                            <button type="button" onClick={() => setFile(null)} className="remove-file-btn" title="Remove file">✕</button>
                        </div>
                    )}

                    {/* Error Banner */}
                    {error && (
                        <div className="error-banner">
                            <AlertCircle size={20} />
                            <span>{error}</span>
                        </div>
                    )}

                    <button
                        type="submit"
                        disabled={!file || uploading}
                        className={`upload-submit-btn ${(!file || uploading) ? 'disabled' : ''}`}
                    >
                        {uploading ? (
                            <><Loader className="spinner" size={20} /> Uploading logic stream...</>
                        ) : 'Upload Dataset & Run Initial Analysis'}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default UploadPage;
