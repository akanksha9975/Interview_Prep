import React, { useState, useEffect, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { uploadDocument, listDocuments, deleteDocument } from '../api/api';
import toast from 'react-hot-toast';

const Upload = () => {
  const [documents, setDocuments] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadingType, setUploadingType] = useState(null);

  useEffect(() => {
    fetchDocuments();
  }, []);

  const fetchDocuments = async () => {
    try {
      const response = await listDocuments();
      setDocuments(response.data.documents);
    } catch (error) {
      toast.error('Failed to fetch documents');
    }
  };

  const handleUpload = async (file, type) => {
    if (file.size > 2 * 1024 * 1024) {
      toast.error('File size must be less than 2MB');
      return;
    }

    setUploading(true);
    setUploadingType(type);
    setUploadProgress(0);

    const formData = new FormData();
    formData.append('file', file);
    formData.append('type', type);

    try {
      // Simulate progress
      const progressInterval = setInterval(() => {
        setUploadProgress((prev) => Math.min(prev + 10, 90));
      }, 200);

      await uploadDocument(formData);
      
      clearInterval(progressInterval);
      setUploadProgress(100);
      
      toast.success(`${type === 'resume' ? 'Resume' : 'Job Description'} uploaded successfully!`);
      await fetchDocuments();
    } catch (error) {
      toast.error(error.response?.data?.error || 'Upload failed');
    } finally {
      setUploading(false);
      setUploadingType(null);
      setUploadProgress(0);
    }
  };

  const handleDelete = async (id, type) => {
    if (!window.confirm(`Are you sure you want to delete this ${type}?`)) {
      return;
    }

    try {
      await deleteDocument(id);
      toast.success('Document deleted');
      await fetchDocuments();
    } catch (error) {
      toast.error('Failed to delete document');
    }
  };

  const resumeDoc = documents.find(doc => doc.type === 'resume');
  const jdDoc = documents.find(doc => doc.type === 'jd');

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 max-w-5xl">
        <h1 className="text-4xl font-bold text-center mb-2">Upload Documents</h1>
        <p className="text-gray-600 text-center mb-8">
          Upload your resume and job description to get started
        </p>

        <div className="grid md:grid-cols-2 gap-8">
          {/* Resume Upload */}
          <DocumentUploadCard
            title="Resume"
            type="resume"
            icon="📄"
            existingDoc={resumeDoc}
            onUpload={handleUpload}
            onDelete={handleDelete}
            uploading={uploading && uploadingType === 'resume'}
            uploadProgress={uploadProgress}
          />

          {/* Job Description Upload */}
          <DocumentUploadCard
            title="Job Description"
            type="jd"
            icon="💼"
            existingDoc={jdDoc}
            onUpload={handleUpload}
            onDelete={handleDelete}
            uploading={uploading && uploadingType === 'jd'}
            uploadProgress={uploadProgress}
          />
        </div>

        {resumeDoc && jdDoc && (
          <div className="mt-8 bg-green-50 border border-green-200 rounded-xl p-6 text-center">
            <p className="text-green-800 font-semibold mb-4">
              ✅ Both documents uploaded! You're ready to start practicing.
            </p>
            <a
              href="/chat"
              className="inline-block bg-green-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-green-700 transition"
            >
              Start Interview Practice →
            </a>
          </div>
        )}
      </div>
    </div>
  );
};

const DocumentUploadCard = ({ title, type, icon, existingDoc, onUpload, onDelete, uploading, uploadProgress }) => {
  const onDrop = useCallback((acceptedFiles) => {
    if (acceptedFiles.length > 0) {
      onUpload(acceptedFiles[0], type);
    }
  }, [onUpload, type]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'application/pdf': ['.pdf'] },
    maxFiles: 1,
    disabled: uploading
  });

  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <div className="flex items-center mb-4">
        <span className="text-4xl mr-3">{icon}</span>
        <h2 className="text-2xl font-bold">{title}</h2>
      </div>

      {existingDoc ? (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex justify-between items-start mb-2">
            <div>
              <p className="font-semibold text-blue-900">{existingDoc.filename}</p>
              <p className="text-sm text-blue-600">
                Uploaded: {new Date(existingDoc.uploadedAt).toLocaleDateString()}
              </p>
              <p className="text-sm text-blue-600">
                {existingDoc.chunksCount} chunks processed
              </p>
            </div>
            <button
              onClick={() => onDelete(existingDoc.id, type)}
              className="text-red-600 hover:text-red-800 font-semibold"
              aria-label={`Delete ${title}`}
            >
              🗑️ Delete
            </button>
          </div>
        </div>
      ) : (
        <div
          {...getRootProps()}
          className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition ${
            isDragActive
              ? 'border-blue-500 bg-blue-50'
              : 'border-gray-300 hover:border-blue-400 hover:bg-gray-50'
          } ${uploading ? 'opacity-50 cursor-not-allowed' : ''}`}
        >
          <input {...getInputProps()} />
          {uploading ? (
            <div>
              <div className="text-4xl mb-2">⏳</div>
              <p className="text-gray-700 font-semibold mb-2">Uploading...</p>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-blue-600 h-2 rounded-full transition-all"
                  style={{ width: `${uploadProgress}%` }}
                ></div>
              </div>
              <p className="text-sm text-gray-600 mt-2">{uploadProgress}%</p>
            </div>
          ) : isDragActive ? (
            <>
              <div className="text-4xl mb-2">📥</div>
              <p className="text-gray-700 font-semibold">Drop the PDF here</p>
            </>
          ) : (
            <>
              <div className="text-4xl mb-2">📤</div>
              <p className="text-gray-700 font-semibold mb-2">
                Drag & drop your PDF here
              </p>
              <p className="text-sm text-gray-500 mb-4">or click to browse</p>
              <p className="text-xs text-gray-400">Max file size: 2MB</p>
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default Upload;
