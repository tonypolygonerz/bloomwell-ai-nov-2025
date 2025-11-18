import { Resend } from 'resend';

// Lazy-load Resend instance only when API key is available
let resendInstance: Resend | null = null;

function getResendInstance(): Resend {
  if (!resendInstance && process.env.RESEND_API_KEY) {
    resendInstance = new Resend(process.env.RESEND_API_KEY);
  }
  if (!resendInstance) {
    throw new Error('RESEND_API_KEY is not configured');
  }
  return resendInstance;
}

export interface EmailOptions {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

export async function sendEmail({ to, subject, html, text }: EmailOptions) {
  try {
    const resend = getResendInstance();
    const result = await resend.emails.send({
      from: process.env.FROM_EMAIL || 'noreply@bloomwell-ai.com',
      to,
      subject,
      html,
      text,
    });

    console.log('Email sent successfully:', result.data?.id);
    return { success: true, id: result.data?.id };
  } catch (error) {
    console.error('Failed to send email:', error);
    throw new Error('Failed to send email');
  }
}

export function createVerificationEmailContent(code: string) {
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>Verify Your Email - Bloomwell AI</title>
      <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { text-align: center; margin-bottom: 30px; }
        .logo { color: #10B981; font-size: 28px; font-weight: bold; margin: 0; }
        .content { background: #f9fafb; padding: 30px; border-radius: 12px; text-align: center; }
        .title { color: #111827; font-size: 24px; margin: 0 0 20px 0; }
        .description { font-size: 16px; color: #6b7280; margin: 0 0 25px 0; }
        .code-container { background: white; border: 3px solid #10B981; border-radius: 12px; padding: 25px; margin: 20px 0; display: inline-block; min-width: 200px; }
        .code { font-size: 36px; font-weight: bold; color: #10B981; letter-spacing: 8px; font-family: 'Courier New', monospace; margin: 0; }
        .expiry { font-size: 14px; color: #9ca3af; margin: 20px 0 0 0; }
        .footer { text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb; }
        .footer-text { font-size: 14px; color: #9ca3af; margin: 0; }
        .footer-small { font-size: 12px; color: #d1d5db; margin: 10px 0 0 0; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1 class="logo">Bloomwell AI</h1>
        </div>

        <div class="content">
          <h2 class="title">Verify Your Email Address</h2>
          
          <p class="description">
            Enter this verification code to complete your registration:
          </p>
          
          <div class="code-container">
            <div class="code">${code}</div>
          </div>
          
          <p class="expiry">
            This code expires in 10 minutes for your security.
          </p>
        </div>
        
        <div class="footer">
          <p class="footer-text">
            If you didn't request this verification, you can safely ignore this email.
          </p>
          <p class="footer-small">
            This is an automated email from Bloomwell AI
          </p>
        </div>
      </div>
    </body>
    </html>
  `;

  const text = `
    Verify Your Email - Bloomwell AI
    
    Your verification code is: ${code}
    
    Enter this code on the website to complete your registration.
    This code expires in 10 minutes.
    
    If you didn't request this verification, you can safely ignore this email.
  `;

  return { html, text };
}

export async function sendVerificationEmail(email: string, code: string) {
  const { html, text } = createVerificationEmailContent(code);
  
  return sendEmail({
    to: email,
    subject: 'Verify Your Email - Bloomwell AI',
    html,
    text,
  });
}

