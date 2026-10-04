# Deploying the Feedback Worker

## Prerequisites

- Cloudflare account (free tier works)
- Slack workspace with admin access
- Node.js and npm installed

---

## Step 1: Create Slack Webhook

1. Go to https://api.slack.com/apps
2. Click "Create New App" → "From scratch"
3. Name: "EDS Masterclass Labs Feedback"
4. Select your workspace
5. Click "Incoming Webhooks" in left sidebar
6. Toggle "Activate Incoming Webhooks" to ON
7. Click "Add New Webhook to Workspace"
8. Select channel (e.g., #feedback)
9. Copy the webhook URL (starts with https://hooks.slack.com/services/)

**Keep this URL safe** - you'll need it for the worker.

---

## Step 2: Install Wrangler CLI

```bash
npm install -g wrangler
```

Verify:
```bash
wrangler --version
```

---

## Step 3: Login to Cloudflare

```bash
wrangler login
```

This opens browser for authentication.

---

## Step 4: Create Worker Project

```bash
# Create directory
mkdir feedback-worker
cd feedback-worker

# Copy files
# - feedback-worker.js (the worker code)
# - wrangler.toml (configuration)
```

---

## Step 5: Deploy Worker

```bash
wrangler deploy
```

You'll get a worker URL like:
```
https://feedback-worker.your-account.workers.dev
```

**Save this URL** - you'll use it in your form.

---

## Step 6: Set Slack Webhook Secret

```bash
wrangler secret put SLACK_WEBHOOK_URL
```

When prompted, paste your Slack webhook URL from Step 1.

---

## Step 7: Test Worker

```bash
curl -X POST https://feedback-worker.your-account.workers.dev \
  -H "Content-Type: application/json" \
  -d '{
    "fullName": "Test User",
    "email": "test@example.com",
    "feedback": "This is a test message"
  }'
```

Expected response:
```json
{
  "success": true,
  "message": "Feedback submitted successfully"
}
```

Check your Slack channel - you should see the message!

---

## Step 8: Update Worker URL in Form

In your form block, use your worker URL:

```javascript
const WORKER_URL = 'https://feedback-worker.your-account.workers.dev';
```

---

## Troubleshooting

### Worker returns 500 error

Check Cloudflare logs:
```bash
wrangler tail
```

Then submit a test form to see error details.

### Slack webhook fails

- Verify webhook URL is correct
- Check webhook is active in Slack app settings
- Ensure channel still exists

### CORS errors

Worker includes CORS headers. If issues persist, check browser console for specific error.

---

## Security Notes

- Worker URL is public but only accepts POST
- Slack webhook URL is stored as secret (not in code)
- Consider adding rate limiting for production use
- Validate input on both client and server side

---

## Cost

Cloudflare Workers free tier includes:
- 100,000 requests per day
- 10ms CPU time per request

More than enough for a feedback form!
