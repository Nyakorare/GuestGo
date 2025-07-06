// QR Code utility functions for GuestGo
import QRCode from 'qrcode';

export interface VisitQRData {
  visitId: string;
  visitorName: string;
  visitorEmail: string;
  visitDate: string;
  purpose: string;
  places: Array<{
    placeId: string;
    placeName: string;
    placeLocation: string;
    status: string;
  }>;
  status: string;
  scheduledAt: string;
}

/**
 * Generate a QR code for a scheduled visit
 * @param visitData - The visit data to encode in the QR code
 * @returns Promise<string> - Base64 encoded QR code image
 */
export async function generateVisitQRCode(visitData: VisitQRData): Promise<string> {
  try {
    // Create a JSON string with the visit data
    const qrData = JSON.stringify(visitData);
    
    // Generate QR code as data URL
    const qrCodeDataUrl = await QRCode.toDataURL(qrData, {
      errorCorrectionLevel: 'M',
      type: 'image/png',
      quality: 0.92,
      margin: 1,
      color: {
        dark: '#000000',
        light: '#FFFFFF'
      },
      width: 256
    });
    
    return qrCodeDataUrl;
  } catch (error) {
    console.error('Error generating QR code:', error);
    throw new Error('Failed to generate QR code');
  }
}

/**
 * Generate a QR code for a visit with minimal data (for scanning)
 * @param visitId - The visit ID
 * @returns Promise<string> - Base64 encoded QR code image
 */
export async function generateSimpleVisitQRCode(visitId: string): Promise<string> {
  try {
    // Create a simple data structure for scanning
    const qrData = JSON.stringify({
      type: 'visit',
      id: visitId,
      timestamp: new Date().toISOString()
    });
    
    // Generate QR code as data URL
    const qrCodeDataUrl = await QRCode.toDataURL(qrData, {
      errorCorrectionLevel: 'L',
      type: 'image/png',
      quality: 0.92,
      margin: 1,
      color: {
        dark: '#000000',
        light: '#FFFFFF'
      },
      width: 200
    });
    
    return qrCodeDataUrl;
  } catch (error) {
    console.error('Error generating simple QR code:', error);
    throw new Error('Failed to generate QR code');
  }
}

/**
 * Parse QR code data from a scanned QR code
 * @param qrData - The data from the scanned QR code
 * @returns VisitQRData | null - Parsed visit data or null if invalid
 */
export function parseQRCodeData(qrData: string): VisitQRData | null {
  try {
    const parsed = JSON.parse(qrData);
    
    // Check if it's a simple QR code (just visit ID)
    if (parsed.type === 'visit' && parsed.id) {
      return null; // This is a simple QR code, needs to be resolved from database
    }
    
    // Check if it's a full visit QR code
    if (parsed.visitId && parsed.visitorName && parsed.visitDate) {
      return parsed as VisitQRData;
    }
    
    return null;
  } catch (error) {
    console.error('Error parsing QR code data:', error);
    return null;
  }
}

/**
 * Create a printable visit card with QR code
 * @param visitData - The visit data
 * @param qrCodeDataUrl - The QR code image data URL
 * @returns string - HTML for the printable card
 */
export function createPrintableVisitCard(visitData: VisitQRData, qrCodeDataUrl: string): string {
  const visitDate = new Date(visitData.visitDate);
  const scheduledDate = new Date(visitData.scheduledAt);
  
  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Visit Card - ${visitData.visitorName}</title>
      <style>
        @media print {
          body { margin: 0; }
          .no-print { display: none !important; }
        }
        
        body {
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
          margin: 0;
          padding: 20px;
          background-color: #f5f5f5;
        }
        
        .visit-card {
          max-width: 400px;
          margin: 0 auto;
          background: white;
          border-radius: 12px;
          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
          overflow: hidden;
          border: 2px solid #e5e7eb;
        }
        
        .card-header {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          padding: 20px;
          text-align: center;
        }
        
        .card-header h1 {
          margin: 0;
          font-size: 24px;
          font-weight: 600;
        }
        
        .card-header p {
          margin: 5px 0 0 0;
          opacity: 0.9;
          font-size: 14px;
        }
        
        .qr-section {
          padding: 20px;
          text-align: center;
          border-bottom: 1px solid #e5e7eb;
        }
        
        .qr-code {
          width: 150px;
          height: 150px;
          margin: 0 auto 15px;
          border: 2px solid #e5e7eb;
          border-radius: 8px;
          padding: 10px;
          background: white;
        }
        
        .qr-code img {
          width: 100%;
          height: 100%;
          object-fit: contain;
        }
        
        .visit-details {
          padding: 20px;
        }
        
        .detail-row {
          display: flex;
          justify-content: space-between;
          margin-bottom: 12px;
          padding-bottom: 8px;
          border-bottom: 1px solid #f3f4f6;
        }
        
        .detail-row:last-child {
          border-bottom: none;
          margin-bottom: 0;
        }
        
        .detail-label {
          font-weight: 600;
          color: #374151;
          font-size: 14px;
        }
        
        .detail-value {
          color: #6b7280;
          font-size: 14px;
          text-align: right;
          max-width: 200px;
        }
        
        .places-section {
          margin-top: 15px;
          padding-top: 15px;
          border-top: 1px solid #e5e7eb;
        }
        
        .places-title {
          font-weight: 600;
          color: #374151;
          margin-bottom: 10px;
          font-size: 14px;
        }
        
        .place-item {
          background: #f9fafb;
          padding: 8px 12px;
          margin-bottom: 8px;
          border-radius: 6px;
          border-left: 3px solid #667eea;
        }
        
        .place-name {
          font-weight: 500;
          color: #374151;
          font-size: 13px;
        }
        
        .place-location {
          color: #6b7280;
          font-size: 12px;
          margin-top: 2px;
        }
        
        .status-badge {
          display: inline-block;
          padding: 2px 8px;
          border-radius: 12px;
          font-size: 11px;
          font-weight: 500;
          text-transform: uppercase;
          margin-top: 4px;
        }
        
        .status-pending {
          background: #dbeafe;
          color: #1e40af;
        }
        
        .status-completed {
          background: #dcfce7;
          color: #166534;
        }
        
        .status-unsuccessful {
          background: #fee2e2;
          color: #dc2626;
        }
        
        .footer {
          padding: 15px 20px;
          background: #f9fafb;
          text-align: center;
          font-size: 12px;
          color: #6b7280;
          border-top: 1px solid #e5e7eb;
        }
        
        .print-button {
          position: fixed;
          top: 20px;
          right: 20px;
          background: #667eea;
          color: white;
          border: none;
          padding: 10px 20px;
          border-radius: 6px;
          cursor: pointer;
          font-weight: 500;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
        }
        
        .print-button:hover {
          background: #5a67d8;
        }
        
        @media print {
          .print-button {
            display: none;
          }
          
          body {
            background: white;
            padding: 0;
          }
          
          .visit-card {
            box-shadow: none;
            border: 1px solid #e5e7eb;
          }
        }
      </style>
    </head>
    <body>
      <button class="print-button no-print" onclick="window.print()">
        🖨️ Print Card
      </button>
      
      <div class="visit-card">
        <div class="card-header">
          <h1>GuestGo Visit Card</h1>
          <p>Scan QR code for details</p>
        </div>
        
        <div class="qr-section">
          <div class="qr-code">
            <img src="${qrCodeDataUrl}" alt="Visit QR Code">
          </div>
          <p style="margin: 0; color: #6b7280; font-size: 12px;">
            Scan this QR code to view visit details
          </p>
        </div>
        
        <div class="visit-details">
          <div class="detail-row">
            <span class="detail-label">Visitor:</span>
            <span class="detail-value">${visitData.visitorName}</span>
          </div>
          
          <div class="detail-row">
            <span class="detail-label">Email:</span>
            <span class="detail-value">${visitData.visitorEmail}</span>
          </div>
          
          <div class="detail-row">
            <span class="detail-label">Visit Date:</span>
            <span class="detail-value">${visitDate.toLocaleDateString('en-US', { 
              weekday: 'short', 
              year: 'numeric', 
              month: 'short', 
              day: 'numeric' 
            })}</span>
          </div>
          
          <div class="detail-row">
            <span class="detail-label">Purpose:</span>
            <span class="detail-value">${visitData.purpose}</span>
          </div>
          
          <div class="detail-row">
            <span class="detail-label">Status:</span>
            <span class="detail-value">
              <span class="status-badge status-${visitData.status.toLowerCase()}">
                ${visitData.status}
              </span>
            </span>
          </div>
          
          <div class="detail-row">
            <span class="detail-label">Scheduled:</span>
            <span class="detail-value">${scheduledDate.toLocaleDateString()} ${scheduledDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
          </div>
          
          ${visitData.places.length > 0 ? `
            <div class="places-section">
              <div class="places-title">Places to Visit (${visitData.places.length})</div>
              ${visitData.places.map(place => `
                <div class="place-item">
                  <div class="place-name">${place.placeName}</div>
                  ${place.placeLocation ? `<div class="place-location">📍 ${place.placeLocation}</div>` : ''}
                  <span class="status-badge status-${place.status.toLowerCase()}">${place.status}</span>
                </div>
              `).join('')}
            </div>
          ` : ''}
        </div>
        
        <div class="footer">
          <p>Generated by GuestGo • ${new Date().toLocaleDateString()}</p>
        </div>
      </div>
    </body>
    </html>
  `;
}

/**
 * Open a printable visit card in a new window
 * @param visitData - The visit data
 * @param qrCodeDataUrl - The QR code image data URL
 */
export function openPrintableVisitCard(visitData: VisitQRData, qrCodeDataUrl: string): void {
  const cardHtml = createPrintableVisitCard(visitData, qrCodeDataUrl);
  const newWindow = window.open('', '_blank');
  
  if (newWindow) {
    newWindow.document.write(cardHtml);
    newWindow.document.close();
  } else {
    // Fallback: create a blob and download
    const blob = new Blob([cardHtml], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `visit-card-${visitData.visitId}.html`;
    a.click();
    URL.revokeObjectURL(url);
  }
}

/**
 * Get visit data from database by visit ID (for QR code scanning)
 * @param visitId - The visit ID
 * @returns Promise<VisitQRData | null> - Visit data or null if not found
 */
export async function getVisitDataById(visitId: string): Promise<VisitQRData | null> {
  try {
    // This function would need to be implemented to fetch visit data from your database
    // For now, returning null as placeholder
    console.log('Fetching visit data for ID:', visitId);
    return null;
  } catch (error) {
    console.error('Error fetching visit data:', error);
    return null;
  }
} 