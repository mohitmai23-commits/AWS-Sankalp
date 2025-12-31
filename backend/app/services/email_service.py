"""
Email service using Twilio SendGrid
"""
from sendgrid import SendGridAPIClient
from sendgrid.helpers.mail import Mail
from ..config import settings
import logging

logger = logging.getLogger(__name__)


async def send_password_email(email: str, name: str, password: str):
    """
    Send password to user's email after signup
    """
    message = Mail(
        from_email=(settings.SENDGRID_FROM_EMAIL, settings.SENDGRID_FROM_NAME),
        to_emails=email,
        subject="Welcome to Physics Whisperer - Your Password",
        html_content=f"""
        <html>
            <body>
                <h2>Welcome to Physics Whisperer, {name}!</h2>
                <p>Thank you for signing up. Your account has been created successfully.</p>
                <p><strong>Your Password:</strong> {password}</p>
                <p>Please save this password securely. You can use it to log in to your account.</p>
                <p>Start your quantum mechanics journey today!</p>
                <br>
                <p>Best regards,<br>The Physics Whisperer Team</p>
            </body>
        </html>
        """
    )
    
    try:
        sg = SendGridAPIClient(settings.SENDGRID_API_KEY)
        response = sg.send(message)
        logger.info(f"Password email sent to {email}: Status {response.status_code}")
    except Exception as e:
        logger.error(f"Failed to send password email: {str(e)}")
        raise


async def send_immediate_prediction_email(email: str, name: str, subtopic: str, predicted_days: int):
    """
    Send immediate email after quiz with memory prediction
    """
    message = Mail(
        from_email=(settings.SENDGRID_FROM_EMAIL, settings.SENDGRID_FROM_NAME),
        to_emails=email,
        subject=f"Memory Reminder: Revise {subtopic} in {predicted_days} days",
        html_content=f"""
        <html>
            <body>
                <h2>Great Job, {name}!</h2>
                <p>You've completed the quiz for <strong>{subtopic}</strong>.</p>
                <p>Based on your performance and engagement, our AI predicts you might forget this content in <strong>{predicted_days} days</strong>.</p>
                <p>We'll send you a reminder on that day to help you revise and retain the concepts better.</p>
                <p>Keep up the excellent work!</p>
                <br>
                <p>Best regards,<br>The Physics Whisperer Team</p>
            </body>
        </html>
        """
    )
    
    try:
        sg = SendGridAPIClient(settings.SENDGRID_API_KEY)
        response = sg.send(message)
        logger.info(f"Prediction email sent to {email}: Status {response.status_code}")
    except Exception as e:
        logger.error(f"Failed to send prediction email: {str(e)}")


async def send_revision_reminder(email: str, name: str, subtopic: str, link: str):
    """
    Send revision reminder email (called by cron job)
    """
    message = Mail(
        from_email=(settings.SENDGRID_FROM_EMAIL, settings.SENDGRID_FROM_NAME),
        to_emails=email,
        subject=f"Time to Revise: {subtopic}",
        html_content=f"""
        <html>
            <body>
                <h2>Hi {name},</h2>
                <p>It's time to revise <strong>{subtopic}</strong>!</p>
                <p>You studied this topic earlier, and now is the perfect time to reinforce your memory.</p>
                <p><a href="{link}" style="background-color: #FF6B35; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block; margin-top: 10px;">Revise Now</a></p>
                <p>Regular revision helps ensure long-term retention of complex concepts.</p>
                <br>
                <p>Keep learning!<br>The Physics Whisperer Team</p>
            </body>
        </html>
        """
    )
    
    try:
        sg = SendGridAPIClient(settings.SENDGRID_API_KEY)
        response = sg.send(message)
        logger.info(f"Revision reminder sent to {email}: Status {response.status_code}")
    except Exception as e:
        logger.error(f"Failed to send revision reminder: {str(e)}")