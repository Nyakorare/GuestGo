// Initialize EmailJS
import emailjs from '@emailjs/browser';

// Initialize EmailJS with your public key
emailjs.init({
  publicKey: import.meta.env.VITE_EMAILJS_PUBLIC_KEY as string
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
      import.meta.env.VITE_EMAILJS_SERVICE_ID as string,
      import.meta.env.VITE_EMAILJS_TEMPLATE_ID as string,
      templateParams
    );

    console.log('Email sent successfully:', response);
    return true;
  } catch (error) {
    console.error('Error sending verification email:', error);
    return false;
  }
} 