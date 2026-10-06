/**
 * Cloudflare Worker: feedback form submissions to Microsoft Teams
 *
 * Accepts POST { fullName, email, feedback } as JSON from the feedback block,
 * validates it, and posts an Adaptive Card to a Teams Workflows webhook
 * ("Post to a channel when a webhook request is received").
 *
 * Secrets / vars:
 * - TEAMS_WEBHOOK_URL (secret): Teams Workflows webhook URL
 * - ALLOWED_ORIGINS (var): comma-separated origins allowed to submit,
 *   `*` matches any characters, e.g. "https://*--labs--edsmasterclass.aem.page"
 */

const MAX_LENGTHS = { fullName: 100, email: 254, feedback: 3000 };
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function toOriginPattern(entry) {
  const escaped = entry.trim().replace(/[.+?^${}()|[\]\\]/g, '\\$&').replace(/\*/g, '[a-z0-9-]*');
  return new RegExp(`^${escaped}$`, 'i');
}

function isAllowedOrigin(origin, env) {
  if (!origin) return false;
  return (env.ALLOWED_ORIGINS || '')
    .split(',')
    .filter((entry) => entry.trim())
    .some((entry) => toOriginPattern(entry).test(origin));
}

function corsHeaders(origin, env) {
  if (!isAllowedOrigin(origin, env)) return {};
  return {
    'Access-Control-Allow-Origin': origin,
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Max-Age': '86400',
    Vary: 'Origin',
  };
}

function json(body, status, headers) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json', ...headers },
  });
}

// Adaptive Card text renders markdown, so user text must not be able to inject links or formatting.
function escapeMarkdown(text) {
  return text.replace(/[\\`*_[\]()~]/g, '\\$&');
}

function validate(payload) {
  const fields = {};
  const missing = [];
  Object.entries(MAX_LENGTHS).forEach(([name, max]) => {
    const value = typeof payload?.[name] === 'string' ? payload[name].trim() : '';
    if (!value) missing.push(name);
    fields[name] = value.slice(0, max);
  });
  if (missing.length) return { error: `Missing required fields: ${missing.join(', ')}` };
  if (!EMAIL_PATTERN.test(fields.email)) return { error: 'Invalid email format' };
  return { fields };
}

function buildTeamsMessage({ fullName, email, feedback }, origin) {
  const source = origin ? ` from ${origin}` : '';
  return {
    type: 'message',
    attachments: [
      {
        contentType: 'application/vnd.microsoft.card.adaptive',
        contentUrl: null,
        content: {
          $schema: 'http://adaptivecards.io/schemas/adaptive-card.json',
          type: 'AdaptiveCard',
          version: '1.4',
          msteams: { width: 'Full' },
          body: [
            {
              type: 'TextBlock',
              text: 'New Feedback Received',
              size: 'Large',
              weight: 'Bolder',
              wrap: true,
            },
            {
              type: 'FactSet',
              facts: [
                { title: 'Name', value: escapeMarkdown(fullName) },
                { title: 'Email', value: escapeMarkdown(email) },
              ],
            },
            {
              type: 'TextBlock',
              text: 'Feedback',
              weight: 'Bolder',
              spacing: 'Medium',
            },
            {
              type: 'TextBlock',
              text: escapeMarkdown(feedback),
              wrap: true,
            },
            {
              type: 'TextBlock',
              text: escapeMarkdown(`Submitted${source} at ${new Date().toISOString()}`),
              isSubtle: true,
              size: 'Small',
              wrap: true,
              spacing: 'Medium',
            },
          ],
        },
      },
    ],
  };
}

export default {
  async fetch(request, env) {
    const origin = request.headers.get('Origin');
    const cors = corsHeaders(origin, env);

    // Browsers always send Origin; requests without one (curl, server-to-server) are allowed.
    if (origin && !isAllowedOrigin(origin, env)) {
      return json({ error: 'Origin not allowed' }, 403, {});
    }

    if (request.method === 'OPTIONS') {
      return new Response(null, { status: 204, headers: cors });
    }

    if (request.method !== 'POST') {
      return json({ error: 'Method not allowed' }, 405, { ...cors, Allow: 'POST, OPTIONS' });
    }

    if (!(request.headers.get('Content-Type') || '').includes('application/json')) {
      return json({ error: 'Content-Type must be application/json' }, 415, cors);
    }

    let payload;
    try {
      payload = await request.json();
    } catch {
      return json({ error: 'Invalid JSON body' }, 400, cors);
    }

    const { fields, error } = validate(payload);
    if (error) return json({ error }, 400, cors);

    if (!env.TEAMS_WEBHOOK_URL) {
      // eslint-disable-next-line no-console
      console.error('TEAMS_WEBHOOK_URL not configured');
      return json({ error: 'Server configuration error' }, 500, cors);
    }

    try {
      const teamsResponse = await fetch(env.TEAMS_WEBHOOK_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(buildTeamsMessage(fields, origin)),
      });
      if (!teamsResponse.ok) {
        // eslint-disable-next-line no-console
        console.error('Teams webhook failed:', teamsResponse.status, await teamsResponse.text());
        return json({ error: 'Failed to send to Teams' }, 502, cors);
      }
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error('Teams webhook error:', err);
      return json({ error: 'Failed to send to Teams' }, 502, cors);
    }

    return json({ success: true, message: 'Feedback submitted successfully' }, 200, cors);
  },
};
