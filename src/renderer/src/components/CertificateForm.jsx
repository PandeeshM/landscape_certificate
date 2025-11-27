import React, { useState } from 'react';
import '../assets/main.css';

const CertificateForm = ({ onGenerate }) => {
  const [formData, setFormData] = useState({
    studentName: '',
    year: 'I',
    courseName: '',
    institutionName: '',
    visitDate: '',
    certificateTitle: 'Certificate of Participation',
    projectTitle: '',
    technologies: '',
    duration: '',
    internshipStartDate: '',
    internshipEndDate: '',
    internshipCourse: ''
  });

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  // Function to validate date format and range
  const isValidDate = (dateStr) => {
    // First check format is YYYY-MM-DD with 4-digit year
    if (!/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
      setMessage('Please enter date in YYYY-MM-DD format with 4-digit year');
      return false;
    }
    
    const date = new Date(dateStr);
    const year = date.getFullYear();
    
    // Check if the date is valid and year is between 1900 and 2100
    if (isNaN(date.getTime()) || year < 1900 || year > 2100) {
      setMessage('Please enter a valid date between 1900 and 2100');
      return false;
    }
    
    // Check if the parsed date matches the input (to catch invalid dates like 2023-02-31)
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

    // Validate visit date
    if (!isValidDate(formData.visitDate)) {
      setMessage('Please enter a valid visit date with 4-digit year (YYYY-MM-DD)');
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
        <select
          name="year"
          required
          value={formData.year}
          onChange={handleChange}
          className="form-select"
        >
          <option value="">Select Year</option>
          <option value="I">I Year</option>
          <option value="II">II Year</option>
          <option value="III">III Year</option>
          <option value="IV">IV Year</option>
        </select>
      </label>
      <label>
        <input
          name="courseName"
          placeholder="Course Name"
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
      <label>Date:</label>
      <input
        name="visitDate"
        type="date"
        required
        onChange={handleChange}
      />

      <label>
        <input
          name="internshipCourse"
          placeholder="Internship Course/Domain (e.g., web development)"
          onChange={handleChange}
        />
      </label>

      <label>
        <input
          name="projectTitle"
          placeholder="Project Title"
          onChange={handleChange}
        />
      </label>

      <label>
        <input
          name="technologies"
          placeholder="Technologies (e.g., HTML, CSS, JavaScript)"
          onChange={handleChange}
        />
      </label>

      <label>
        <input
          name="duration"
          placeholder="Duration (e.g., fifteen days)"
          onChange={handleChange}
        />
      </label>

      <label>Internship Start Date:</label>
      <input
        name="internshipStartDate"
        type="date"
        onChange={handleChange}
      />

      <label>Internship End Date:</label>
      <input
        name="internshipEndDate"
        type="date"
        onChange={handleChange}
      />

<label>
  Logo:
  <input
    name="logo"
    type="file"
    accept="image/*"
    onChange={handleChange}
    style={{ display: 'block', margin: '10px 0' }}
  />
</label>

<label>
  Signature:
  <input
    name="signature"
    type="file"
    accept="image/*"
    onChange={handleChange}
    style={{ display: 'block', margin: '10px 0' }}
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
