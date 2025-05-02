import React, { useState } from 'react';
import '../src/assets/main.css';
  
const CertificateForm = ({ onGenerate }) => {
  const [formData, setFormData] = useState({
    studentName: '',
    institutionName: '',
    visitDate: '',
    companyName: '',
    certificateTitle: 'Certificate Of Participation',
    serialNumber: '',
    logo: null,
    signature: null,
  });

  const [isGenerating, setIsGenerating] = useState(false);
  const [previewImg, setPreviewImg] = useState(null);
  const [previewSignature, setPreviewSignature] = useState(null);
  const [toast, setToast] = useState({ show: false, message: '', type: '' });
  const [formErrors, setFormErrors] = useState({});
  const [formTouched, setFormTouched] = useState({});

  const validateField = (name, value) => {
    if (!value) {
      setFormErrors((prev) => ({ ...prev, [name]: 'This field is required.' }));
    } else {
      setFormErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const handleBlur = (e) => {
    const { name, value } = e.target;
    setFormTouched((prev) => ({ ...prev, [name]: true }));
    validateField(name, value);
  };

  const handleChange = (e) => {
    const { name, value, files } = e.target;

    if (files && files[0]) {
      const reader = new FileReader();
      reader.onload = () => {
        setFormData((prev) => ({
          ...prev,
          [name]: reader.result,
        }));
        if (name === 'logo') {
          setPreviewImg(reader.result);
        }
        if (name === 'signature') {
          setPreviewSignature(reader.result);
        }
      };
      reader.readAsDataURL(files[0]);
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setIsGenerating(true);
    try {
      onGenerate(formData);
      setToast({ show: true, message: 'Certificate generated successfully!', type: 'success' });
    } catch (error) {
      setToast({ show: true, message: 'Failed to generate certificate.', type: 'error' });
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} style={{ padding: 20 }}>
      <div>
        <label>Student Name:</label>
        <input
          name="studentName"
          placeholder="Student Name"
          value={formData.studentName}
          onChange={handleChange}
          onBlur={handleBlur}
          required
        />
        {formTouched.studentName && formErrors.studentName && (
          <span className="error">{formErrors.studentName}</span>
        )}
      </div>

      <div>
        <label>Institution Name:</label>
        <input
          name="institutionName"
          placeholder="Institution Name"
          value={formData.institutionName}
          onChange={handleChange}
          onBlur={handleBlur}
          required
        />
        {formTouched.institutionName && formErrors.institutionName && (
          <span className="error">{formErrors.institutionName}</span>
        )}
      </div>

      <div>
        <label>Visit Date:</label>
        <input
          type="date"
          name="visitDate"
          value={formData.visitDate}
          onChange={handleChange}
          onBlur={handleBlur}
          required
        />
      </div>

      <div>
        <label>Company Name:</label>
        <input
          name="companyName"
          placeholder="Company Name"
          value={formData.companyName}
          onChange={handleChange}
          onBlur={handleBlur}
          required
        />
      </div>

      <div>
        <label>Certificate Title:</label>
        <input
          name="certificateTitle"
          placeholder="Certificate Title"
          value={formData.certificateTitle}
          onChange={handleChange}
          onBlur={handleBlur}
          required
        />
      </div>

      <div>
        <label>Serial Number:</label>
        <input
          name="serialNumber"
          placeholder="Serial Number"
          value={formData.serialNumber}
          onChange={handleChange}
          onBlur={handleBlur}
        />
      </div>

      <div>
        <label>Upload Logo:</label>
        <input
          type="file"
          name="logo"
          accept="image/*"
          onChange={handleChange}
          required
        />
        {previewImg && <img src={previewImg} alt="Logo Preview" style={{ width: '100px', height: '100px' }} />}
      </div>

      <div>
        <label>Upload Signature:</label>
        <input
          type="file"
          name="signature"
          accept="image/*"
          onChange={handleChange}
          required
        />
        {previewSignature && (
          <img src={previewSignature} alt="Signature Preview" style={{ width: '100px', height: '50px' }} />
        )}
      </div>

      <button type="submit" disabled={isGenerating}>
        {isGenerating ? 'Generating...' : 'Generate'}
      </button>

      {toast.show && <div className={`toast ${toast.type}`}>{toast.message}</div>}
    </form>
  );
};

export default CertificateForm;

