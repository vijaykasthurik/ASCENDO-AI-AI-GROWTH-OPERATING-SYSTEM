import logging
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText
from email.utils import formatdate, make_msgid

import aiosmtplib

from app.config import get_settings

logger = logging.getLogger(__name__)


async def send_email(to_email: str, subject: str, html_body: str, text_body: str) -> None:
    """Sends a branded email with both an HTML and a plain-text part. Never
    raises - a failed send is logged and swallowed so it can't take down a
    request that already succeeded (user registered, password changed,
    analysis completed, etc.) before the email step.

    Always includes a text/plain alternative alongside the HTML: an
    HTML-only multipart/alternative message is a well-known spam-filter
    trigger, and several mail servers pick the wrong (empty) part with no
    text/plain fallback to fall back to.
    """
    settings = get_settings()
    if not settings.smtp_user or not settings.smtp_pass:
        logger.warning("SMTP not configured, skipping email to %s: %s", to_email, subject)
        return

    message = MIMEMultipart("alternative")
    message["From"] = f"{settings.smtp_from_name} <{settings.smtp_user}>"
    message["To"] = to_email
    message["Subject"] = subject
    message["Date"] = formatdate(localtime=True)
    message["Message-ID"] = make_msgid(domain=settings.smtp_user.split("@")[-1])
    message["Reply-To"] = settings.smtp_user
    # multipart/alternative parts must go least-preferred to most-preferred.
    message.attach(MIMEText(text_body, "plain"))
    message.attach(MIMEText(html_body, "html"))

    try:
        errors, response = await aiosmtplib.send(
            message,
            hostname=settings.smtp_host,
            port=settings.smtp_port,
            username=settings.smtp_user,
            password=settings.smtp_pass,
            start_tls=True,
        )
        if errors:
            # aiosmtplib only raises when *every* recipient is refused; a
            # partial refusal (e.g. one bad address among several) lands here
            # instead, so it must be logged explicitly or it's invisible.
            logger.warning("Partial send failure to %s: %s (server said: %s)", to_email, errors, response)
        else:
            logger.info("Sent email to %s: %s (server said: %s)", to_email, subject, response)
    except Exception:
        logger.exception("Failed to send email to %s: %s", to_email, subject)
