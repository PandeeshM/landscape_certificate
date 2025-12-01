import React, { useState, useEffect } from 'react';
import './CertificateForm.css';

const CertificateForm = ({ onGenerate }) => {
  const [formData, setFormData] = useState({
    studentName: '',
    year: 'I',
    courseName: '',
    institutionName: '',
    visitDate: '',
    certificateTitle: 'Certificate of Participation',
    logo: '',
    signature: ''
  });

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [fileNames, setFileNames] = useState({
    logo: '',
    signature: ''
  });

  // Function to validate date format and range
  const isValidDate = (dateStr) => {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
      setMessage('Please enter date in YYYY-MM-DD format with 4-digit year');
      return false;
    }

    const date = new Date(dateStr);
    const year = date.getFullYear();

    if (isNaN(date.getTime()) || year < 1900 || year > 2100) {
      setMessage('Please enter a valid date between 1900 and 2100');
      return false;
    }

    const [inputYear, inputMonth, inputDay] = dateStr.split('-').map(Number);
    if (date.getFullYear() !== inputYear ||
      date.getMonth() + 1 !== inputMonth ||
      date.getDate() !== inputDay) {
      setMessage('Please enter a valid date');
      return false;
    }

    setMessage('');
    return true;
  };

  const handleChange = (e) => {
    const { name, files, value } = e.target;

    if (files && files.length > 0) {
      const file = files[0];
      setFileNames(prev => ({ ...prev, [name]: file.name }));

      const isPNG = file.type.startsWith('image/png') ||
        file.name.toLowerCase().endsWith('.png');

      if (!isPNG) {
        setMessage('Please upload a PNG file!');
        return;
      }

      if (file.size > 5 * 1024 * 1024) {
        setMessage('File size must be less than 5MB!');
        return;
      }

      const reader = new FileReader();
      reader.onload = (event) => {
        const result = event.target.result;
        if (typeof result === 'string' && result.startsWith('data:')) {
          const base64Data = result.split(',')[1];
          if (base64Data) {
            const pngDataUrl = `data:image/png;base64,${base64Data}`;
            setFormData((prev) => ({ ...prev, [name]: pngDataUrl }));
          } else {
            setMessage('Failed to extract image data!');
          }
        } else {
          setMessage('Failed to read image data!');
        }
      };

      reader.onerror = () => {
        setMessage('Error reading the file. Please try again.');
      };

      reader.readAsDataURL(file);
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  // Live preview effect - only trigger when required fields are filled
  useEffect(() => {
    // Only generate preview if minimum required fields are present
    if (!formData.studentName || !formData.courseName || !formData.institutionName || !formData.visitDate) {
      return;
    }

    const timer = setTimeout(() => {
      // Silently generate preview without showing errors
      onGenerate(formData).catch(() => {
        // Ignore errors in live preview
      });
    }, 2000); // Increased delay to 2 seconds

    return () => clearTimeout(timer);
  }, [formData.studentName, formData.courseName, formData.institutionName, formData.visitDate, formData.year, formData.logo, formData.signature]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    if (!isValidDate(formData.visitDate)) {
      setMessage('Please enter a valid visit date with 4-digit year (YYYY-MM-DD)');
      setLoading(false);
      return;
    }

    try {
      await onGenerate(formData);
      setMessage('Certificate generated successfully!');
    } catch (err) {
      console.error('Error in onGenerate:', err);
      if (err.message && err.message.includes('PNG file')) {
        setMessage('Failed to load required assets. Please ensure all image files are in PNG format.');
      } else {
        setMessage('Failed to generate certificate. Please check your inputs and try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="certificate-form-container">
      <div className="form-header">
        <h2>Certificate Details</h2>
        <p>Enter the student and event details below to generate the certificate.</p>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="form-grid">
          <div className="form-group">
            <label className="form-label">Student Name</label>
            <input
              className="form-input"
              name="studentName"
              placeholder="e.g. John Doe"
              required
              value={formData.studentName}
              onChange={handleChange}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Year</label>
            <select
              className="form-select"
              name="year"
              required
              value={formData.year}
              onChange={handleChange}
            >
              <option value="">Select Year</option>
              <option value="I">I Year</option>
              <option value="II">II Year</option>
              <option value="III">III Year</option>
              <option value="IV">IV Year</option>
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">Course Name</label>
            <input
              className="form-input"
              name="courseName"
              placeholder="e.g. Computer Science"
              required
              value={formData.courseName}
              onChange={handleChange}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Institution Name</label>
            <input
              className="form-input"
              name="institutionName"
              placeholder="e.g. Tech University"
              required
              value={formData.institutionName}
              onChange={handleChange}
            />
          </div>

          <div className="form-group full-width">
            <label className="form-label">Date of Visit</label>
            <input
              className="form-input"
              name="visitDate"
              type="date"
              required
              value={formData.visitDate}
              onChange={handleChange}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Institution Logo</label>
            <div className="file-input-wrapper">
              <input
                name="logo"
                type="file"
                accept="image/png"
                onChange={handleChange}
              />
              <div className="file-input-content">
                <span className="file-icon">📷</span>
                <span>{fileNames.logo || 'Click to upload Logo (PNG)'}</span>
              </div>
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Authorized Signature</label>
            <div className="file-input-wrapper">
              <input
                name="signature"
                type="file"
                accept="image/png"
                onChange={handleChange}
              />
              <div className="file-input-content">
                <span className="file-icon">✍️</span>
                <span>{fileNames.signature || 'Click to upload Signature (PNG)'}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="form-actions">
          <button type="submit" className="submit-btn" disabled={loading}>
            {loading ? 'Processing...' : 'Download Certificate'}
          </button>
        </div>

        {message && (
          <div className={`message ${message.includes('successfully') ? 'success' : 'error'}`}>
            {message}
          </div>
        )}
      </form>
    </div>
  );
};

export default CertificateForm;
