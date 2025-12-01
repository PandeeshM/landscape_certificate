import React, { useState, useEffect } from 'react';
import './CertificatePreview.css';

const CertificatePreview = ({ pdfUrl }) => {
    const [scale, setScale] = useState(1);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (pdfUrl) {
            setLoading(true);
            // Simulate loading or wait for iframe to load
            setTimeout(() => setLoading(false), 500);
        }
    }, [pdfUrl]);

    const handleZoomIn = () => {
        setScale(prev => Math.min(prev + 0.1, 2));
    };

    const handleZoomOut = () => {
        setScale(prev => Math.max(prev - 0.1, 0.5));
    };

    if (!pdfUrl) {
        return (
            <div className="preview-placeholder">
                <div className="placeholder-content">
                    <span className="placeholder-icon">📄</span>
                    <h3>Certificate Preview</h3>
                    <p>Fill out the form and click "Generate" to see the certificate here.</p>
                </div>
            </div>
        );
    }

    return (
        <div className="preview-container">
            <div className="preview-toolbar">
                <h3>Preview</h3>
                <div className="toolbar-actions">
                    <div className="zoom-controls">
                        <button onClick={handleZoomOut} title="Zoom Out">−</button>
                        <span className="zoom-level">{Math.round(scale * 100)}%</span>
                        <button onClick={handleZoomIn} title="Zoom In">+</button>
                    </div>
                    <a
                        href={pdfUrl}
                        download="certificate.pdf"
                        className="download-btn"
                        title="Download Certificate"
                    >
                        Download
                    </a>
                </div>
            </div>

            <div className="preview-content">
                {loading && <div className="preview-loading">Loading...</div>}
                <div
                    className="pdf-wrapper"
                    style={{
                        transform: `scale(${scale})`,
                        transformOrigin: 'top center'
                    }}
                >
                    <embed
                        src={`${pdfUrl}#toolbar=0&view=FitH`}
                        type="application/pdf"
                        title="Certificate Preview"
                        className="pdf-iframe"
                    />
                </div>
            </div>
        </div>
    );
};

export default CertificatePreview;
