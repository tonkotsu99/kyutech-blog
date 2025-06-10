import nodemailer from "nodemailer";

type EmailData = {
  to: string;
  subject: string;
  html: string;
  text?: string;
};

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASSWORD,
  },
});

export async function sendEmail({ to, subject, html, text }: EmailData) {
  try {
    const info = await transporter.sendMail({
      from: process.env.SMTP_FROM || process.env.EMAIL_FROM,
      to,
      subject,
      html,
      text,
    });

    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error("Failed to send email:", error);
    return { success: false, error };
  }
}

export async function sendCheckoutReminderEmail(
  email: string,
  name: string,
  userId: string,
  checkInTime: Date,
  customMessage?: string
) {
  const mailOptions = {
    from: process.env.SMTP_FROM,
    to: email,
    subject: "【重要】退室手続きを行いました",
    text: `
${name} 様

${
  customMessage ||
  "まだ研究室に残っている場合、再び在室ボタンを押してください。"
}
入室時刻: ${checkInTime.toLocaleString("ja-JP")}

以下のリンクから入室手続きを行ってください：
${process.env.NEXT_PUBLIC_APP_URL}/mobile/attendance

※このメールは自動送信されています。
`,
    html: `
<div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
  <h2 style="color: #e11d48;">【重要】退室手続きを行いました</h2>
  
  <p>${name} 様</p>
  
  <p>${
    customMessage ||
    "まだ研究室に残っている場合、再び在室ボタンを押してください。"
  }</p>
  <p>入室時刻: ${checkInTime.toLocaleString("ja-JP")}</p>
  
  <div style="margin: 30px 0;">
    <a href="${process.env.NEXT_PUBLIC_APP_URL}/mobile/attendance" 
       style="background-color: #e11d48; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px;">
      在室手続きを行う
    </a>
  </div>
  
  <p style="color: #666; font-size: 0.9em;">
    ※このメールは自動送信されています。
  </p>
</div>
`,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log("Reminder email sent successfully");
  } catch (error) {
    console.error("Error sending reminder email:", error);
    throw new Error("メール送信に失敗しました");
  }
}
