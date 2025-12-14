import { NextApiRequest, NextApiResponse } from 'next';
import { generateQRCodeAsSVG } from '@/utils/qr-generator';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'POST') {
    const { hubId } = req.body;
    if (!hubId) {
      return res.status(400).json({ error: 'Missing hubId to generate QR code.' });
    }
    const qrCodeData = `ecocycle:hub:${hubId}`;
    const qrCodeSVG = await generateQRCodeAsSVG(qrCodeData);
    if (qrCodeSVG) {
      res.setHeader('Content-Type', 'image/svg+xml');
      res.status(200).send(qrCodeSVG);
    } else {
      res.status(500).json({ error: 'Failed to generate QR code SVG.' });
    }
  } else {
    res.setHeader('Allow', ['POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
