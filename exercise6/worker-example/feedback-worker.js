/**
 * Cloudflare Worker: Feedback to Slack
 *
 * Receives form submissions and posts to Slack webhook
 *
 * Environment Variables Required:
 * - SLACK_WEBHOOK_URL: Your Slack incoming webhook URL
 *
 * Deploy:
 * 1. Create worker in Cloudflare Dashboard
 * 2. Add SLACK_WEBHOOK_URL as environment variable
 * 3. Deploy this code
 * 4. Worker URL: https://feedback-worker.your-account.workers.dev
 */

export default {
  async fetch(request, env) {
    // Handle CORS preflight
    if (request.method === 'OPTIONS') {
      return new Response(null, {
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'POST, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type',
        },
      });
    }

    // Only accept POST requests
    if (request.method !== 'POST') {
      return new Response(JSON.stringify({ error: 'Method not allowed' }), {
        status: 405,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
      });
    }

    try {
      // Parse form data
      const formData = await request.json();
      const { fullName, email, feedback } = formData;

      // Validate required fields
      if (!fullName || !email || !feedback) {
        return new Response(
          JSON.stringify({ error: 'Missing required fields: fullName, email, feedback' }),
          {
            status: 400,
            headers: {
              'Content-Type': 'application/json',
              'Access-Control-Allow-Origin': '*',
            },
          },
        );
      }

      // Validate email format
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        return new Response(
          JSON.stringify({ error: 'Invalid email format' }),
          {
            status: 400,
            headers: {
              'Content-Type': 'application/json',
              'Access-Control-Allow-Origin': '*',
            },
          },
        );
      }

      // Get Slack webhook URL from environment
      const slackWebhookUrl = env.SLACK_WEBHOOK_URL;
      if (!slackWebhookUrl) {
        // eslint-disable-next-line no-console
        console.error('SLACK_WEBHOOK_URL not configured');
        return new Response(
          JSON.stringify({ error: 'Server configuration error' }),
          {
            status: 500,
            headers: {
              'Content-Type': 'application/json',
              'Access-Control-Allow-Origin': '*',
            },
          },
        );
      }

      // Format message for Slack
      const slackMessage = {
        blocks: [
          {
            type: 'header',
            text: {
              type: 'plain_text',
              text: 'New Feedback Received',
              emoji: true,
            },
          },
          {
            type: 'section',
            fields: [
              {
                type: 'mrkdwn',
                text: `*Name:*\n${fullName}`,
              },
              {
                type: 'mrkdwn',
                text: `*Email:*\n${email}`,
              },
            ],
          },
          {
            type: 'section',
            text: {
              type: 'mrkdwn',
              text: `*Feedback:*\n${feedback}`,
            },
          },
          {
            type: 'context',
            elements: [
              {
                type: 'mrkdwn',
                text: `Submitted at: ${new Date().toISOString()}`,
              },
            ],
          },
        ],
      };

      // Send to Slack
      const slackResponse = await fetch(slackWebhookUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(slackMessage),
      });

      if (!slackResponse.ok) {
        // eslint-disable-next-line no-console
        console.error('Slack webhook failed:', slackResponse.status);
        return new Response(
          JSON.stringify({ error: 'Failed to send to Slack' }),
          {
            status: 500,
            headers: {
              'Content-Type': 'application/json',
              'Access-Control-Allow-Origin': '*',
            },
          },
        );
      }

      // Success response
      return new Response(
        JSON.stringify({
          success: true,
          message: 'Feedback submitted successfully',
        }),
        {
          status: 200,
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
          },
        },
      );
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('Worker error:', error);
      return new Response(
        JSON.stringify({ error: 'Internal server error' }),
        {
          status: 500,
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
          },
        },
      );
    }
  },
};
