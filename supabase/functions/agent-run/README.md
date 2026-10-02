# Muse AI Edge Function: Composio + Browserbase

This function proves the backend path from Supabase Edge:

- Composio: list active connected accounts for a Muse/Supabase user, and optionally execute a Composio tool.
- Browserbase: start a Browserbase Agent run, poll it briefly, and return the live view URL if a session exists.
- Supabase: log the run in `public.agent_tool_runs`.

The current Expo route code uses Node packages such as `@browserbasehq/stagehand`, `playwright-core`, `ws`, `fs`, and `path`. That code should stay in a Node backend. Supabase Edge Functions run on Deno, so this function uses HTTP APIs instead.

## Secrets

Set these in Supabase:

```bash
supabase secrets set \
  SUPABASE_URL="https://YOUR_PROJECT_REF.supabase.co" \
  SUPABASE_SERVICE_ROLE_KEY="YOUR_SERVICE_ROLE_KEY" \
  COMPOSIO_API_KEY="YOUR_COMPOSIO_API_KEY" \
  BROWSERBASE_API_KEY="YOUR_BROWSERBASE_API_KEY"
```

`COMPOSIO_BASE_URL` is optional and defaults to `https://backend.composio.dev`.

## Deploy

```bash
supabase functions deploy agent-run
```

## Test From Expo Or Curl

```bash
curl -X POST "https://YOUR_PROJECT_REF.supabase.co/functions/v1/agent-run" \
  -H "Authorization: Bearer USER_SUPABASE_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "task": "Check my connected accounts and inspect example.com",
    "browserTask": "Open https://example.com and summarize the page.",
    "pollBrowserbase": true
  }'
```

Example Composio tool execution:

```bash
curl -X POST "https://YOUR_PROJECT_REF.supabase.co/functions/v1/agent-run" \
  -H "Authorization: Bearer USER_SUPABASE_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "task": "Check Gmail",
    "composioToolSlug": "GMAIL_FETCH_EMAILS",
    "composioText": "List my latest 5 emails"
  }'
```

Use the exact tool slug from Composio for your connected toolkit.

