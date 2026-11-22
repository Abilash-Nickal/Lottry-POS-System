import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';

export interface ShareResult {
  success: boolean;
  mode: 'native' | 'download_and_web';
  message?: string;
}

/**
 * Capture an element as a high-resolution canvas
 */
export async function captureReceiptCanvas(element: HTMLElement): Promise<HTMLCanvasElement | null> {
  try {
    const canvas = await html2canvas(element, {
      scale: 3, // Ultra-sharp 300 DPI thermal print quality
      useCORS: true,
      backgroundColor: '#ffffff',
      logging: false,
      windowWidth: element.scrollWidth,
      windowHeight: element.scrollHeight
    });
    return canvas;
  } catch (err) {
    console.error('Failed to capture receipt canvas:', err);
    return null;
  }
}

/**
 * Capture an element as a high-resolution PNG Blob
 */
export async function captureReceiptAsBlob(element: HTMLElement): Promise<Blob | null> {
  const canvas = await captureReceiptCanvas(element);
  if (!canvas) return null;

  return new Promise((resolve) => {
    canvas.toBlob((blob) => resolve(blob), 'image/png', 1.0);
  });
}

/**
 * Capture an element as a high-resolution PNG data URL
 */
export async function captureReceiptAsDataURL(element: HTMLElement): Promise<string | null> {
  const canvas = await captureReceiptCanvas(element);
  if (!canvas) return null;
  return canvas.toDataURL('image/png', 1.0);
}

/**
 * Download the real receipt as an image file (.png) with long continuous dimensions
 */
export async function downloadReceiptImage(element: HTMLElement, filename = 'receipt-slip.png'): Promise<boolean> {
  const blob = await captureReceiptAsBlob(element);
  if (!blob) return false;

  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  setTimeout(() => URL.revokeObjectURL(url), 2000);
  return true;
}

/**
 * Generate a real 80mm continuous roll PDF Blob with exact thermal dimensions
 */
export async function generateReceiptPDFBlob(element: HTMLElement): Promise<Blob | null> {
  const canvas = await captureReceiptCanvas(element);
  if (!canvas) return null;

  const imgData = canvas.toDataURL('image/png', 1.0);
  
  // Real 80mm thermal paper width
  const pdfWidthMm = 80;
  // Compute exact proportional height in mm based on rendered content
  const pdfHeightMm = Math.max(100, (canvas.height / canvas.width) * pdfWidthMm);

  // Custom single-page continuous roll format
  const pdf = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: [pdfWidthMm, pdfHeightMm],
    compress: true
  });

  pdf.addImage(imgData, 'PNG', 0, 0, pdfWidthMm, pdfHeightMm, undefined, 'FAST');
  return pdf.output('blob');
}

/**
 * Download the real continuous 80mm thermal receipt directly as a PDF file
 */
export async function downloadReceiptPDF(element: HTMLElement, filename = 'receipt-slip.pdf'): Promise<boolean> {
  const pdfBlob = await generateReceiptPDFBlob(element);
  if (!pdfBlob) return false;

  const url = URL.createObjectURL(pdfBlob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  setTimeout(() => URL.revokeObjectURL(url), 2000);
  return true;
}

/**
 * Share the real receipt directly via WhatsApp as an Image (PNG) or PDF
 * - Mobile / Tablet: native Web Share API directly attaches the real slip file
 * - Desktop: automatically downloads the real slip file and opens WhatsApp chat with text summary
 */
export async function shareReceiptToWhatsApp(
  element: HTMLElement,
  phone: string,
  textMessage: string,
  options: {
    format?: 'image' | 'pdf';
    filename?: string;
  } = {}
): Promise<ShareResult> {
  const format = options.format || 'image';
  const cleanPhone = phone.replace(/\D/g, '');
  const formattedPhone = cleanPhone.startsWith('0') ? '94' + cleanPhone.slice(1) : cleanPhone;
  const waUrl = formattedPhone 
    ? `https://wa.me/${formattedPhone}?text=${encodeURIComponent(textMessage)}`
    : `https://wa.me/?text=${encodeURIComponent(textMessage)}`;

  let file: File | null = null;
  let fileBlob: Blob | null = null;
  const defaultFilename = format === 'pdf' ? 'Lottery-Receipt.pdf' : 'Lottery-Receipt.png';
  const filename = options.filename || defaultFilename;

  if (format === 'pdf') {
    fileBlob = await generateReceiptPDFBlob(element);
    if (fileBlob) {
      file = new File([fileBlob], filename, { type: 'application/pdf' });
    }
  } else {
    fileBlob = await captureReceiptAsBlob(element);
    if (fileBlob) {
      file = new File([fileBlob], filename, { type: 'image/png' });
    }
  }

  if (file && fileBlob) {
    // Check if browser supports native file sharing (Tablets, Mobile, Supported Desktop)
    if (navigator.canShare && navigator.canShare({ files: [file] })) {
      try {
        await navigator.share({
          files: [file],
          title: 'Official Lottery POS Slip',
          text: textMessage
        });
        return { success: true, mode: 'native' };
      } catch (err: any) {
        if (err.name === 'AbortError') {
          return { success: false, mode: 'native', message: 'Share cancelled' };
        }
        console.warn('Native file share failed, falling back to download + web link:', err);
      }
    }

    // Fallback for browsers that do not support direct file attachments in Web Share API:
    // 1. Download the real dimension slip file
    const url = URL.createObjectURL(fileBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setTimeout(() => URL.revokeObjectURL(url), 2000);

    // 2. Open WhatsApp chat with prefilled summary
    window.open(waUrl, '_blank');
    return { success: true, mode: 'download_and_web' };
  }

  // Fallback if file generation failed
  window.open(waUrl, '_blank');
  return { success: true, mode: 'download_and_web' };
}
