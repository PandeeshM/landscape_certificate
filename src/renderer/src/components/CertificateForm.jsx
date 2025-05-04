import React, { useState } from 'react';
import '../assets/main.css';

const CertificateForm = ({ onGenerate }) => {
  const [formData, setFormData] = useState({
    studentName: '',
    institutionName: '',
    visitDate: '',
    holdDate: '',
    companyName: '',
    certificateTitle: 'Certificate of Completion',
    serialNumber: '',
    logo: null,
    signature: null,
  });

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  // Function to validate date format and range
  const isValidDate = (dateStr) => {
    const date = new Date(dateStr);
    const year = date.getFullYear();
    return /^\d{4}-\d{2}-\d{2}$/.test(dateStr) && year >= 1900 && year <= 2100;
  };

  const handleChange = (e) => {
    const { name, value, files } = e.target;

    if (files) {
      const reader = new FileReader();
      reader.onload = () =>
        setFormData((prev) => ({ ...prev, [name]: reader.result }));
      reader.readAsDataURL(files[0]);
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    // Validate dates
    if (!isValidDate(formData.visitDate) || !isValidDate(formData.holdDate)) {
      setMessage('❌ Please enter valid dates with 4-digit years.');
      setLoading(false);
      return;
    }

    try {
      await onGenerate(formData);
      setMessage('🎉 Certificate generated successfully!');
    } catch (err) {
      console.error(err);
      setMessage('❌ Failed to generate certificate.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} style={{ padding: '20px', maxWidth: 600 }}>
      <label>
        <input
          name="studentName"
          placeholder="Student Name"
          required
          onChange={handleChange}
        />
      </label>
      <label>
        <input
          name="institutionName"
          placeholder="Institution Name"
          required
          onChange={handleChange}
        />
      </label>
      <input
        name="companyName"
        placeholder="Company Name"
        required
        onChange={handleChange}
      />
      <label>Date:</label>
      <input
        name="visitDate"
        type="date"
        required
        onChange={handleChange}
      />
      <label>HoldOn Date:</label>
      <input
        name="holdDate"
        type="date"
        required
        onChange={handleChange}
      />
      <label>
        <input
          name="serialNumber"
          placeholder="Serial Number"
          onChange={handleChange}
        />
      </label>
      <label>
        Upload Logo:{' '}
        <input
          name="logo"
          type="file"
          accept="image/*"
          required
          onChange={handleChange}
        />
      </label>
      <label>
        Upload Signature:{' '}
        <input
          name="signature"
          type="file"
          accept="image/*"
          required
          onChange={handleChange}
        />
      </label>

      <button type="submit" disabled={loading}>
        {loading ? 'Generating...' : 'Generate Certificate'}
      </button>

      {message && (
        <p
          style={{
            marginTop: '10px',
            color: message.startsWith('🎉') ? 'green' : 'red',
          }}
        >
          {message}
        </p>
      )}
    </form>
  );
};

export default CertificateForm;
