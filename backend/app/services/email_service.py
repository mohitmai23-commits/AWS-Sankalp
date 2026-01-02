"""
Email service using SMTP (real-time)
"""
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from ..config import settings
import logging

logger = logging.getLogger(__name__)


def _send_email(to_email: str, subject: str, html_content: str):
    msg = MIMEMultipart("alternative")
    msg["From"] = f"{settings.SMTP_FROM_NAME} <{settings.SMTP_FROM_EMAIL}>"
    msg["To"] = to_email
    msg["Subject"] = subject

    msg.attach(MIMEText(html_content, "html"))

    try:
        server = smtplib.SMTP(settings.SMTP_HOST, settings.SMTP_PORT)
        server.starttls()
        server.login(settings.SMTP_USERNAME, settings.SMTP_PASSWORD)
        server.send_message(msg)
        server.quit()

        logger.info(f"✅ Email sent to {to_email}")
    except Exception as e:
        logger.error(f"❌ Email sending failed: {e}")
        raise


# ================================
# Signup Email
# ================================
async def send_password_email(email: str, name: str, password: str):
    subject = "Welcome to Physics Whisperer - Your Password"
    html_content = f"""
    <html>
        <body>
            <h2>Welcome to Physics Whisperer, {name}!</h2>
            <p>Your account has been created successfully.</p>
            <p><strong>Your Password:</strong> {password}</p>
            <p>Please change your password after logging in.</p>
            <br>
            <p>Best regards,<br>The Physics Whisperer Team</p>
        </body>
    </html>
    """
    _send_email(email, subject, html_content)


# ================================
# Immediate Prediction Email
# ================================
async def send_immediate_prediction_email(
    email: str,
    name: str,
    subtopic: str,
    predicted_days: int
):
    subject = f"Memory Reminder: Revise {subtopic} in {predicted_days} days"
    html_content = f"""
    <html>
        <body>
            <h2>Great Job, {name}!</h2>
            <p>You completed the quiz for <strong>{subtopic}</strong>.</p>
            <p>Our AI predicts you may forget this in <strong>{predicted_days} days</strong>.</p>
            <p>We’ll remind you to revise it at the right time.</p>
            <br>
            <p>Physics Whisperer Team</p>
        </body>
    </html>
    """
    _send_email(email, subject, html_content)


# ================================
# Revision Reminder (Cron)
# ================================
async def send_revision_reminder(
    email: str,
    name: str,
    subtopic: str,
    link: str
):
    subject = f"Time to Revise: {subtopic}"
    html_content = f"""
    <html>
        <body>
            <h2>Hi {name},</h2>
            <p>It's time to revise <strong>{subtopic}</strong>.</p>
            <a href="{link}"
               style="background:#ff6b35;color:white;padding:12px 20px;
               text-decoration:none;border-radius:5px;">
               Revise Now
            </a>
            <br><br>
            <p>Happy Learning!<br>Physics Whisperer Team</p>
        </body>
    </html>
    """
    _send_email(email, subject, html_content)
