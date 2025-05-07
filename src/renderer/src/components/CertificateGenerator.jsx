// generateCertificate.js
import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';
import fontkit from '@pdf-lib/fontkit';

function dataURLToUint8Array(dataURL) {
  const base64 = dataURL.split(',')[1];
  const binary = atob(base64);
  const len = binary.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes;
}

export const generateCertificate = async (data) => {
  // Validate only required image inputs
  const validateImage = (imageData, name) => {
    if (!imageData) return;
    if (typeof imageData !== 'string' || !imageData.startsWith('data:image/png')) {
      throw new Error(`The ${name} is not a valid PNG file!`);
    }
  };

  // Only validate required fields
  validateImage(data.logo, 'logo');
  validateImage(data.signature, 'signature');

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
  pdfDoc.registerFontkit(fontkit);
  const page = pdfDoc.addPage([842, 595]);
  const { width, height } = page.getSize();

  const green = rgb(0, 0.5, 0);

  page.drawRectangle({
    x: 10,
    y: 10,
    width: width - 20,
    height: height - 20,
    borderColor: green,
    borderWidth: 4,
    borderRadius: 15
  });

  if (data.topBorder) {
    const topBorderBytes = dataURLToUint8Array(data.topBorder);
    const topBorderImg = await pdfDoc.embedPng(topBorderBytes);
    page.drawImage(topBorderImg, {
      x: (width - 600) / 2,
      y: height - 60,
      width: 600,
      height: 50,
    });
  }

  if (data.bottomBorder) {
    const bottomBorderBytes = dataURLToUint8Array(data.bottomBorder);
    const bottomBorderImg = await pdfDoc.embedPng(bottomBorderBytes);
    page.drawImage(bottomBorderImg, {
      x: (width - 600) / 2,
      y: 10,
      width: 600,
      height: 50,
    });
  }

  // Handle logo - use uploaded PNG if available
  if (data.logo) {
    const logoBytes = dataURLToUint8Array(data.logo);
    const logoImg = await pdfDoc.embedPng(logoBytes);
    page.drawImage(logoImg, {
      x: 40,
      y: height - 100,
      width: 80,
      height: 80,
    });
  }

  // Try to embed OldEnglish font with proper error handling
  let oldEnglishFont = null;
  try {
    const fontUrl = new URL('../assets/Fonts/oldenglish.ttf', import.meta.url).href;
    const fontBytes = await fetch(fontUrl).then(res => res.arrayBuffer());
    oldEnglishFont = await pdfDoc.embedFont(fontBytes);
  } catch (error) {
    console.error('Failed to load OldEnglish font:', error);
    // Fallback to TimesRoman if OldEnglish font fails to load
    oldEnglishFont = await pdfDoc.embedFont(StandardFonts.TimesRoman);
  }

  // Always use standard fonts as fallback
  const timesRomanFont = await pdfDoc.embedFont(StandardFonts.TimesRoman);
  const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

  page.drawText(certificateTitle, {
    x: 240,
    y: height - 100,
    size: 28,
    color: green,
    font: oldEnglishFont,
  });

  page.drawText(`S No: ${serialNumber}`, {
    x: width - 250,
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
    x: 80,
    y: 290,
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