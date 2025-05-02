import React, { useState } from 'react';

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
  // UI state
  const [isGenerating, setIsGenerating] = useState(false);
  const [previewImg, setPreviewImg] = useState(null);
  const [previewSignature, setPreviewSignature] = useState(null); // State for signature preview
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
        console.log(`${name} uploaded:`, reader.result); // Debugging
        setFormData((prev) => ({
          ...prev,
          [name]: reader.result,
        }));
        if (name === 'logo') {
          setPreviewImg(reader.result); // Set logo preview
        }
        if (name === 'signature') {
          setPreviewSignature(reader.result); // Set signature preview
        }
      };
      reader.readAsDataURL(files[0]); // Read file as Base64
    } else {
      console.log(`${name} changed:`, value); // Debugging
      setFormData((prev) => ({
        ...prev,
        [name]: value, // Update text input values
      }));
    }
  };

  const handleGenerate = (formData) => {
    console.log('Form Data:', formData); // Debugging
    if (!formData.studentName || !formData.institutionName || !formData.logo || !formData.signature) {
      alert('Please fill in all required fields and upload both the logo and signature.');
      return;
    }

    // Call the certificate generation logic here
    alert('Certificate generated successfully!');
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Form Data:', formData); // Debugging
    setIsGenerating(true);
    try {
      onGenerate(formData);
      setToast({ show: true, message: 'Certificate generated successfully!', type: 'success' });
    } catch (error) {
      console.error('Error generating certificate:', error);
      setToast({ show: true, message: 'Failed to generate certificate.', type: 'error' });
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} style={{ padding: 20 }}>
      <input
        name="studentName"
        placeholder="Student Name"
        value={formData.studentName} // Bind to formData
        onChange={handleChange}
        onBlur={handleBlur}
        required
      />
      {formTouched.studentName && formErrors.studentName && (
        <span className="error">{formErrors.studentName}</span>
      )}
      <input
        name="institutionName"
        placeholder="Institution Name"
        value={formData.institutionName} // Bind to formData
        onChange={handleChange}
        onBlur={handleBlur}
        required
      />
      {formTouched.institutionName && formErrors.institutionName && (
        <span className="error">{formErrors.institutionName}</span>
      )}
      <input
        type="file"
        name="logo"
        accept="image/*"
        onChange={handleChange}
        required
      />
      {previewImg && <img src={previewImg} alt="Logo Preview" style={{ width: '100px', height: '100px' }} />}
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
      <button type="submit" disabled={isGenerating}>
        {isGenerating ? 'Generating...' : 'Generate'}
      </button>
      {toast.show && <div className={`toast ${toast.type}`}>{toast.message}</div>}
    </form>
  );
};
//Add a dedicated download function
const downloadPDF = () => {
  if (!previewImg) return;
  
  try {
    // Create a temporary link element
    const link = document.createElement("a");
    link.href = previewImg;
    link.download = `certificate_${name.replace(/\s+/g, '_')}.pdf`;
    document.body.appendChild(link); // Append to body for Firefox compatibility
    link.click();
    document.body.removeChild(link); // Clean up
    
    showToast('Certificate download started', 'success');
  } catch (error) {
    console.error("Error downloading PDF:", error);
    showToast('Error downloading certificate. Please try again.', 'error');
  }
};

export default CertificateForm;

