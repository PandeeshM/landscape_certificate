// generateCertificate.js
import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';

export const generateCertificate = async (data) => {
  const {
    studentName,
    institutionName,
    Date,
    holdDate,
    companyName,
    certificateTitle,
    serialNumber,
    logo,
    signature,
  } = data;

  const pdfDoc = await PDFDocument.create();
  const page = pdfDoc.addPage([842, 595]);
  const { width, height } = page.getSize();

  const black = rgb(0, 0, 0);
  const green = rgb(0, 0.5, 0);

  page.drawRectangle({
    x: 10,
    y: 10,
    width: width - 20,
    height: height - 20,
    borderColor: green,
    borderWidth: 4,
  });

  const timesRomanFont = await pdfDoc.embedFont(StandardFonts.TimesRoman);
  const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

  if (logo) {
    const logoImg = await pdfDoc.embedPng(logo);
    page.drawImage(logoImg, {
      x: 40,
      y: height - 100,
      width: 80,
      height: 80,
    });
  }

  page.drawText(certificateTitle, {
    x: 240,
    y: height - 100,
    size: 28,
    color: green,
    font: boldFont,
  });

  page.drawText(`S No: ${serialNumber}`, {
    x: width - 180,
    y: height - 60,
    size: 12,
    font: timesRomanFont,
  });

  const centerX = 80;
  const baseY = 300;

  page.drawText(`This is to certify that`, {
    x: centerX,
    y: baseY + 80,
    size: 16,
    font: timesRomanFont,
  });

  page.drawText(`${studentName}`, {
    x: centerX + 220,
    y: baseY + 80,
    size: 16,
    font: boldFont,
  });

  page.drawText(`from ${institutionName}`, {
    x: centerX,
    y: baseY + 50,
    size: 16,
    font: boldFont,
  });

  page.drawText(`participated in the Industrial Visit at`, {
    x: centerX,
    y: baseY + 20,
    size: 16,
    font: timesRomanFont,
  });

  page.drawText(companyName, {
    x: centerX,
    y: baseY - 10,
    size: 18,
    font: boldFont,
    color: green,
  });

  page.drawText(`held on ${holdDate}`, {
    x: centerX,
    y: baseY - 40,
    size: 16,
    font: boldFont,
  });

  page.drawText('Date', {
    x: 80,
    y: 60,
    size: 12,
    font: timesRomanFont,
  });

  if (signature) {
    const signatureImg = await pdfDoc.embedPng(signature);
    page.drawImage(signatureImg, {
      x: width - 160,
      y: 30,
      width: 100,
      height: 50,
    });
  }

  page.drawText('Authorized Signatory', {
    x: width - 180,
    y: 20,
    size: 10,
    font: timesRomanFont,
  });

  const pdfBytes = await pdfDoc.save();
  const blob = new Blob([pdfBytes], { type: 'application/pdf' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = `${studentName}_Certificate.pdf`;
  link.click();
};
  
export default generateCertificate;