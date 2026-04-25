/**
 * Magic-link email sender.
 *
 * In development (NODE_ENV !== 'production'), the magic-link URL is logged
 * to the server console instead of being emailed. This means you can sign
 * in locally without provisioning Resend or any email service. Watch your
 * `npm run dev` terminal output after submitting the email form.
 *
 * In production, calls Resend's API. Requires:
 *   RESEND_API_KEY  - from https://resend.com/api-keys
 *   EMAIL_FROM      - e.g. "Repute <noreply@repute.site>". The sending
 *                     domain must be verified in Resend.
 */

import { Resend } from 'resend'

const isProduction = process.env.NODE_ENV === 'production'
const RESEND_API_KEY = process.env.RESEND_API_KEY
const EMAIL_FROM = process.env.EMAIL_FROM ?? 'Repute <onboarding@resend.dev>'

const resend = RESEND_API_KEY ? new Resend(RESEND_API_KEY) : null

export interface SendMagicLinkArgs {
  to: string
  url: string
  /** the host of the site, useful in the email subject and body */
  host: string
}

/**
 * Send a sign-in magic link to the user.
 * In dev: logs to console. In prod: calls Resend.
 *
 * @throws in production if Resend is not configured or the send fails
 */
export async function sendMagicLink({ to, url, host }: SendMagicLinkArgs): Promise<void> {
  if (!isProduction) {
    // Dev mode: print the link so the developer can click it from the terminal.
    // eslint-disable-next-line no-console
    console.log(
      [
        '',
        '════════════════════════════════════════════════════════════',
        '  REPUTE SIGN-IN LINK (dev mode, no email sent)',
        '════════════════════════════════════════════════════════════',
        `  to:   ${to}`,
        `  link: ${url}`,
        '════════════════════════════════════════════════════════════',
        '',
      ].join('\n')
    )
    return
  }

  if (!resend) {
    throw new Error(
      'RESEND_API_KEY is not set. Configure it in your environment to send sign-in emails in production.'
    )
  }

  const { error } = await resend.emails.send({
    from: EMAIL_FROM,
    to,
    subject: `Sign in to ${host}`,
    html: renderMagicLinkHtml(url, host),
    text: renderMagicLinkText(url, host),
  })

  if (error) {
    throw new Error(`Resend rejected the email: ${error.message}`)
  }
}

/**
 * Plain-text version of the magic-link email. Always include this for
 * accessibility and to keep us out of spam folders.
 */
function renderMagicLinkText(url: string, host: string): string {
  return [
    `Sign in to ${host}`,
    '',
    'Click the link below to sign in. The link is single-use and expires in 24 hours.',
    '',
    url,
    '',
    'If you did not request this, you can safely ignore this email.',
  ].join('\n')
}

/**
 * Minimal HTML for the magic-link email. Plain, scannable, no images that
 * could trip spam filters.
 */
function renderMagicLinkHtml(url: string, host: string): string {
  // Inline styles only. Email clients strip <style> tags inconsistently.
  return `
<!DOCTYPE html>
<html>
  <body style="margin:0;padding:32px 16px;background:#FAF7F2;font-family:Inter,Helvetica,Arial,sans-serif;color:#1A1A1A;">
    <table role="presentation" width="100%" style="max-width:480px;margin:0 auto;background:white;border-radius:12px;padding:32px;border:1px solid rgba(0,0,0,0.08);">
      <tr>
        <td>
          <h1 style="font-family:Georgia,serif;font-weight:400;font-size:24px;line-height:1.2;margin:0 0 16px;color:#1A1A1A;">
            Sign in to ${escapeHtml(host)}
          </h1>
          <p style="font-size:15px;line-height:1.5;color:rgba(0,0,0,0.7);margin:0 0 24px;">
            Click the button below to sign in. This link is single-use and expires in 24 hours.
          </p>
          <a href="${url}" style="display:inline-block;background:#1A1A1A;color:white;text-decoration:none;font-size:14px;font-weight:500;padding:12px 24px;border-radius:8px;">
            Sign in
          </a>
          <p style="font-size:12px;line-height:1.5;color:rgba(0,0,0,0.42);margin:32px 0 0;">
            If the button does not work, copy and paste this link into your browser:<br>
            <a href="${url}" style="color:rgba(0,0,0,0.55);word-break:break-all;">${url}</a>
          </p>
          <p style="font-size:12px;line-height:1.5;color:rgba(0,0,0,0.42);margin:24px 0 0;">
            If you did not request this, you can safely ignore this email.
          </p>
        </td>
      </tr>
    </table>
  </body>
</html>
  `.trim()
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}
