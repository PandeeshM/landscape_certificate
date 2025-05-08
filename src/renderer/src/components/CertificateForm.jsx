import React, { useState } from 'react';
import '../assets/main.css';

const CertificateForm = ({ onGenerate }) => {
  const [formData, setFormData] = useState({
    studentName: '',
    institutionName: '',
    visitDate: '',
    holdDate: '',
    companyName: '',
    certificateTitle: 'Certificate of Participation',
    serialNumber: ''
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
    const { name, files, value } = e.target;
    if (files && files.length > 0) {
      const file = files[0];
      
      // Validate file type using multiple methods
      const isPNG = file.type.startsWith('image/png') || 
                    file.name.toLowerCase().endsWith('.png');
      
      if (!isPNG) {
        setMessage('Please upload a PNG file!');
        return;
      }
      
      // Validate file size
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        setMessage('File size must be less than 5MB!');
        return;
      }
      
      const reader = new FileReader();
      reader.onload = (event) => {
        const result = event.target.result;
        
        // Ensure we get the complete data URL
        if (typeof result === 'string' && result.startsWith('data:')) {
          // Extract just the base64 part
          const base64Data = result.split(',')[1];
          if (base64Data) {
            // Reconstruct with proper PNG prefix
            const pngDataUrl = `data:image/png;base64,${base64Data}`;
            setFormData((prev) => ({ ...prev, [name]: pngDataUrl }));
          } else {
            setMessage('Failed to extract image data!');
          }
        } else {
          setMessage('Failed to read image data!');
        }
      };
      
      // Add error handling for file reading
      reader.onerror = () => {
        setMessage('Error reading the file. Please try again.');
      };
      
      reader.readAsDataURL(file);
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
      setMessage('Please enter valid dates with 4-digit years.');
      setLoading(false);
      return;
    }

    // Add detailed logging of form data before validation
    console.log('Form data before validation:', {
      logo: formData.logo ? 'Present' : 'Not present',
      signature: formData.signature ? 'Present' : 'Not present',
      topBorder: formData.topBorder ? 'Present' : 'Not present',
      bottomBorder: formData.bottomBorder ? 'Present' : 'Not present'
    });



    try {
      await onGenerate(formData);
      setMessage('Certificate generated successfully!');
    } catch (err) {
      console.error('Error in onGenerate:', err);
      if (err.message.includes('PNG file')) {
        setMessage('Failed to load required assets. Please ensure all image files are in PNG format and properly placed in the assets folder.');
      } else {
        setMessage('Failed to generate certificate. Please check your inputs and try again.');
      }
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

<label>logo</label>
<label>
<input
          name="logo"
          type="file"
          accept="image/*"
          onChange={handleChange}
        />
</label>
<label>signature</label>
<label>
<input
          name="signature"
          type="file"
          accept="image/*"
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
