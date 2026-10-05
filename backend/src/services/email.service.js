const nodemailer = require("nodemailer");

const smtpUser = process.env.SMTP_USER;
const smtpPass = process.env.SMTP_PASS;

if (!smtpUser || !smtpPass) {
  console.warn(
    "⚠️ SMTP_USER or SMTP_PASS is missing. Email service is not configured."
  );
}

const transporter = nodemailer.createTransport({
  service: "gmail",

  auth: {
    user: smtpUser,
    pass: smtpPass,
  },

  connectionTimeout: 10000,
  greetingTimeout: 10000,
  socketTimeout: 15000,
});

const sendPasswordResetOTP = async ({
  to,
  otp,
}) => {
  if (!smtpUser || !smtpPass) {
    throw new Error(
      "Email service is not configured."
    );
  }

  const from =
    process.env.SMTP_FROM ||
    `LYVO <${smtpUser}>`;

  await transporter.sendMail({
    from,
    to,
    subject: "LYVO — Your Password Reset Code",

    text: `
LYVO — Password Reset

Your password reset verification code is:

${otp}

This code will expire in 10 minutes.

If you did not request a password reset, you can safely ignore this email.

— LYVO
    `.trim(),

    html: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>LYVO Password Reset</title>
</head>

<body
  style="
    margin:0;
    padding:0;
    background:#070a13;
    font-family:Arial,Helvetica,sans-serif;
    color:#f8fafc;
  "
>
  <div
    style="
      width:100%;
      padding:40px 16px;
      box-sizing:border-box;
      background:#070a13;
    "
  >
    <div
      style="
        max-width:520px;
        margin:0 auto;
        padding:32px;
        box-sizing:border-box;
        border:1px solid rgba(148,163,184,0.16);
        border-radius:20px;
        background:#0d1220;
      "
    >
      <div
        style="
          margin-bottom:28px;
          font-size:28px;
          font-weight:800;
          letter-spacing:-0.5px;
          background:linear-gradient(
            135deg,
            #38bdf8,
            #6366f1,
            #8b5cf6
          );
          -webkit-background-clip:text;
          background-clip:text;
          color:transparent;
        "
      >
        LYVO
      </div>

      <h1
        style="
          margin:0 0 12px;
          font-size:24px;
          color:#f8fafc;
        "
      >
        Password Reset
      </h1>

      <p
        style="
          margin:0 0 24px;
          color:#94a3b8;
          font-size:15px;
          line-height:1.6;
        "
      >
        We received a request to reset your LYVO
        account password. Use the verification code
        below to continue.
      </p>

      <div
        style="
          margin:24px 0;
          padding:20px;
          border:1px solid rgba(99,102,241,0.25);
          border-radius:16px;
          background:rgba(99,102,241,0.08);
          text-align:center;
        "
      >
        <div
          style="
            margin-bottom:8px;
            color:#94a3b8;
            font-size:12px;
            text-transform:uppercase;
            letter-spacing:1.5px;
          "
        >
          Verification Code
        </div>

        <div
          style="
            color:#ffffff;
            font-size:34px;
            font-weight:800;
            letter-spacing:8px;
          "
        >
          ${otp}
        </div>
      </div>

      <p
        style="
          margin:0 0 18px;
          color:#94a3b8;
          font-size:13px;
          line-height:1.6;
        "
      >
        This code expires in <strong style="color:#f8fafc;">
        10 minutes
        </strong>.
      </p>

      <p
        style="
          margin:0;
          color:#64748b;
          font-size:12px;
          line-height:1.6;
        "
      >
        If you did not request this password reset,
        you can safely ignore this email.
      </p>

      <div
        style="
          margin-top:30px;
          padding-top:18px;
          border-top:1px solid rgba(148,163,184,0.10);
          color:#475569;
          font-size:11px;
          text-align:center;
        "
      >
        © LYVO — Your AI Workspace
      </div>
    </div>
  </div>
</body>
</html>
    `.trim(),
  });
};

const verifyEmailConnection = async () => {
  await transporter.verify();
  return true;
};

module.exports = {
  sendPasswordResetOTP,
  verifyEmailConnection,
};