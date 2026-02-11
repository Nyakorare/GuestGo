// QR Share Modal Component
import QRCode from 'qrcode';

const SITE_URL = 'https://guest-go.vercel.app/';

/**
 * Generate a QR code for the site URL
 * @returns Promise<string> - Base64 encoded QR code image
 */
export async function generateSiteQRCode(): Promise<string> {
  try {
    const qrCodeDataUrl = await QRCode.toDataURL(SITE_URL, {
      errorCorrectionLevel: 'H',
      type: 'image/png',
      quality: 0.92,
      margin: 2,
      color: {
        dark: '#000000',
        light: '#FFFFFF'
      },
      width: 300
    });
    
    return qrCodeDataUrl;
  } catch (error) {
    console.error('Error generating QR code:', error);
    throw new Error('Failed to generate QR code');
  }
}

/**
 * Get the QR Share Modal HTML
 * @returns string - HTML for the QR share modal
 */
export function getQRShareModalHTML(): string {
  return `
    <div id="qr-share-modal" class="fixed inset-0 z-50 hidden items-center justify-center bg-black bg-opacity-50 transition-opacity duration-300">
      <div class="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-md w-full mx-4 transform transition-all duration-300 scale-95 opacity-0" id="qr-share-modal-content">
        <!-- Modal Header -->
        <div class="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <h3 class="text-xl font-bold text-gray-900 dark:text-white">Share GuestGo</h3>
          <button 
            id="close-qr-share-modal" 
            class="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors duration-200"
            aria-label="Close modal"
          >
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
            </svg>
          </button>
        </div>
        
        <!-- Modal Body -->
        <div class="p-6 text-center">
          <p class="text-gray-600 dark:text-gray-300 mb-6">Scan this QR code to visit GuestGo</p>
          
          <!-- QR Code Container -->
          <div class="flex justify-center mb-6">
            <div id="qr-code-container" class="bg-white p-4 rounded-lg shadow-lg">
              <div class="flex items-center justify-center h-64 w-64">
                <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
              </div>
            </div>
          </div>
          
          <!-- URL Display -->
          <div class="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 mb-6">
            <p class="text-sm text-gray-500 dark:text-gray-400 mb-1">Website URL</p>
            <p class="text-sm font-mono text-gray-900 dark:text-gray-100 break-all">${SITE_URL}</p>
          </div>
          
          <!-- Action Buttons -->
          <div class="flex gap-3">
            <button 
              id="copy-url-btn" 
              class="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors duration-200 flex items-center justify-center gap-2"
            >
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"/>
              </svg>
              Copy URL
            </button>
            <button 
              id="print-qr-btn" 
              class="bg-gray-600 hover:bg-gray-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors duration-200 flex items-center justify-center gap-2"
              title="Print QR Code"
            >
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z"/>
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  `;
}

// Store handler references for cleanup
const handlerStorage = new WeakMap<HTMLElement, {
  closeHandler: () => void;
  printHandler: () => void;
  copyHandler: (e: Event) => void;
  backgroundClickHandler: (e: MouseEvent) => void;
  escapeHandler: (e: KeyboardEvent) => void;
}>();

/**
 * Setup QR Share Modal functionality
 */
export async function setupQRShareModal(): Promise<void> {
  // Check if modal already exists
  let modal = document.getElementById('qr-share-modal');
  
  if (!modal) {
    // Create modal if it doesn't exist
    document.body.insertAdjacentHTML('beforeend', getQRShareModalHTML());
    modal = document.getElementById('qr-share-modal');
  }
  
  if (!modal) return;
  
  const modalContent = document.getElementById('qr-share-modal-content');
  const closeBtn = document.getElementById('close-qr-share-modal');
  const copyBtn = document.getElementById('copy-url-btn');
  const printBtn = document.getElementById('print-qr-btn');
  const qrContainer = document.getElementById('qr-code-container');
  
  // Remove existing event listeners if they exist
  const existingHandlers = handlerStorage.get(modal);
  if (existingHandlers) {
    closeBtn?.removeEventListener('click', existingHandlers.closeHandler);
    printBtn?.removeEventListener('click', existingHandlers.printHandler);
    copyBtn?.removeEventListener('click', existingHandlers.copyHandler);
    modal.removeEventListener('click', existingHandlers.backgroundClickHandler);
    document.removeEventListener('keydown', existingHandlers.escapeHandler);
  }
  
  // Generate QR code
  if (qrContainer) {
    try {
      const qrCodeDataUrl = await generateSiteQRCode();
      const mainLogo = document.querySelector('img[alt="GuestGo Logo"]') as HTMLImageElement | null;
      const logoSrc = mainLogo?.src;
      
      qrContainer.innerHTML = `
        <div class="relative inline-block">
          <img 
            src="${qrCodeDataUrl}" 
            alt="GuestGo QR Code" 
            class="w-64 h-64 object-contain rounded-lg"
          >
          ${logoSrc ? `
            <div class="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div class="bg-white rounded-xl p-1 shadow-md">
                <img 
                  src="${logoSrc}" 
                  alt="GuestGo Logo" 
                  class="w-16 h-16 object-contain"
                >
              </div>
            </div>
          ` : ''}
        </div>
      `;
    } catch (error) {
      console.error('Error generating QR code:', error);
      if (qrContainer) {
        qrContainer.innerHTML = `
          <div class="text-center text-red-600 dark:text-red-400">
            <p>Failed to generate QR code</p>
            <button onclick="location.reload()" class="mt-2 text-sm underline">Reload page</button>
          </div>
        `;
      }
    }
  }
  
  // Open modal function
  const openModal = () => {
    if (modal) {
      modal.classList.remove('hidden');
      modal.classList.add('flex');
      document.body.style.overflow = 'hidden';
      
      // Trigger animation
      setTimeout(() => {
        if (modalContent) {
          modalContent.classList.remove('scale-95', 'opacity-0');
          modalContent.classList.add('scale-100', 'opacity-100');
        }
      }, 10);
    }
  };
  
  // Close modal function
  const closeModal = () => {
    if (modalContent) {
      modalContent.classList.remove('scale-100', 'opacity-100');
      modalContent.classList.add('scale-95', 'opacity-0');
    }
    
    setTimeout(() => {
      if (modal) {
        modal.classList.add('hidden');
        modal.classList.remove('flex');
        document.body.style.overflow = '';
      }
    }, 300);
  };
  
  // Print function
  const printModal = () => {
    if (!qrContainer) return;
    
    const qrImage = qrContainer.querySelector('img');
    if (!qrImage) {
      alert('QR code is still loading. Please wait a moment and try again.');
      return;
    }
    
    const mainLogo = document.querySelector('img[alt="GuestGo Logo"]') as HTMLImageElement | null;
    const logoSrc = mainLogo?.src || '';
    
    // Create a new window for printing
    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      alert('Please allow popups to print the QR code.');
      return;
    }
    
    const printContent = `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>GuestGo QR Code</title>
        <style>
          @media print {
            body { margin: 0; padding: 0; }
            .no-print { display: none !important; }
          }
          
          * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
          }
          
          body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
            display: flex;
            justify-content: center;
            align-items: center;
            min-height: 100vh;
            background: #f5f5f5;
            padding: 20px;
          }
          
          .print-container {
            background: white;
            border-radius: 12px;
            padding: 40px;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
            max-width: 500px;
            width: 100%;
            text-align: center;
          }
          
          .print-header {
            margin-bottom: 30px;
          }
          
          .print-header h1 {
            font-size: 28px;
            font-weight: bold;
            color: #1f2937;
            margin-bottom: 8px;
          }
          
          .print-header p {
            font-size: 16px;
            color: #6b7280;
          }
          
          .qr-print-container {
            background: white;
            padding: 20px;
            border-radius: 8px;
            border: 2px solid #e5e7eb;
            display: inline-block;
            margin: 20px 0;
          }
          
          .qr-print-container img {
            width: 300px;
            height: 300px;
            display: block;
          }
          
          .url-section {
            margin-top: 30px;
            padding: 20px;
            background: #f9fafb;
            border-radius: 8px;
          }
          
          .url-section p {
            font-size: 14px;
            color: #6b7280;
            margin-bottom: 8px;
          }
          
          .url-section .url-text {
            font-family: 'Courier New', monospace;
            font-size: 14px;
            color: #1f2937;
            word-break: break-all;
          }
          
          .print-footer {
            margin-top: 30px;
            padding-top: 20px;
            border-top: 1px solid #e5e7eb;
            font-size: 12px;
            color: #9ca3af;
          }
          
          .print-button {
            position: fixed;
            top: 20px;
            right: 20px;
            background: #4b5563;
            color: white;
            border: none;
            padding: 12px 24px;
            border-radius: 8px;
            cursor: pointer;
            font-weight: 500;
            box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
            z-index: 1000;
          }
          
          .print-button:hover {
            background: #374151;
          }
          
          @media print {
            body {
              background: white;
              padding: 0;
            }
            
            .print-container {
              box-shadow: none;
              padding: 20px;
            }
          }
        </style>
      </head>
      <body>
        <button class="print-button no-print" onclick="window.print()">
          🖨️ Print
        </button>
        
        <div class="print-container">
          <div class="print-header">
            <h1>Share GuestGo</h1>
            <p>Scan this QR code to visit GuestGo</p>
          </div>
          
          <div class="qr-print-container">
            <div style="position: relative; display: inline-block;">
              <img src="${qrImage.src}" alt="GuestGo QR Code" />
              ${logoSrc ? `
                <div style="
                  position: absolute;
                  inset: 0;
                  display: flex;
                  align-items: center;
                  justify-content: center;
                  pointer-events: none;
                ">
                  <div style="
                    background: white;
                    border-radius: 12px;
                    padding: 4px;
                    box-shadow: 0 4px 6px rgba(0,0,0,0.15);
                  ">
                    <img 
                      src="${logoSrc}" 
                      alt="GuestGo Logo" 
                      style="width: 72px; height: 72px; object-fit: contain;"
                    />
                  </div>
                </div>
              ` : ''}
            </div>
          </div>
          
          <div class="url-section">
            <p>Website URL</p>
            <p class="url-text">${SITE_URL}</p>
          </div>
          
          <div class="print-footer">
            <p>Generated by GuestGo • ${new Date().toLocaleDateString()}</p>
          </div>
        </div>
      </body>
      </html>
    `;
    
    printWindow.document.write(printContent);
    printWindow.document.close();
    
    // Wait for content to load, then trigger print
    printWindow.onload = () => {
      setTimeout(() => {
        printWindow.print();
        // Close the print window after printing (optional)
        // printWindow.close();
      }, 250);
    };
  };
  
  // Copy handler function
  const copyHandler = async (e: Event) => {
    e.preventDefault();
    
    // Ensure the document is focused
    window.focus();
    if (copyBtn) {
      copyBtn.focus();
    }
    
    // Fallback method using a temporary textarea
    const fallbackCopy = (): boolean => {
      try {
        const textarea = document.createElement('textarea');
        textarea.value = SITE_URL;
        textarea.style.position = 'fixed';
        textarea.style.left = '-999999px';
        textarea.style.top = '-999999px';
        document.body.appendChild(textarea);
        textarea.focus();
        textarea.select();
        
        const successful = document.execCommand('copy');
        document.body.removeChild(textarea);
        return successful;
      } catch (err) {
        console.error('Fallback copy failed:', err);
        return false;
      }
    };
    
    try {
      // Try modern clipboard API first
      if (navigator.clipboard && navigator.clipboard.writeText) {
        // Ensure we have focus before attempting clipboard access
        await new Promise(resolve => setTimeout(resolve, 100));
        await navigator.clipboard.writeText(SITE_URL);
      } else {
        // Fallback for older browsers
        if (!fallbackCopy()) {
          throw new Error('Clipboard API not available and fallback failed');
        }
      }
      
      // Update button text temporarily
      if (copyBtn) {
        const originalText = copyBtn.innerHTML;
        copyBtn.innerHTML = `
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/>
          </svg>
          Copied!
        `;
        copyBtn.classList.remove('bg-blue-600', 'hover:bg-blue-700');
        copyBtn.classList.add('bg-green-600', 'hover:bg-green-700');
        
        setTimeout(() => {
          if (copyBtn) {
            copyBtn.innerHTML = originalText;
            copyBtn.classList.remove('bg-green-600', 'hover:bg-green-700');
            copyBtn.classList.add('bg-blue-600', 'hover:bg-blue-700');
          }
        }, 2000);
      }
    } catch (error) {
      console.error('Failed to copy URL:', error);
      
      // Try fallback if clipboard API failed
      if (fallbackCopy()) {
        // Fallback succeeded, show success message
        if (copyBtn) {
          const originalText = copyBtn.innerHTML;
          copyBtn.innerHTML = `
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/>
            </svg>
            Copied!
          `;
          copyBtn.classList.remove('bg-blue-600', 'hover:bg-blue-700');
          copyBtn.classList.add('bg-green-600', 'hover:bg-green-700');
          
          setTimeout(() => {
            if (copyBtn) {
              copyBtn.innerHTML = originalText;
              copyBtn.classList.remove('bg-green-600', 'hover:bg-green-700');
              copyBtn.classList.add('bg-blue-600', 'hover:bg-blue-700');
            }
          }, 2000);
        }
      } else {
        // Both methods failed, show manual copy option
        const urlText = document.querySelector('#qr-share-modal .font-mono');
        if (urlText) {
          // Select the URL text for manual copying
          const range = document.createRange();
          range.selectNodeContents(urlText);
          const selection = window.getSelection();
          if (selection) {
            selection.removeAllRanges();
            selection.addRange(range);
          }
        }
        alert('Please copy the URL manually from the text above, or use Ctrl+C (Cmd+C on Mac)');
      }
    }
  };
  
  // Background click handler
  const backgroundClickHandler = (e: MouseEvent) => {
    if (e.target === modal) {
      closeModal();
    }
  };
  
  // Escape key handler
  const escapeHandler = (e: KeyboardEvent) => {
    if (e.key === 'Escape' && !modal?.classList.contains('hidden')) {
      closeModal();
    }
  };
  
  // Store handlers for future cleanup
  handlerStorage.set(modal, {
    closeHandler: closeModal,
    printHandler: printModal,
    copyHandler: copyHandler,
    backgroundClickHandler: backgroundClickHandler,
    escapeHandler: escapeHandler
  });
  
  // Add event listeners
  closeBtn?.addEventListener('click', closeModal);
  printBtn?.addEventListener('click', printModal);
  copyBtn?.addEventListener('click', copyHandler);
  modal.addEventListener('click', backgroundClickHandler);
  document.addEventListener('keydown', escapeHandler);
}

/**
 * Open the QR Share Modal
 */
export function openQRShareModal(): void {
  const modal = document.getElementById('qr-share-modal');
  const modalContent = document.getElementById('qr-share-modal-content');
  
  if (!modal) {
    // If modal doesn't exist, set it up first
    setupQRShareModal().then(() => {
      openQRShareModal(); // Recursively call after setup
    });
    return;
  }
  
  // Open the modal
  modal.classList.remove('hidden');
  modal.classList.add('flex');
  document.body.style.overflow = 'hidden';
  
  // Trigger animation
  setTimeout(() => {
    if (modalContent) {
      modalContent.classList.remove('scale-95', 'opacity-0');
      modalContent.classList.add('scale-100', 'opacity-100');
    }
  }, 10);
}
