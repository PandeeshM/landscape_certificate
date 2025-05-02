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
        console.log(`${name} uploaded:`, reader.result); // Debugging
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
    if (!formData.studentName || !formData.institutionName || !formData.visitDate || !formData.logo || !formData.signature) {
      alert('Please fill in all required fields and upload both the logo and signature.');
      return;
    }

    const pdfDoc = await PDFDocument.create();

    // Register fontkit before using custom fonts
    pdfDoc.registerFontkit(fontkit);

    // Load and embed the custom font
    let fontBytes;
    try {
      fontBytes = await fetch('/fonts/CinzelDecorative-Bold.ttf').then((res) => {
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
    const customFont = await pdfDoc.embedFont(fontBytes);

    const page = pdfDoc.addPage([842, 595]); // A4 landscape
    const { width, height } = page.getSize();

    // Convert Base64 to Uint8Array for logo
    const logoBytes = Uint8Array.from(atob(formData.logo.split(',')[1]), (char) => char.charCodeAt(0));
    const logoImage = await pdfDoc.embedPng(logoBytes);
    const logoDims = logoImage.scale(0.5);

    page.drawImage(logoImage, {
      x: width - logoDims.width - 50,
      y: height - logoDims.height - 50,
      width: logoDims.width,
      height: logoDims.height,
    });

    // Convert Base64 to Uint8Array for signature
    const signatureBytes = Uint8Array.from(atob(formData.signature.split(',')[1]), (char) => char.charCodeAt(0));
    const signatureImage = await pdfDoc.embedPng(signatureBytes);
    const signatureDims = signatureImage.scale(0.5);

    page.drawImage(signatureImage, {
      x: 50, // Adjust the x-coordinate as needed
      y: 50, // Adjust the y-coordinate as needed
      width: signatureDims.width,
      height: signatureDims.height,
    });

    // Background color
    page.drawRectangle({
      x: 0,
      y: 0,
      width,
      height,
      color: rgb(0.9, 1, 0.9),
    });

    // Add text using the custom font
    page.drawText('Certificate Of Participation', {
      x: 100,
      y: 700,
      size: 28,
      font: customFont,
      color: rgb(0, 0.4, 0),
    });

    page.drawText(`Serial No: ${formData.serialNumber}`, {
      x: width - 200,
      y: height - 50,
      size: 12,
      font: customFont,
    });

    page.drawText(`Date: ${formData.holdDate}`, {
      x: width - 200,
      y: height - 80,
      size: 12,
      font: customFont,
    });

    page.drawText(`This is to certify that`, { x: 50, y: 460, size: 14, font: customFont });
    page.drawText(formData.studentName, { x: 230, y: 460, size: 14, font: customFont });

    page.drawText(`from ${formData.institutionName}`, { x: 50, y: 440, size: 14, font: customFont });

    page.drawText('participated in the Industrial Visit at', { x: 50, y: 420, size: 14, font: customFont });

    page.drawText('AAHA SOLUTIONS', {
      x: 50,
      y: 400,
      size: 16,
      font: customFont,
      color: rgb(0, 0.5, 0),
    });

    page.drawText(`held on ${formData.visitDate}`, { x: 50, y: 380, size: 14, font: customFont });

    // Save the PDF
    const pdfBytes = await pdfDoc.save();
    const pdfBlob = new Blob([pdfBytes], { type: 'application/pdf' });

    // Save the PDF using file-saver
    saveAs(pdfBlob, 'certificate.pdf');

    // Return the Blob for further use if needed
    return pdfBlob;
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

