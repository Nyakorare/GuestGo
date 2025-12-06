// Simple Express server for local development
// This mimics the Vercel serverless function for local testing
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import * as brevo from '@getbrevo/brevo';

// Load environment variables
dotenv.config({ path: '.env.local' });

const app = express();
const PORT = process.env.EMAIL_SERVER_PORT || 3000;

// Initialize Brevo
const brevoApiKey = process.env.BREVO_API_KEY;
let brevoApiInstance = null;
if (brevoApiKey) {
  brevoApiInstance = new brevo.TransactionalEmailsApi();
  brevoApiInstance.setApiKey(brevo.TransactionalEmailsApiApiKeys.apiKey, brevoApiKey);
}

// Middleware
app.use(cors());
app.use(express.json());

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Email API server is running' });
});

// Handle GET requests to email endpoint (for testing)
app.get('/api/send-visit-email', (req, res) => {
  res.status(405).json({ 
    error: 'Method not allowed',
    message: 'This endpoint only accepts POST requests. Use POST to send emails.',
    method: 'POST',
    endpoint: '/api/send-visit-email'
  });
});

// Email sending endpoint (matches Vercel function)
app.post('/api/send-visit-email', async (req, res) => {
  try {
    const {
      visitId,
      visitorFirstName,
      visitorLastName,
      visitorEmail,
      visitorPhone,
      visitDate,
      purpose,
      places,
      status,
      scheduledAt,
      qrCodeBase64,
    } = req.body;

    // Validate required fields
    if (!visitId || !visitorEmail || !qrCodeBase64) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Get Brevo API key from environment
    if (!brevoApiKey || !brevoApiInstance) {
      console.error('BREVO_API_KEY is not configured in .env.local');
      return res.status(500).json({ error: 'Email service not configured' });
    }

    // Format visit date
    const visitDateObj = new Date(visitDate);
    const formattedDate = visitDateObj.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });

    // Format scheduled date
    const scheduledDateObj = new Date(scheduledAt);
    const formattedScheduledDate = scheduledDateObj.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });

    // Build places list HTML
    const placesList = (places || [])
      .map(
        (place) => `
      <li style="margin-bottom: 10px; padding: 10px; background-color: #f9fafb; border-radius: 6px; border-left: 3px solid #667eea;">
        <strong style="color: #374151; display: block; margin-bottom: 4px;">${place.placeName}</strong>
        ${place.placeLocation ? `<span style="color: #6b7280; font-size: 14px;">📍 ${place.placeLocation}</span>` : ''}
        <span style="display: inline-block; margin-top: 4px; padding: 2px 8px; background-color: #dbeafe; color: #1e40af; border-radius: 12px; font-size: 11px; text-transform: uppercase; font-weight: 500;">${place.status}</span>
      </li>
    `,
      )
      .join('');

    // Create HTML email template
    const htmlContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Visit Confirmation - GuestGo</title>
        </head>
        <body style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #374151; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f5f5f5;">
          <div style="background-color: white; border-radius: 12px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1); overflow: hidden; border: 2px solid #e5e7eb;">
            <!-- Header -->
            <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center;">
              <h1 style="margin: 0; font-size: 28px; font-weight: 600;">GuestGo Visit Confirmation</h1>
              <p style="margin: 10px 0 0 0; opacity: 0.9; font-size: 16px;">Your visit has been scheduled successfully!</p>
            </div>
            
            <!-- QR Code Section -->
            <div style="padding: 30px; text-align: center; border-bottom: 1px solid #e5e7eb;">
              <h2 style="color: #374151; margin-top: 0; font-size: 20px;">Your Visit QR Code</h2>
              <div style="display: inline-block; padding: 15px; background-color: white; border: 2px solid #e5e7eb; border-radius: 8px; margin: 20px 0;">
                <img src="data:image/png;base64,${qrCodeBase64}" alt="Visit QR Code" style="width: 200px; height: 200px; display: block;" />
              </div>
              <p style="color: #6b7280; font-size: 14px; margin: 15px 0 0 0;">
                Scan this QR code at the gate entrance to check in for your visit.
              </p>
            </div>
            
            <!-- Visit Details -->
            <div style="padding: 30px;">
              <h2 style="color: #374151; margin-top: 0; font-size: 20px; border-bottom: 2px solid #e5e7eb; padding-bottom: 10px;">Visit Details</h2>
              
              <div style="margin-bottom: 20px;">
                <div style="display: flex; justify-content: space-between; margin-bottom: 12px; padding-bottom: 8px; border-bottom: 1px solid #f3f4f6;">
                  <span style="font-weight: 600; color: #374151;">Visit ID:</span>
                  <span style="color: #6b7280; font-family: monospace; font-size: 14px;">${visitId}</span>
                </div>
                
                <div style="display: flex; justify-content: space-between; margin-bottom: 12px; padding-bottom: 8px; border-bottom: 1px solid #f3f4f6;">
                  <span style="font-weight: 600; color: #374151;">Visitor Name:</span>
                  <span style="color: #6b7280;">${visitorFirstName} ${visitorLastName}</span>
                </div>
                
                <div style="display: flex; justify-content: space-between; margin-bottom: 12px; padding-bottom: 8px; border-bottom: 1px solid #f3f4f6;">
                  <span style="font-weight: 600; color: #374151;">Email:</span>
                  <span style="color: #6b7280;">${visitorEmail}</span>
                </div>
                
                ${visitorPhone ? `
                <div style="display: flex; justify-content: space-between; margin-bottom: 12px; padding-bottom: 8px; border-bottom: 1px solid #f3f4f6;">
                  <span style="font-weight: 600; color: #374151;">Phone:</span>
                  <span style="color: #6b7280;">${visitorPhone}</span>
                </div>
                ` : ''}
                
                <div style="display: flex; justify-content: space-between; margin-bottom: 12px; padding-bottom: 8px; border-bottom: 1px solid #f3f4f6;">
                  <span style="font-weight: 600; color: #374151;">Visit Date:</span>
                  <span style="color: #6b7280;">${formattedDate}</span>
                </div>
                
                <div style="display: flex; justify-content: space-between; margin-bottom: 12px; padding-bottom: 8px; border-bottom: 1px solid #f3f4f6;">
                  <span style="font-weight: 600; color: #374151;">Purpose:</span>
                  <span style="color: #6b7280;">${purpose}</span>
                </div>
                
                <div style="display: flex; justify-content: space-between; margin-bottom: 12px; padding-bottom: 8px; border-bottom: 1px solid #f3f4f6;">
                  <span style="font-weight: 600; color: #374151;">Status:</span>
                  <span style="display: inline-block; padding: 2px 8px; background-color: #dbeafe; color: #1e40af; border-radius: 12px; font-size: 11px; text-transform: uppercase; font-weight: 500;">${status}</span>
                </div>
                
                <div style="display: flex; justify-content: space-between; margin-bottom: 12px; padding-bottom: 8px;">
                  <span style="font-weight: 600; color: #374151;">Scheduled At:</span>
                  <span style="color: #6b7280;">${formattedScheduledDate}</span>
                </div>
              </div>
              
              <!-- Places to Visit -->
              ${places && places.length > 0 ? `
                <div style="margin-top: 25px; padding-top: 20px; border-top: 2px solid #e5e7eb;">
                  <h3 style="color: #374151; margin-top: 0; font-size: 18px; margin-bottom: 15px;">Places to Visit (${places.length})</h3>
                  <ul style="list-style: none; padding: 0; margin: 0;">
                    ${placesList}
                  </ul>
                </div>
              ` : ''}
            </div>
            
            <!-- Footer -->
            <div style="padding: 20px 30px; background-color: #f9fafb; text-align: center; border-top: 1px solid #e5e7eb;">
              <p style="margin: 0; color: #6b7280; font-size: 12px;">
                This is an automated confirmation email from GuestGo.<br>
                Please save your Visit ID and QR code for your visit.
              </p>
              <p style="margin: 10px 0 0 0; color: #6b7280; font-size: 12px;">
                Generated on ${new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
              </p>
            </div>
          </div>
        </body>
      </html>
    `;

    // Send email using Brevo
    const fromEmail = process.env.BREVO_FROM_EMAIL;
    const fromName = process.env.BREVO_FROM_NAME || 'GuestGo';
    
    if (!fromEmail) {
      console.error('BREVO_FROM_EMAIL is not configured in .env.local');
      return res.status(500).json({ 
        error: 'Email service not configured',
        message: 'BREVO_FROM_EMAIL environment variable is required. Please set it to a verified sender email in Brevo.'
      });
    }
    
    console.log('📧 Attempting to send email:', {
      to: visitorEmail,
      from: `${fromName} <${fromEmail}>`,
      subject: `Visit Confirmation - ${visitId} | GuestGo`,
    });

    const sendSmtpEmail = new brevo.SendSmtpEmail();
    sendSmtpEmail.subject = `Visit Confirmation - ${visitId} | GuestGo`;
    sendSmtpEmail.htmlContent = htmlContent;
    sendSmtpEmail.sender = { name: fromName, email: fromEmail };
    sendSmtpEmail.to = [{ email: visitorEmail }];

    try {
      const data = await brevoApiInstance.sendTransacEmail(sendSmtpEmail);
      console.log('✅ Visit confirmation email sent successfully:', {
        messageId: data.messageId,
      });
      res.status(200).json({ 
        success: true, 
        message: 'Email sent successfully',
        messageId: data.messageId,
      });
    } catch (error) {
      console.error('❌ Error sending email via Brevo:', {
        message: error.message,
        response: error.response?.body,
      });
      res.status(error.response?.statusCode || 500).json({ 
        error: 'Failed to send email', 
        details: error.response?.body || error.message,
        message: error.message,
      });
    }
  } catch (error) {
    console.error('❌ Error in send-visit-email handler:', error);
    console.error('Error stack:', error.stack);
    res.status(500).json({ 
      error: 'Internal server error', 
      message: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined,
    });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`\n📧 Email API server running on http://localhost:${PORT}`);
  console.log(`   Health check: http://localhost:${PORT}/api/health`);
  console.log(`   Email endpoint: http://localhost:${PORT}/api/send-visit-email\n`);
});
