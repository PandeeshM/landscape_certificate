// CertificateGenerator.jsx
import React, { useState } from 'react';
import { PDFDocument, rgb } from 'pdf-lib';
import { saveAs } from 'file-saver';
import fontkit from '@pdf-lib/fontkit';

const CertificateGenerator = () => {
  const [formData, setFormData] = useState({
    studentName: '',
    institutionName: '',
    holdDate: '',
    visitDate: '',
    logo: null,
    signature: null,
  });

  const handleChange = (e) => {
    const { name, files } = e.target;

    if (files && files[0]) {
      const reader = new FileReader();
      reader.onload = () => {
        setFormData((prev) => ({
          ...prev,
          [name]: reader.result, // Store Base64 string
        }));
      };
      reader.readAsDataURL(files[0]); // Read file as Base64
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: e.target.value,
      }));
    }
  };

  const generatePDF = async () => {
    if (!formData.studentName || !formData.institutionName || !formData.visitDate || !formData.holdDate || !formData.logo || !formData.signature) {
      alert('Please fill in all required fields and upload both the logo and signature.');
      return;
    }

    const pdfDoc = await PDFDocument.create();

    // Load font from public folder
    let fontBytes;
    try {
      fontBytes = await fetch('/fonts/ArchivoBlack-Regular.ttf').then((res) => {
        if (!res.ok) {
          throw new Error(`HTTP error! status: ${res.status}`);
        }
        return res.arrayBuffer();
      });
    } catch (error) {
      console.error('Failed to load font:', error);
      alert('Failed to load font. Please check the font file path.');
      return;
    }

    // Register fontkit and embed the font
    pdfDoc.registerFontkit(fontkit);
    let customFont;
    try {
      customFont = await pdfDoc.embedFont(fontBytes);
    } catch (error) {
      console.error('Failed to embed font:', error);
      alert('Failed to embed font. Please check the font file.');
      return;
    }

    const page = pdfDoc.addPage([842, 595]); // A4 landscape
    const { width, height } = page.getSize();

    // Add text to the PDF
    page.drawText('Certificate of Participation', {
      x: 50,
      y: 700,
      size: 30,
      font: customFont,
      color: rgb(0, 0.5, 0), // Example green color
    });

    page.drawText(`Student Name: ${formData.studentName}`, {
      x: 50,
      y: 650,
      size: 20,
      font: customFont,
    });

    page.drawText(`Institution Name: ${formData.institutionName}`, {
      x: 50,
      y: 620,
      size: 20,
      font: customFont,
    });

    page.drawText(`Visit Date: ${formData.visitDate}`, {
      x: 50,
      y: 590,
      size: 20,
      font: customFont,
    });

    // Save the PDF
    const pdfBytes = await pdfDoc.save();
    const pdfBlob = new Blob([pdfBytes], { type: 'application/pdf' });

    // Save the PDF using file-saver
    saveAs(pdfBlob, 'certificate.pdf');
  };

  return (
    <div style={{ padding: '2rem' }}>
      <h2>Industrial Visit Certificate Generator</h2>
      <input type="text" name="studentName" placeholder="Student Name" onChange={handleChange} />
      <input type="text" name="institutionName" placeholder="Institution Name" onChange={handleChange} />
      <input type="date" name="visitDate" onChange={handleChange} />
      <input type="date" name="holdDate" onChange={handleChange} />
      <input type="text" name="companyName" placeholder="Company Name" onChange={handleChange} />
      <input type="file" name="logo" accept="image/*" onChange={handleChange} />
      <input type="file" name="signature" accept="image/*" onChange={handleChange} />
      <input type="text" name="serialNumber" placeholder="Serial Number (optional)" onChange={handleChange} />
      <button onClick={generatePDF}>Generate Certificate</button>
    </div>
  );
};

export default CertificateGenerator;

