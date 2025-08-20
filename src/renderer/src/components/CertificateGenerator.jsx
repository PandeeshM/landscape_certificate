// generateCertificate.js
import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';
import fontkit from '@pdf-lib/fontkit';

// Use relative paths directly
const assetsPath = '../assets';

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
    logo,
    signature,
    visitDate,
  } = data;

  const pdfDoc = await PDFDocument.create();
  pdfDoc.registerFontkit(fontkit);
  // Set page size to A4 in landscape (842 x 595 points)
  const page = pdfDoc.addPage([842, 595]);
  const { width, height } = page.getSize();
  
  // Draw white background first
  page.drawRectangle({
    x: 0,
    y: 0,
    width,
    height,
    color: rgb(1, 1, 1), // White background
  });
  
  // Draw border using lines for better reliability
  const borderMargin = 40; // Margin from the page edges
  const borderWidth = 2;   // Thickness of the border
  
  // Draw outer border (top, right, bottom, left)
  page.drawLine({
    start: { x: borderMargin, y: height - borderMargin },
    end: { x: width - borderMargin, y: height - borderMargin },
    thickness: borderWidth,
    color: rgb(0.2, 0.2, 0.2),
  });
  
  page.drawLine({
    start: { x: width - borderMargin, y: height - borderMargin },
    end: { x: width - borderMargin, y: borderMargin },
    thickness: borderWidth,
    color: rgb(0.2, 0.2, 0.2),
  });
  
  page.drawLine({
    start: { x: width - borderMargin, y: borderMargin },
    end: { x: borderMargin, y: borderMargin },
    thickness: borderWidth,
    color: rgb(0.2, 0.2, 0.2),
  });
  
  page.drawLine({
    start: { x: borderMargin, y: borderMargin },
    end: { x: borderMargin, y: height - borderMargin },
    thickness: borderWidth,
    color: rgb(0.2, 0.2, 0.2),
  });

  // Use default font since we can't load custom fonts in browser
  const timesRoman = await pdfDoc.embedFont(StandardFonts.TimesRoman);
  
  // Removed top and bottom border images as requested

   const green = rgb(0, 0.5, 0);

  // Draw dynamic logo if provided
  if (logo) {
    try {
      // logo is a data URL (base64 PNG)
      const logoBytes = dataURLToUint8Array(logo);
      const logoImg = await pdfDoc.embedPng(logoBytes);
      page.drawImage(logoImg, {
        x: 70,
        y: height - 120,
        width: 100,
        height: 60,
      });
    } catch (error) {
      console.error('Error loading logo:', error);
      // If logo fails to load, just skip it without throwing an error
    }
  }

  // Draw watermark in the center if logo is provided
  if (logo) {
    try {
      const logoBytes = dataURLToUint8Array(logo);
      const watermarkImg = await pdfDoc.embedPng(logoBytes);
      const wmWidth = 350;
      const wmHeight = 250;
      page.drawImage(watermarkImg, {
        x: (width - wmWidth) / 2,
        y: (height - wmHeight) / 2,
        width: wmWidth,
        height: wmHeight,
        opacity: 0.1, // Increased from 0.07 to 0.1 (10% opacity)
      });
    } catch (error) {
      console.error('Error loading watermark:', error);
    }
  }

  // Try to embed OldEnglish font with proper error handling
  let oldEnglishFont = null;
  try {
    const fontBytes = await fetch(new URL('../assets/Fonts/oldenglish.ttf', import.meta.url)).then(res => res.arrayBuffer());
    oldEnglishFont = await pdfDoc.embedFont(fontBytes);
  } catch (error) {
    console.error('Failed to load certificate font:', error);
    // Fallback to TimesRoman if custom font fails to load
    oldEnglishFont = await pdfDoc.embedFont(StandardFonts.TimesRoman);
  }

  // Load Cinzel Decorative font for company name
  let cinzelFont = null;
  try {
    const response = await fetch(new URL('../assets/Fonts/CinzelDecorative-Bold.ttf', import.meta.url));
    if (!response.ok) throw new Error('Failed to load Cinzel Decorative font');
    const cinzelBytes = await response.arrayBuffer();
    cinzelFont = await pdfDoc.embedFont(cinzelBytes);
  } catch (error) {
    console.error('Failed to load Cinzel Decorative font:', error);
    cinzelFont = boldFont; // fallback
  }

  // Always use standard fonts as fallback
  const timesRomanFont = await pdfDoc.embedFont(StandardFonts.TimesRoman);
  const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

  // Load Caveat Brush font for "held on ..." line
  let caveatBrushFont = null;
  try {
    const response = await fetch(new URL('../assets/Fonts/CaveatBrush-Regular.ttf', import.meta.url));
    if (!response.ok) throw new Error('Failed to load Caveat Brush font');
    const caveatBrushBytes = await response.arrayBuffer();
    caveatBrushFont = await pdfDoc.embedFont(caveatBrushBytes);
  } catch (error) {
    console.error('Failed to load Caveat Brush font:', error);
    caveatBrushFont = boldFont; // fallback
  }

  // Centering helper
  function centerX(text, font, size) {
    return (width - font.widthOfTextAtSize(text, size)) / 2;
  }

  // Draw the certificate title only once, centered, with the custom font and in green color
  page.drawText(certificateTitle, {
    x: centerX(certificateTitle, oldEnglishFont, 36),
    y: height - 110,
    size: 36,
    color: rgb(0.282, 0.431, 0.086),
    font: oldEnglishFont,
  });

  // Serial number removed as requested

  // Main body
  let y = height - 180;
  const lineSpacing = 32;

  const prefix = "This is to certify that ";
  const suffix = ` of ${data.year} Year ${data.courseName} from `;

  // Calculate widths for centering
  const prefixWidth = timesRomanFont.widthOfTextAtSize(prefix, 20);
  const studentWidth = boldFont.widthOfTextAtSize(studentName, 20);
  const suffixWidth = timesRomanFont.widthOfTextAtSize(suffix, 20);
  const totalWidth = prefixWidth + studentWidth + suffixWidth;
  const startX = (width - totalWidth) / 2;

  // Draw prefix
  page.drawText(prefix, {
    x: startX,
    y,
    size: 20,
    font: timesRomanFont,
  });

  // Draw student name in bold
  page.drawText(studentName, {
    x: startX + prefixWidth,
    y,
    size: 20,
    font: boldFont,
  });

  // Draw suffix
  page.drawText(suffix, {
    x: startX + prefixWidth + studentWidth,
    y,
    size: 20,
    font: timesRomanFont,
  });
  y -= lineSpacing;

  // Institute name (bold)
  page.drawText(institutionName, {
    x: centerX(institutionName, cinzelFont, 24),
    y,
    size: 24,
    font: cinzelFont,
  });
  y -= lineSpacing;

  // participated in the Industrial Visit
  const visitLine = 'participated in the Industrial Visit';
  page.drawText(visitLine, {
    x: centerX(visitLine, timesRomanFont, 18),
    y,
    size: 18,
    font: timesRomanFont,
  });
  y -= lineSpacing;

  // at
  const atLine = 'at';
  page.drawText(atLine, {
    x: centerX(atLine, timesRomanFont, 18),
    y,
    size: 18,
    font: timesRomanFont,
  });
  y -= lineSpacing;

  // Company name (green, bold)
  page.drawText(companyName, {
    x: centerX(companyName, cinzelFont, 22),
    y,
    size: 22,
    font: cinzelFont,
    color: rgb(0.094, 0.274, 0.067),
  });
  y -= lineSpacing;

  // Company address
  const addressLine = 'No:27, 3rd Cross, SithanKudi, Brindavan Colony, Puducherry-605013';
  page.drawText(addressLine, {
    x: centerX(addressLine, timesRomanFont, 12),
    y,
    size: 12,
    font: timesRomanFont,
    color: rgb(0, 0, 0),
  });
  y -= lineSpacing;

  // Best wishes line
  const wishesLine = 'We wish him/her success in all his/her future endeavours';
  page.drawText(wishesLine, {
    x: centerX(wishesLine, timesRomanFont, 18),
    y,
    size: 18,
    font: timesRomanFont,
    color: rgb(0, 0, 0),
  });
  y -= lineSpacing;

  // held on ... (Brush Script style)
  const heldOnLine = `held on ${holdDate}`;
  page.drawText(heldOnLine, {
    x: centerX(heldOnLine, caveatBrushFont, 26),
    y:120,
    size: 24,
    font: caveatBrushFont,
    color: rgb(0, 0, 0),
  })

  // Date (bottom left)
  page.drawText(`Date: ${data.visitDate}`, {
    x: 60,
    y: 60,
    size: 14,
    font: timesRomanFont,
  });

  // Authorized Signatory (bottom right)
  page.drawText('Authorized Signatory', {
    x: width - 200,
    y: 70,
    size: 14,
    font: boldFont,
  })
  // Draw dynamic signature if provided
  if (signature) {
    try {
      // signature is a data URL (base64 PNG)
      const signatureBytes = dataURLToUint8Array(signature);
      const signatureImg = await pdfDoc.embedPng(signatureBytes);
      page.drawImage(signatureImg, {
        x: width - 180,
        y: 40,
        width: 120,
        height: 90,
      });
    } catch (error) {
      console.error('Error loading signature:', error);
      // If signature fails to load, just skip it without throwing an error
    }
  }

  const pdfBytes = await pdfDoc.save();
  const blob = new Blob([pdfBytes], { type: 'application/pdf' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = `${studentName}_Certificate.pdf`;
  link.click();
};
  
export default generateCertificate; 