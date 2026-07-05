import nodemailer from 'nodemailer';

export const sendNotificationEmail = async (to: string, subject: string, text: string, html?: string) => {
  const user = process.env.GMAIL_USER;
  const pass = process.env.GMAIL_PASS;

  if (!user || !pass) {
    console.log(`\n========================================`);
    console.log(`[MOCK EMAIL SENT]`);
    console.log(`To:      ${to}`);
    console.log(`Subject: ${subject}`);
    console.log(`Body:    ${text}`);
    console.log(`========================================\n`);
    return;
  }

  try {
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user,
        pass,
      },
    });

    await transporter.sendMail({
      from: `"Activity Tracker" <${user}>`,
      to,
      subject,
      text,
      html: html || text.replace(/\n/g, '<br>'),
    });
    console.log(`[REAL EMAIL SENT] To: ${to}`);
  } catch (error) {
    console.error('Email transport failed:', error);
  }
};
