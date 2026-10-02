-- Run this in Supabase SQL Editor after deploying `agent-run`.
-- It invokes the Edge Function every 5 minutes.

create extension if not exists pg_cron;
create extension if not exists pg_net;

select vault.create_secret(
  'https://YOUR_PROJECT_REF.supabase.co',
  'project_url'
);

select vault.create_secret(
  'YOUR_SUPABASE_SERVICE_ROLE_KEY',
  'service_role_key'
);

select cron.schedule(
  'muse-agent-run-every-5-minutes',
  '*/5 * * * *',
  $$
  select net.http_post(
    url := (select decrypted_secret from vault.decrypted_secrets where name = 'project_url')
      || '/functions/v1/agent-run',
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'Authorization', 'Bearer ' || (
        select decrypted_secret from vault.decrypted_secrets where name = 'service_role_key'
      )
    ),
    body := jsonb_build_object(
      'userId', 'REPLACE_WITH_USER_UUID',
      'task', 'Scheduled Muse AI check',
      'browserTask', 'Open https://example.com and summarize the page.',
      'pollBrowserbase', true
    )
  );
  $$
);
