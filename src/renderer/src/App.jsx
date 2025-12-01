import React, { useState, useCallback } from 'react';
import CertificateForm from './components/CertificateForm';
import CertificatePreview from './components/CertificatePreview';
import { createCertificatePdf } from './components/CertificateGenerator';
import './App.css';

function App() {
  const [pdfUrl, setPdfUrl] = useState(null);

  const handleGenerate = useCallback(async (data) => {
    try {
      const pdfBytes = await createCertificatePdf(data);
      const blob = new Blob([pdfBytes], { type: 'application/pdf' });

      // Revoke old URL to prevent memory leaks
      if (pdfUrl) {
        URL.revokeObjectURL(pdfUrl);
      }

      const url = URL.createObjectURL(blob);
      setPdfUrl(url);
    } catch (error) {
      console.error("Failed to generate preview:", error);
      throw error; // Re-throw so the form can handle the error state
    }
  }, [pdfUrl]);

  return (
    <div className="app-container">
      <div className="app-header">
        <h1>Certificate Generator</h1>
        <p>Create and preview professional certificates instantly</p>
      </div>

      <div className="main-content">
        <div className="form-section">
          <CertificateForm onGenerate={handleGenerate} />
        </div>
        <div className="preview-section">
          <CertificatePreview pdfUrl={pdfUrl} />
        </div>
      </div>
    </div>
  );
}

export default App;
