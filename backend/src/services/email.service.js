const resendApiKey = process.env.RESEND_API_KEY;

if (!resendApiKey) {
  console.warn(
    "⚠️ RESEND_API_KEY is missing. Email service is not configured."
  );
}

const sendPasswordResetOTP = async ({ to, otp }) => {
  if (!resendApiKey) {
    throw new Error("Resend email service is not configured.");
  }

  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${resendApiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: "LYVO <onboarding@resend.dev>",
      to: [to],
      subject: "LYVO — Your Password Reset Code",
      text: `Your LYVO password reset code is: ${otp}

This code will expire shortly.

If you did not request a password reset, please ignore this email.

— LYVO`,
      html: `
        <div style="font-family:Arial,sans-serif;max-width:600px;margin:auto;padding:30px;background:#f8f9ff;">
          <div style="background:#ffffff;border-radius:16px;padding:30px;">
            <h1 style="margin:0 0 10px;color:#111827;">LYVO</h1>

            <p style="color:#4b5563;">
              Your password reset code is:
            </p>

            <div style="
              font-size:32px;
              font-weight:700;
              letter-spacing:8px;
              padding:18px;
              text-align:center;
              background:#f3f4ff;
              border-radius:12px;
              color:#4f46e5;
              margin:20px 0;
            ">
              ${otp}
            </div>

            <p style="color:#6b7280;">
              This code will expire shortly.
            </p>

            <p style="color:#6b7280;">
              If you did not request a password reset, please ignore this email.
            </p>

            <p style="margin-top:30px;color:#111827;">
              — LYVO
            </p>
          </div>
        </div>
      `,
    }),
  });

  const data = await response.json();

  if (!response.ok) {
    console.error("Resend API error:", data);

    throw new Error(
      data?.message || "Failed to send password reset email."
    );
  }

  console.log("Password reset email sent successfully via Resend ✅", data);

  return data;
};

const verifyEmailConnection = async () => {
  if (!resendApiKey) {
    throw new Error("Resend email service is not configured.");
  }

  return true;
};

module.exports = {
  sendPasswordResetOTP,
  verifyEmailConnection,
};