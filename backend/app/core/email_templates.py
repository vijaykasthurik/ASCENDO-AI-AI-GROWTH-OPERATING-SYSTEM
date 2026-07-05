"""Branded HTML email templates. Table-based layout with inline styles only -
the safe subset that renders consistently across Gmail, Outlook, and Apple Mail,
none of which reliably load external stylesheets or webfonts.
"""

from app.config import get_settings

_FONT = "'Segoe UI', Helvetica, Arial, sans-serif"


def _shell(preheader: str, body_html: str) -> str:
    return f"""\
<!doctype html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"></head>
<body style="margin:0;padding:0;background-color:#F8F4F0;font-family:{_FONT};">
  <div style="display:none;max-height:0;overflow:hidden;opacity:0;">{preheader}</div>
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#F8F4F0;padding:32px 16px;">
    <tr>
      <td align="center">
        <table role="presentation" width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;background-color:#FFFFFF;border-radius:20px;overflow:hidden;box-shadow:0 18px 50px rgba(43,15,10,.10);">
          <tr>
            <td style="background:linear-gradient(135deg,#1E0D08,#2B120B);padding:36px 40px;text-align:center;">
              <span style="display:inline-block;width:10px;height:10px;border-radius:50%;background:#F2622E;box-shadow:0 0 12px #F2622E;margin-right:8px;vertical-align:middle;"></span>
              <span style="font-family:{_FONT};font-size:22px;font-weight:800;color:#FFFFFF;letter-spacing:.02em;vertical-align:middle;">Ascendo AI</span>
              <div style="margin-top:6px;font-size:11px;font-weight:700;letter-spacing:.18em;text-transform:uppercase;color:#F5A623;">
                AI Business Growth Operating System
              </div>
            </td>
          </tr>
          <tr>
            <td style="padding:40px;">
              {body_html}
            </td>
          </tr>
          <tr>
            <td style="padding:24px 40px;background-color:#FBF8F5;border-top:1px solid #EFE7E1;text-align:center;">
              <p style="margin:0;font-family:{_FONT};font-size:11px;color:#806F67;">
                You're receiving this because you have an Ascendo AI account.<br>
                &copy; 2026 Ascendo AI. All rights reserved.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>"""


def _button(label: str, url: str) -> str:
    return f"""\
<table role="presentation" cellpadding="0" cellspacing="0" style="margin:28px 0;">
  <tr>
    <td style="border-radius:12px;background:linear-gradient(135deg,#F2622E,#F5A623);box-shadow:0 12px 30px rgba(242,98,46,.35);">
      <a href="{url}" style="display:inline-block;padding:15px 32px;font-family:{_FONT};font-size:14px;font-weight:800;color:#FFFFFF;text-decoration:none;border-radius:12px;">
        {label}
      </a>
    </td>
  </tr>
</table>"""


def _heading(text: str) -> str:
    return f'<h1 style="margin:0 0 14px;font-family:{_FONT};font-size:26px;font-weight:800;color:#1A1210;">{text}</h1>'


def _paragraph(text: str) -> str:
    return f'<p style="margin:0 0 16px;font-family:{_FONT};font-size:14px;line-height:1.7;color:#4A403B;">{text}</p>'


def welcome_email(full_name: str) -> tuple[str, str, str]:
    settings = get_settings()
    first_name = full_name.split(" ")[0]
    link = f"{settings.frontend_base_url}/onboarding"
    body = (
        _heading(f"Welcome aboard, {first_name}! &#10024;")
        + _paragraph(
            "Your Ascendo AI workspace is live. Tell us about your business and your "
            "autonomous agent council will turn it into a focused growth plan &mdash; "
            "strategy, marketing, sales, lead gen, analytics, and customer success, all in one place."
        )
        + _button("Open your workspace", link)
        + _paragraph(
            "Questions? Just reply to this email &mdash; a real person reads every one."
        )
    )
    text = (
        f"Welcome aboard, {first_name}!\n\n"
        "Your Ascendo AI workspace is live. Tell us about your business and your autonomous "
        "agent council will turn it into a focused growth plan - strategy, marketing, sales, "
        "lead gen, analytics, and customer success, all in one place.\n\n"
        f"Open your workspace: {link}\n\n"
        "Questions? Just reply to this email - a real person reads every one.\n"
    )
    return "Welcome to Ascendo AI - let's grow something.", _shell(
        "Your Ascendo AI workspace is ready.", body
    ), text


def otp_email(full_name: str, otp: str, purpose: str = "reset your password") -> tuple[str, str, str]:
    first_name = full_name.split(" ")[0]
    otp_display = " ".join(otp)
    body = (
        _heading(f"Hi {first_name}, here's your code")
        + _paragraph(f"Use the verification code below to {purpose}. It expires in <b>10 minutes</b>.")
        + f"""
        <table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="margin:24px 0;">
          <tr>
            <td align="center" style="background-color:#FCD9B8;border:1.5px dashed #F2622E;border-radius:14px;padding:22px;">
              <span style="font-family:'Courier New',monospace;font-size:36px;font-weight:800;letter-spacing:.35em;color:#1E0D08;">{otp_display}</span>
            </td>
          </tr>
        </table>
        """
        + _paragraph(
            "Didn't request this? You can safely ignore this email &mdash; your account is still secure."
        )
    )
    text = (
        f"Hi {first_name}, here's your code\n\n"
        f"Use the verification code below to {purpose}. It expires in 10 minutes.\n\n"
        f"    {otp}\n\n"
        "Didn't request this? You can safely ignore this email - your account is still secure.\n"
    )
    return f"{otp} is your Ascendo AI verification code", _shell(
        f"Your verification code: {otp}", body
    ), text


def password_changed_email(full_name: str) -> tuple[str, str, str]:
    settings = get_settings()
    first_name = full_name.split(" ")[0]
    link = f"{settings.frontend_base_url}/login"
    body = (
        _heading(f"Your password was changed, {first_name}")
        + _paragraph(
            "This is a confirmation that your Ascendo AI account password was just updated successfully."
        )
        + _button("Go to login", link)
        + _paragraph(
            "<b>If you didn't make this change</b>, please reply to this email immediately so we can secure your account."
        )
    )
    text = (
        f"Your password was changed, {first_name}\n\n"
        "This is a confirmation that your Ascendo AI account password was just updated successfully.\n\n"
        f"Go to login: {link}\n\n"
        "If you didn't make this change, please reply to this email immediately so we can secure your account.\n"
    )
    return "Your Ascendo AI password was changed", _shell(
        "Confirming your password was changed.", body
    ), text


def analysis_complete_email(full_name: str, business_name: str) -> tuple[str, str, str]:
    settings = get_settings()
    first_name = full_name.split(" ")[0]
    link = f"{settings.frontend_base_url}/login"
    body = (
        _heading(f"Your growth plan for {business_name} is ready &#127881;")
        + _paragraph(
            f"Hi {first_name}, your AI council finished analyzing <b>{business_name}</b>. "
            "Your dashboard, strategic report, and all six specialist engines are ready to explore."
        )
        + _button("View your results", link)
        + _paragraph("Ask Ascendo Copilot anytime if you want a plain-English walkthrough of what changed.")
    )
    text = (
        f"Your growth plan for {business_name} is ready\n\n"
        f"Hi {first_name}, your AI council finished analyzing {business_name}. Your dashboard, "
        "strategic report, and all six specialist engines are ready to explore.\n\n"
        f"View your results: {link}\n\n"
        "Ask Ascendo Copilot anytime if you want a plain-English walkthrough of what changed.\n"
    )
    return f"Your growth plan for {business_name} is ready", _shell(
        f"{business_name}'s analysis is complete.", body
    ), text
