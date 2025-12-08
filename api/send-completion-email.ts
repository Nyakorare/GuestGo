// Vercel serverless function to send visit completion emails via Brevo
import type { VercelRequest, VercelResponse } from '@vercel/node';
import * as brevo from '@getbrevo/brevo';

// Initialize Brevo
let brevoApiInstance: brevo.TransactionalEmailsApi | null = null;
if (process.env.BREVO_API_KEY) {
  brevoApiInstance = new brevo.TransactionalEmailsApi();
  brevoApiInstance.setApiKey(brevo.TransactionalEmailsApiApiKeys.apiKey, process.env.BREVO_API_KEY);
}

export default async function handler(
  request: VercelRequest,
  response: VercelResponse,
) {
  // Handle CORS
  response.setHeader('Access-Control-Allow-Credentials', 'true');
  response.setHeader('Access-Control-Allow-Origin', '*');
  response.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  response.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version',
  );

  // Handle preflight requests
  if (request.method === 'OPTIONS') {
    response.status(200).end();
    return;
  }

  // Only allow POST requests
  if (request.method !== 'POST') {
    response.status(405).json({ error: 'Method not allowed' });
    return;
  }

  try {
    const {
      visitId,
      visitorFirstName,
      visitorLastName,
      visitorEmail,
      visitorRole,
      visitDate,
      purpose,
      places,
      feedbackSurveyLink,
    } = request.body;

    // Validate required fields
    if (!visitId || !visitorEmail || !visitorRole) {
      response.status(400).json({ error: 'Missing required fields' });
      return;
    }

    // Get Brevo API key from environment
    const apiKey = process.env.BREVO_API_KEY;
    if (!apiKey || !brevoApiInstance) {
      console.error('BREVO_API_KEY is not configured');
      response.status(500).json({ error: 'Email service not configured' });
      return;
    }

    // Format visit date
    const visitDateObj = new Date(visitDate);
    const formattedDate = visitDateObj.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });

    // Build places list HTML
    const placesList = (places || [])
      .map(
        (place: any) => `
      <li style="margin-bottom: 10px; padding: 10px; background-color: #f9fafb; border-radius: 6px; border-left: 3px solid #10b981;">
        <strong style="color: #374151; display: block; margin-bottom: 4px;">${place.placeName}</strong>
        ${place.placeLocation ? `<span style="color: #6b7280; font-size: 14px;">📍 ${place.placeLocation}</span>` : ''}
      </li>
    `,
      )
      .join('');

    // Build feedback section based on visitor role
    const feedbackSection = visitorRole === 'guest' && feedbackSurveyLink
      ? `
        <div style="background-color: #f0fdf4; border: 2px solid #10b981; border-radius: 8px; padding: 20px; margin: 25px 0; text-align: center;">
          <h3 style="color: #065f46; margin-top: 0; font-size: 18px; margin-bottom: 12px;">Share Your Feedback</h3>
          <p style="color: #047857; margin-bottom: 16px; font-size: 14px;">
            We'd love to hear about your experience! Your feedback helps us improve our services.
          </p>
          <a href="${feedbackSurveyLink}" 
             style="display: inline-block; background-color: #10b981; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: 600; font-size: 16px;">
            Complete Feedback Survey
          </a>
        </div>
      `
      : `
        <div style="background-color: #f0fdf4; border: 2px solid #10b981; border-radius: 8px; padding: 20px; margin: 25px 0; text-align: center;">
          <h3 style="color: #065f46; margin-top: 0; font-size: 18px; margin-bottom: 12px;">Share Your Feedback</h3>
          <p style="color: #047857; margin-bottom: 16px; font-size: 14px;">
            We'd love to hear about your experience! Your feedback helps us improve our services.
          </p>
          <p style="color: #047857; font-size: 14px; margin: 0;">
            Please visit your dashboard to access the feedback survey.
          </p>
        </div>
      `;

    // Create HTML email template
    const htmlContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Visit Completed - GuestGo</title>
        </head>
        <body style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #374151; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f5f5f5;">
          <div style="background-color: white; border-radius: 12px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1); overflow: hidden; border: 2px solid #e5e7eb;">
            <!-- Header -->
            <div style="background: linear-gradient(135deg, #10b981 0%, #059669 100%); color: white; padding: 30px; text-align: center;">
              <h1 style="margin: 0; font-size: 28px; font-weight: 600;">Thank You for Your Visit!</h1>
              <p style="margin: 10px 0 0 0; opacity: 0.9; font-size: 16px;">Your visit has been completed successfully</p>
            </div>
            
            <!-- Thank You Message -->
            <div style="padding: 30px;">
              <div style="text-align: center; margin-bottom: 25px;">
                <p style="color: #374151; font-size: 16px; line-height: 1.8; margin: 0;">
                  Dear <strong>${visitorFirstName} ${visitorLastName}</strong>,
                </p>
                <p style="color: #374151; font-size: 16px; line-height: 1.8; margin: 15px 0 0 0;">
                  Thank you for visiting us! We hope you had a pleasant experience and that we were able to assist you with your needs.
                </p>
              </div>

              <!-- Visit Details -->
              <div style="background-color: #f9fafb; border-radius: 8px; padding: 20px; margin-bottom: 25px;">
                <h2 style="color: #374151; margin-top: 0; font-size: 18px; border-bottom: 2px solid #e5e7eb; padding-bottom: 10px; margin-bottom: 15px;">Visit Summary</h2>
                
                <div style="margin-bottom: 12px; padding-bottom: 8px; border-bottom: 1px solid #e5e7eb;">
                  <span style="font-weight: 600; color: #374151;">Visit ID:</span>
                  <span style="color: #6b7280; font-family: monospace; font-size: 14px; margin-left: 8px;">${visitId}</span>
                </div>
                
                <div style="margin-bottom: 12px; padding-bottom: 8px; border-bottom: 1px solid #e5e7eb;">
                  <span style="font-weight: 600; color: #374151;">Visit Date:</span>
                  <span style="color: #6b7280; margin-left: 8px;">${formattedDate}</span>
                </div>
                
                <div style="margin-bottom: 12px; padding-bottom: 8px; border-bottom: 1px solid #e5e7eb;">
                  <span style="font-weight: 600; color: #374151;">Purpose:</span>
                  <span style="color: #6b7280; margin-left: 8px;">${purpose}</span>
                </div>
                
                ${places && places.length > 0 ? `
                  <div style="margin-top: 15px;">
                    <span style="font-weight: 600; color: #374151; display: block; margin-bottom: 8px;">Places Visited (${places.length}):</span>
                    <ul style="list-style: none; padding: 0; margin: 0;">
                      ${placesList}
                    </ul>
                  </div>
                ` : ''}
              </div>

              <!-- Feedback Section -->
              ${feedbackSection}
            </div>
            
            <!-- Footer -->
            <div style="padding: 20px 30px; background-color: #f9fafb; text-align: center; border-top: 1px solid #e5e7eb;">
              <p style="margin: 0; color: #6b7280; font-size: 12px;">
                This is an automated email from GuestGo.<br>
                We appreciate your visit and look forward to serving you again.
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
      console.error('BREVO_FROM_EMAIL is not configured');
      response.status(500).json({ 
        error: 'Email service not configured',
        message: 'BREVO_FROM_EMAIL environment variable is required. Please set it to a verified sender email in Brevo.'
      });
      return;
    }
    
    const sendSmtpEmail = new brevo.SendSmtpEmail();
    sendSmtpEmail.subject = `Thank You for Your Visit - ${visitId} | GuestGo`;
    sendSmtpEmail.htmlContent = htmlContent;
    sendSmtpEmail.sender = { name: fromName, email: fromEmail };
    sendSmtpEmail.to = [{ email: visitorEmail }];

    try {
      const data = await brevoApiInstance.sendTransacEmail(sendSmtpEmail);
      console.log('Visit completion email sent successfully:', {
        messageId: data.messageId,
      });
      response.status(200).json({ 
        success: true, 
        message: 'Email sent successfully',
        messageId: data.messageId,
      });
    } catch (error: any) {
      console.error('Error sending completion email via Brevo:', {
        message: error.message,
        response: error.response?.body,
      });
      response.status(error.response?.statusCode || 500).json({ 
        error: 'Failed to send email', 
        details: error.response?.body || error.message,
        message: error.message,
      });
    }
  } catch (error: any) {
    console.error('Error in send-completion-email handler:', error);
    response.status(500).json({ error: 'Internal server error', message: error.message });
  }
}
