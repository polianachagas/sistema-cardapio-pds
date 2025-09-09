import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import QRCode from 'react-qr-code';
import { Download, Copy, Check } from 'lucide-react';

interface QRCodeGeneratorProps {
  restaurantSlug: string;
  tableNumber: string;
}

export function QRCodeGenerator({ restaurantSlug, tableNumber }: QRCodeGeneratorProps) {
  const [copied, setCopied] = useState(false);
  
  const qrUrl = `${window.location.origin}/m/${restaurantSlug}/${tableNumber}`;

  const handleCopyUrl = async () => {
    try {
      await navigator.clipboard.writeText(qrUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Failed to copy URL:', error);
    }
  };

  const handleDownloadQR = () => {
    const svg = document.getElementById(`qr-${tableNumber}`)?.querySelector('svg');
    if (!svg) return;

    const svgData = new XMLSerializer().serializeToString(svg);
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();
    
    img.onload = () => {
      canvas.width = img.width;
      canvas.height = img.height;
      ctx?.drawImage(img, 0, 0);
      
      const pngFile = canvas.toDataURL('image/png');
      const downloadLink = document.createElement('a');
      downloadLink.download = `mesa-${tableNumber}-qr.png`;
      downloadLink.href = pngFile;
      downloadLink.click();
    };
    
    img.src = 'data:image/svg+xml;base64,' + btoa(svgData);
  };

  return (
    <Card className="card-elevated">
      <CardHeader>
        <CardTitle>Mesa {tableNumber}</CardTitle>
        <CardDescription>
          QR Code para acesso direto ao cardápio
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div id={`qr-${tableNumber}`} className="bg-white p-4 rounded-lg">
          <QRCode
            value={qrUrl}
            size={200}
            style={{ height: "auto", maxWidth: "100%", width: "100%" }}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor={`url-${tableNumber}`}>URL da Mesa</Label>
          <div className="flex gap-2">
            <Input
              id={`url-${tableNumber}`}
              value={qrUrl}
              readOnly
              className="font-mono text-xs"
            />
            <Button
              variant="outline"
              size="sm"
              onClick={handleCopyUrl}
              className="shrink-0"
            >
              {copied ? (
                <Check className="w-4 h-4" />
              ) : (
                <Copy className="w-4 h-4" />
              )}
            </Button>
          </div>
        </div>

        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={handleDownloadQR}
            className="flex-1"
          >
            <Download className="w-4 h-4 mr-2" />
            Baixar PNG
          </Button>
          <Button
            asChild
            className="flex-1 btn-primary"
          >
            <a href={qrUrl} target="_blank" rel="noopener noreferrer">
              Testar Mesa
            </a>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}