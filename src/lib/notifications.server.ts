const SLACK_WEBHOOK_URL = process.env.SLACK_WEBHOOK_URL

export function getRequestMetadata(request: Request) {
  const forwardedFor = request.headers.get('x-forwarded-for') ?? ''

  return {
    timestamp: new Date().toISOString(),
    ip:
      forwardedFor.split(',')[0]?.trim() ||
      request.headers.get('x-real-ip') ||
      request.headers.get('x-vercel-forwarded-for') ||
      null,
    location: {
      city: request.headers.get('x-vercel-ip-city'),
      region: request.headers.get('x-vercel-ip-country-region'),
      country: request.headers.get('x-vercel-ip-country'),
    },
    browser: request.headers.get('user-agent'),
  }
}

function summarizeBrowser(userAgent: unknown) {
  if (typeof userAgent !== 'string' || userAgent.length === 0) {
    return 'unknown'
  }

  const browser = userAgent.includes('Edg/')
    ? 'Edge'
    : userAgent.includes('Chrome/')
      ? 'Chrome'
      : userAgent.includes('Firefox/')
        ? 'Firefox'
        : userAgent.includes('Safari/') && !userAgent.includes('Chrome/')
          ? 'Safari'
          : 'Unknown browser'

  const device = userAgent.includes('iPhone')
    ? 'iPhone'
    : userAgent.includes('iPad')
      ? 'iPad'
      : userAgent.includes('Android')
        ? 'Android'
        : userAgent.includes('Macintosh')
          ? 'Mac'
          : userAgent.includes('Windows')
            ? 'Windows'
            : 'Unknown device'

  return `${browser} on ${device}`
}

export function notify(payload: Record<string, unknown>) {
  if (!SLACK_WEBHOOK_URL) {
    return
  }

  const payloadLocation = payload.location as
    | {
        city?: string | null
        region?: string | null
        country?: string | null
      }
    | undefined

  const location = [
    payloadLocation?.city,
    payloadLocation?.region,
    payloadLocation?.country,
  ]
    .filter(Boolean)
    .join(', ')

  const text = [
    `IP: ${String(payload.ip ?? 'unknown')}`,
    `Location: ${location || 'unknown'}`,
    `Browser: ${summarizeBrowser(payload.browser)}`,
    `Message: ${String(payload.message ?? '')}`,
    payload.error ? `Error: ${String(payload.error)}` : null,
  ]
    .filter(Boolean)
    .join('\n')

  void fetch(SLACK_WEBHOOK_URL, {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
    },
    body: JSON.stringify({
      text: `\`\`\`\n${text.replace(/```/g, "'''")}\n\`\`\``,
    }),
  }).catch(() => {})
}
