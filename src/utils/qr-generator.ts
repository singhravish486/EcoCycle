import QRCode from 'qrcode';

export async function generateQRCodeAsSVG(data: string): Promise<string | null> {
  try {
    const qrCodeSVG = await QRCode.toString(data, { type: 'svg' });
    return qrCodeSVG;
  } catch (error) {
    console.error('Error generating QR code as SVG:', error);
    return null;
  }
}
