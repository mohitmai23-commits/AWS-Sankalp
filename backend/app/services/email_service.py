"""
Email service using SMTP
"""
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from ..config import settings
import logging

logger = logging.getLogger(__name__)


def send_email_smtp(to_email: str, subject: str, html_content: str):
    """
    Helper function to send email via SMTP
    """
    msg = MIMEMultipart('alternative')
    msg['Subject'] = subject
    msg['From'] = f"{settings.SMTP_FROM_NAME} <{settings.SMTP_FROM_EMAIL}>"
    msg['To'] = to_email
    
    # Attach HTML content
    html_part = MIMEText(html_content, 'html')
    msg.attach(html_part)
    
    try:
        # Connect to SMTP server
        with smtplib.SMTP(settings.SMTP_HOST, settings.SMTP_PORT) as server:
            server.starttls()  # Secure the connection
            server.login(settings.SMTP_USERNAME, settings.SMTP_PASSWORD)
            server.send_message(msg)
        logger.info(f"Email sent successfully to {to_email}")
    except Exception as e:
        logger.error(f"Failed to send email to {to_email}: {str(e)}")
        raise


async def send_password_email(email: str, name: str, password: str):
    """
    Send password to user's email after signup
    """
    subject = "Welcome to AnuJnana - Your Password"
    html_content = f"""
    <html>
        <body>
            <h2>Welcome to AnuJnana, {name}!</h2>
            <p>Thank you for signing up. Your account has been created successfully.</p>
            <p><strong>Your Password:</strong> {password}</p>
            <p>Please save this password securely. You can use it to log in to your account.</p>
            <p>Start your quantum mechanics journey today!</p>
            <br>
            <p>Best regards,<br>The AnuJnana Team</p>
        </body>
    </html>
    """
    
    try:
        send_email_smtp(email, subject, html_content)
        logger.info(f"Password email sent to {email}")
    except Exception as e:
        logger.error(f"Failed to send password email: {str(e)}")
        raise


async def send_immediate_prediction_email(
    email: str, 
    name: str, 
    subtopic: str, 
    predicted_days: int,
    score: float = None,
    time_taken: int = None,
    total_questions: int = None,
    correct_answers: int = None,
    weak_areas: list = None
):
    """
    Send immediate email after quiz with memory prediction and weak areas analysis
    """
    # Format time taken
    time_str = ""
    if time_taken:
        minutes = time_taken // 60
        seconds = time_taken % 60
        if minutes > 0:
            time_str = f"{minutes} minute(s) and {seconds} second(s)"
        else:
            time_str = f"{seconds} seconds"
    
    # Format score
    score_percentage = int(score * 100) if score else 0
    wrong_answers = (total_questions - correct_answers) if total_questions and correct_answers is not None else 0
    
    # Build weak areas section
    weak_areas_html = ""
    if weak_areas and len(weak_areas) > 0:
        weak_areas_list = "".join([
            f"<li><strong>{wa.get('concept', wa.get('subtopic', 'Unknown'))}</strong> (Subtopic {wa.get('subtopic', 'N/A')}) - {wa.get('wrong_count', 1)} question(s) wrong</li>"
            for wa in weak_areas
        ])
        weak_areas_html = f"""
        <div style="background-color: #fff3cd; border: 1px solid #ffc107; border-radius: 8px; padding: 15px; margin: 15px 0;">
            <h3 style="color: #856404; margin-top: 0;">⚠️ Areas to Focus On:</h3>
            <p>Based on your quiz performance, you should review these topics:</p>
            <ul style="color: #856404;">
                {weak_areas_list}
            </ul>
        </div>
        """
    else:
        weak_areas_html = """
        <div style="background-color: #d4edda; border: 1px solid #28a745; border-radius: 8px; padding: 15px; margin: 15px 0;">
            <h3 style="color: #155724; margin-top: 0;">🎉 Excellent Performance!</h3>
            <p>You've mastered all the concepts in this quiz. Keep up the great work!</p>
        </div>
        """
    
    subject = f"Quiz Results: {subtopic} - Score: {score_percentage}%"
    html_content = f"""
    <html>
        <body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
            <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 20px; border-radius: 10px 10px 0 0;">
                <h1 style="margin: 0;">Quiz Results</h1>
                <p style="margin: 5px 0 0 0; opacity: 0.9;">AnuJnana</p>
            </div>
            
            <div style="background: #f8f9fa; padding: 20px; border: 1px solid #dee2e6;">
                <h2 style="color: #333;">Great Job, {name}!</h2>
                
                <p>You've completed the quiz for <strong>{subtopic}</strong>.</p>
                
                <div style="background: white; border-radius: 8px; padding: 20px; margin: 15px 0; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
                    <h3 style="margin-top: 0; color: #495057;">📊 Your Performance Summary:</h3>
                    <table style="width: 100%; border-collapse: collapse;">
                        <tr>
                            <td style="padding: 8px 0; border-bottom: 1px solid #eee;"><strong>Score:</strong></td>
                            <td style="padding: 8px 0; border-bottom: 1px solid #eee; text-align: right; font-size: 18px; color: {'#28a745' if score_percentage >= 70 else '#dc3545'};">
                                <strong>{score_percentage}%</strong> ({correct_answers}/{total_questions} correct)
                            </td>
                        </tr>
                        <tr>
                            <td style="padding: 8px 0; border-bottom: 1px solid #eee;"><strong>Time Taken:</strong></td>
                            <td style="padding: 8px 0; border-bottom: 1px solid #eee; text-align: right;">{time_str}</td>
                        </tr>
                        <tr>
                            <td style="padding: 8px 0;"><strong>Questions Wrong:</strong></td>
                            <td style="padding: 8px 0; text-align: right; color: #dc3545;">{wrong_answers}</td>
                        </tr>
                    </table>
                </div>
                
                {weak_areas_html}
                
                <div style="background: #e7f3ff; border: 1px solid #b6d4fe; border-radius: 8px; padding: 15px; margin: 15px 0;">
                    <h3 style="color: #084298; margin-top: 0;">🧠 Memory Retention Prediction:</h3>
                    <p>Based on your performance and engagement, our AI predicts you might forget this content in <strong>{predicted_days} days</strong>.</p>
                    <p>We'll send you a reminder on that day to help you revise and retain the concepts better.</p>
                </div>
                
                <p>Keep up the excellent work!</p>
            </div>
            
            <div style="background: #343a40; color: white; padding: 15px; border-radius: 0 0 10px 10px; text-align: center;">
                <p style="margin: 0;">Best regards,<br><strong>The AnuJnana Team</strong></p>
            </div>
        </body>
    </html>
    """
    
    try:
        send_email_smtp(email, subject, html_content)
        logger.info(f"Enhanced prediction email sent to {email}")
    except Exception as e:
        logger.error(f"Failed to send prediction email: {str(e)}")


async def send_revision_reminder(email: str, name: str, subtopic: str, link: str):
    """
    Send revision reminder email (called by cron job)
    """
    subject = f"Time to Revise: {subtopic}"
    html_content = f"""
    <html>
        <body>
            <h2>Hi {name},</h2>
            <p>It's time to revise <strong>{subtopic}</strong>!</p>
            <p>You studied this topic earlier, and now is the perfect time to reinforce your memory.</p>
            <p><a href="{link}" style="background-color: #FF6B35; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block; margin-top: 10px;">Revise Now</a></p>
            <p>Regular revision helps ensure long-term retention of complex concepts.</p>
            <br>
            <p>Keep learning!<br>The AnuJnana Team</p>
        </body>
    </html>
    """
    
    try:
        send_email_smtp(email, subject, html_content)
        logger.info(f"Revision reminder sent to {email}")
    except Exception as e:
        logger.error(f"Failed to send revision reminder: {str(e)}")