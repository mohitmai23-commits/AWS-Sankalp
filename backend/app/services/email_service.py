"""
Email service using AWS SES (Simple Email Service)
Uses boto3 SDK - no SMTP credentials needed when running on Lambda with IAM role
"""
import boto3
from botocore.exceptions import ClientError
from ..config import settings
import logging

logger = logging.getLogger(__name__)


def get_ses_client():
    return boto3.client("ses", region_name=settings.SES_REGION)


def send_email_ses(to_email: str, subject: str, html_content: str):
    """Send email via AWS SES"""
    ses = get_ses_client()
    try:
        response = ses.send_email(
            Source=f"{settings.SES_FROM_NAME} <{settings.SES_FROM_EMAIL}>",
            Destination={"ToAddresses": [to_email]},
            Message={
                "Subject": {"Data": subject, "Charset": "UTF-8"},
                "Body": {"Html": {"Data": html_content, "Charset": "UTF-8"}}
            }
        )
        message_id = response.get("MessageId", "unknown")
        logger.info(f"SES email sent to {to_email} (MessageId: {message_id})")
        return message_id
    except ClientError as e:
        error_code = e.response["Error"]["Code"]
        error_msg = e.response["Error"]["Message"]
        logger.error(f"SES error ({error_code}): {error_msg}")
        raise
    except Exception as e:
        logger.error(f"Failed to send email to {to_email}: {str(e)}")
        raise


async def send_verification_email(email: str, name: str, verification_token: str, frontend_url: str):
    """Send email verification link to user via AWS SES"""
    verification_link = f"{frontend_url}/verify-email?token={verification_token}"
    subject = "Verify Your Email - AnuJnana"
    html_content = f"""
    <html>
        <body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f8f9fa;">
            <div style="background: linear-gradient(135deg, #4F46E5 0%, #7C3AED 100%); color: white; padding: 30px; border-radius: 12px 12px 0 0; text-align: center;">
                <h1 style="margin: 0; font-size: 28px;">Welcome to AnuJnana!</h1>
                <p style="margin: 8px 0 0 0; opacity: 0.9;">AI-Powered Adaptive Learning</p>
            </div>
            <div style="background: white; padding: 30px; border: 1px solid #e5e7eb; border-top: none;">
                <h2 style="color: #1f2937; margin-top: 0;">Hi {name},</h2>
                <p style="color: #4b5563; line-height: 1.6;">
                    Thank you for signing up! Please verify your email address by clicking below:
                </p>
                <div style="text-align: center; margin: 30px 0;">
                    <a href="{verification_link}"
                       style="background: linear-gradient(135deg, #4F46E5, #7C3AED); color: white;
                              padding: 14px 40px; text-decoration: none; border-radius: 8px;
                              display: inline-block; font-weight: bold; font-size: 16px;">
                        Verify Email Address
                    </a>
                </div>
                <p style="color: #6b7280; font-size: 13px;">Or copy this link:</p>
                <p style="word-break: break-all; color: #4F46E5; font-size: 13px; background: #f3f4f6; padding: 10px; border-radius: 6px;">
                    {verification_link}
                </p>
                <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 20px 0;">
                <p style="color: #9ca3af; font-size: 12px;">This link expires in <strong>24 hours</strong>.</p>
            </div>
            <div style="background: #1f2937; color: white; padding: 20px; border-radius: 0 0 12px 12px; text-align: center;">
                <p style="margin: 0; font-size: 14px;">Best regards,<br><strong>The AnuJnana Team</strong></p>
            </div>
        </body>
    </html>
    """
    try:
        send_email_ses(email, subject, html_content)
        logger.info(f"Verification email sent to {email}")
    except Exception as e:
        logger.error(f"Failed to send verification email to {email}: {str(e)}")
        raise


async def send_password_email(email: str, name: str, password: str):
    """Send password to user email after signup"""
    subject = "Welcome to AnuJnana - Your Password"
    html_content = f"""
    <html><body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <h2>Welcome to AnuJnana, {name}!</h2>
        <p>Your account has been created. <strong>Password:</strong> {password}</p>
        <p>Best regards,<br>The AnuJnana Team</p>
    </body></html>
    """
    try:
        send_email_ses(email, subject, html_content)
    except Exception as e:
        logger.error(f"Failed to send password email: {str(e)}")
        raise


async def send_immediate_prediction_email(
    email, name, subtopic, predicted_days,
    score=None, time_taken=None, total_questions=None,
    correct_answers=None, weak_areas=None
):
    """Send quiz results email with memory prediction - beautiful styled template"""
    score_percentage = int(score * 100) if score else 0
    correct = correct_answers or 0
    total = total_questions or 0
    wrong = total - correct
    time_display = f"{time_taken} seconds" if time_taken else "N/A"

    # Score color
    if score_percentage >= 70:
        score_color = "#16a34a"
    elif score_percentage >= 40:
        score_color = "#d97706"
    else:
        score_color = "#dc2626"

    # Build weak areas HTML
    weak_areas_html = ""
    if weak_areas and len(weak_areas) > 0:
        items = ""
        for wa in weak_areas:
            items += f'<li style="margin-bottom: 6px; color: #4b5563;"><strong>{wa.get("concept", wa.get("subtopic", "Unknown"))}</strong> (Subtopic {wa.get("subtopic", "")}) - {wa.get("wrong_count", 0)} question(s) wrong</li>'
        weak_areas_html = f"""
        <div style="background: #fef3c7; border-left: 4px solid #f59e0b; padding: 16px 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="color: #92400e; margin: 0 0 10px 0; font-size: 16px;">&#9888;&#65039; Areas to Focus On:</h3>
            <p style="color: #78350f; margin: 0 0 8px 0;">Based on your quiz performance, you should review these topics:</p>
            <ul style="margin: 0; padding-left: 20px;">{items}</ul>
        </div>"""

    subject = f"Quiz Results: {subtopic} - Score: {score_percentage}%"
    html_content = f"""
    <html>
        <body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f3f4f6;">
            <div style="background: linear-gradient(135deg, #4F46E5 0%, #7C3AED 100%); color: white; padding: 30px; border-radius: 12px 12px 0 0;">
                <h1 style="margin: 0; font-size: 26px;">Quiz Results</h1>
                <p style="margin: 5px 0 0 0; opacity: 0.9; font-size: 14px;">AnuJnana</p>
            </div>
            <div style="background: white; padding: 30px; border: 1px solid #e5e7eb; border-top: none;">
                <h2 style="color: #1f2937; margin-top: 0;">Great Job, {name}!</h2>
                <p style="color: #4b5563;">You've completed the quiz for <strong>{subtopic}</strong>.</p>

                <div style="background: #f9fafb; border: 1px solid #e5e7eb; border-radius: 8px; padding: 20px; margin: 20px 0;">
                    <h3 style="color: #1f2937; margin: 0 0 15px 0; font-size: 16px;">&#128202; Your Performance Summary:</h3>
                    <table style="width: 100%; border-collapse: collapse;">
                        <tr style="border-bottom: 1px solid #e5e7eb;">
                            <td style="padding: 10px 0; color: #374151; font-weight: bold;">Score:</td>
                            <td style="padding: 10px 0; text-align: right; color: {score_color}; font-weight: bold; font-size: 18px;">{score_percentage}% ({correct}/{total} correct)</td>
                        </tr>
                        <tr style="border-bottom: 1px solid #e5e7eb;">
                            <td style="padding: 10px 0; color: #374151; font-weight: bold;">Time Taken:</td>
                            <td style="padding: 10px 0; text-align: right; color: #4b5563;">{time_display}</td>
                        </tr>
                        <tr>
                            <td style="padding: 10px 0; color: #374151; font-weight: bold;">Questions Wrong:</td>
                            <td style="padding: 10px 0; text-align: right; color: {"#dc2626" if wrong > 0 else "#16a34a"}; font-weight: bold;">{wrong}</td>
                        </tr>
                    </table>
                </div>

                {weak_areas_html}

                <div style="background: #fef2f2; border-left: 4px solid #ef4444; padding: 16px 20px; border-radius: 8px; margin: 20px 0;">
                    <h3 style="color: #991b1b; margin: 0 0 8px 0; font-size: 16px;">&#129504; Memory Retention Prediction:</h3>
                    <p style="color: #7f1d1d; margin: 0 0 8px 0;">Based on your performance and engagement, our AI predicts you might forget this content in <strong>{predicted_days} days</strong>.</p>
                    <p style="color: #7f1d1d; margin: 0;">We'll send you a reminder on that day to help you revise and retain the concepts better.</p>
                </div>

                <p style="color: #6b7280; margin-top: 20px;">Keep up the excellent work!</p>
            </div>
            <div style="background: #1f2937; color: white; padding: 20px; border-radius: 0 0 12px 12px; text-align: center;">
                <p style="margin: 0; font-size: 14px;">Best regards,<br><strong>The AnuJnana Team</strong></p>
            </div>
        </body>
    </html>
    """
    try:
        send_email_ses(email, subject, html_content)
        logger.info(f"Quiz results email sent to {email}")
    except Exception as e:
        logger.error(f"Failed to send prediction email: {str(e)}")


async def send_revision_reminder(email: str, name: str, subtopic: str, link: str):
    """Send revision reminder email"""
    subject = f"Time to Revise: {subtopic}"
    html_content = f"""
    <html><body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <h2>Hi {name},</h2>
        <p>Time to revise <strong>{subtopic}</strong>!</p>
        <p><a href="{link}" style="background-color: #FF6B35; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px;">Revise Now</a></p>
        <p>The AnuJnana Team</p>
    </body></html>
    """
    try:
        send_email_ses(email, subject, html_content)
    except Exception as e:
        logger.error(f"Failed to send revision reminder: {str(e)}")
