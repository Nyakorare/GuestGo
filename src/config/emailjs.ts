// Initialize EmailJS
import emailjs from '@emailjs/browser';

// Initialize EmailJS with your public key
emailjs.init({
  publicKey: 'UkkUbmROWvLZ1Gv2u'
});

// Function to send verification email
export async function sendVerificationEmail(email: string, code: string): Promise<boolean> {
  try {
    const templateParams = {
      to: email,
      name: email.split('@')[0],
      message: `Your verification code is: ${code}`,
      from_name: 'GuestGo',
      reply_to: email
    };

    const response = await emailjs.send(
      'service_m3k5w0u', // Your EmailJS service ID
      'template_ib0lrti', // Your EmailJS template ID
      templateParams
    );

    console.log('Email sent successfully:', response);
    return true;
  } catch (error) {
    console.error('Error sending verification email:', error);
    return false;
  }
} 