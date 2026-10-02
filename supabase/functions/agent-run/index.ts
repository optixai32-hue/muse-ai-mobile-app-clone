import { createClient } from "npm:@supabase/supabase-js@^2.109.0";

type JsonRecord = Record<string, unknown>;

type RequestBody = {
  userId?: string;
  task?: string;
  browserTask?: string;
  composioToolSlug?: string;
  composioText?: string;
  composioArguments?: JsonRecord;
  pollBrowserbase?: boolean;
};

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  if (req.method !== "POST") {
    return json({ error: "Method not allowed" }, 405);
  }

  try {
    const body = (await req.json().catch(() => ({}))) as RequestBody;
    const supabase = createAdminClient();
    const user = await resolveUser(req, supabase, body.userId);
    const task = body.task || body.browserTask || body.composioText || "Scheduled Muse AI task";

    const composioAccounts = await listComposioAccounts(user.id);

    const composioResult = body.composioToolSlug
      ? await executeComposioTool({
          toolSlug: body.composioToolSlug,
          userId: user.id,
          text: body.composioText,
          args: body.composioArguments,
          connectedAccounts: composioAccounts.items || [],
        })
      : null;

    const browserbaseRun = body.browserTask
      ? await runBrowserbaseAgent({
          task: body.browserTask,
          poll: body.pollBrowserbase ?? true,
        })
      : null;

    await supabase.from("agent_tool_runs").insert({
      user_id: user.id,
      action_name: "edge_agent_run",
      input_summary: task,
      output_summary: summarizeOutput({ composioResult, browserbaseRun }),
      status: "completed",
      metadata: {
        composio_account_count: composioAccounts.items?.length || 0,
        composio_tool_slug: body.composioToolSlug || null,
        browserbase_run_id: browserbaseRun?.runId || null,
        browserbase_status: browserbaseRun?.status || null,
      },
    });

    return json({
      ok: true,
      userId: user.id,
      composio: {
        activeAccounts: sanitizeComposioAccounts(composioAccounts.items || []),
        toolResult: composioResult,
      },
      browserbase: browserbaseRun,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    console.error("[agent-run]", message);
    return json({ ok: false, error: message }, 500);
  }
});

function createAdminClient() {
  const supabaseUrl = mustGetEnv("SUPABASE_URL");
  const serviceRoleKey = mustGetEnv("SUPABASE_SERVICE_ROLE_KEY");

  return createClient(supabaseUrl, serviceRoleKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });
}

async function resolveUser(
  req: Request,
  supabase: ReturnType<typeof createAdminClient>,
  fallbackUserId?: string,
) {
  const authHeader = req.headers.get("authorization") || "";
  const token = authHeader.replace(/^Bearer\s+/i, "").trim();

  if (token) {
    const { data, error } = await supabase.auth.getUser(token);
    if (!error && data.user) {
      return data.user;
    }
  }

  if (fallbackUserId) {
    return { id: fallbackUserId };
  }

  throw new Error("Unauthorized: send a Supabase user JWT or userId.");
}

async function listComposioAccounts(userId: string) {
  const params = new URLSearchParams();
  params.append("user_ids", userId);
  params.append("statuses", "ACTIVE");

  return composioFetch(`/api/v3.1/connected_accounts?${params.toString()}`, {
    method: "GET",
  });
}

async function executeComposioTool({
  toolSlug,
  userId,
  text,
  args,
  connectedAccounts,
}: {
  toolSlug: string;
  userId: string;
  text?: string;
  args?: JsonRecord;
  connectedAccounts: JsonRecord[];
}) {
  const matchingAccount = connectedAccounts.find((account) => {
    const toolkit = account.toolkit as { slug?: string } | undefined;
    return toolSlug.toLowerCase().startsWith(`${toolkit?.slug?.toLowerCase()}_`);
  });

  const payload: JsonRecord = {
    user_id: userId,
    ...(matchingAccount?.id ? { connected_account_id: matchingAccount.id } : {}),
    ...(args ? { arguments: args } : { text: text || "Run this tool for the scheduled task." }),
  };

  return composioFetch(`/api/v3.1/tools/execute/${encodeURIComponent(toolSlug)}`, {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

async function runBrowserbaseAgent({
  task,
  poll,
}: {
  task: string;
  poll: boolean;
}) {
  const run = await browserbaseFetch("/v1/agents/runs", {
    method: "POST",
    body: JSON.stringify({
      task,
      resultSchema: {
        type: "object",
        properties: {
          summary: { type: "string" },
          sourceUrl: { type: "string" },
        },
      },
    }),
  });

  if (!poll || !run.runId) {
    return run;
  }

  const completed = await pollBrowserbaseRun(String(run.runId));
  const sessionId = completed.sessionId ? String(completed.sessionId) : "";
  const liveView = sessionId ? await getBrowserbaseLiveView(sessionId) : null;

  return {
    ...completed,
    liveViewUrl: liveView?.debuggerFullscreenUrl || liveView?.debuggerUrl || null,
  };
}

async function pollBrowserbaseRun(runId: string) {
  const terminalStatuses = new Set(["COMPLETED", "FAILED", "STOPPED", "TIMED_OUT", "PAUSED"]);

  for (let attempt = 0; attempt < 20; attempt += 1) {
    const run = await browserbaseFetch(`/v1/agents/runs/${encodeURIComponent(runId)}`, {
      method: "GET",
    });

    if (terminalStatuses.has(String(run.status))) {
      return run;
    }

    await sleep(1500);
  }

  return browserbaseFetch(`/v1/agents/runs/${encodeURIComponent(runId)}`, {
    method: "GET",
  });
}

async function getBrowserbaseLiveView(sessionId: string) {
  return browserbaseFetch(`/v1/sessions/${encodeURIComponent(sessionId)}/debug?expiresIn=3600`, {
    method: "GET",
  });
}

async function composioFetch(path: string, init: RequestInit) {
  return apiFetch(`${getEnv("COMPOSIO_BASE_URL") || "https://backend.composio.dev"}${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      "x-api-key": mustGetEnv("COMPOSIO_API_KEY"),
      ...(init.headers || {}),
    },
  });
}

async function browserbaseFetch(path: string, init: RequestInit) {
  return apiFetch(`https://api.browserbase.com${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      "X-BB-API-Key": mustGetEnv("BROWSERBASE_API_KEY"),
      ...(init.headers || {}),
    },
  });
}

async function apiFetch(url: string, init: RequestInit) {
  const response = await fetch(url, init);
  const text = await response.text();
  const data = text ? JSON.parse(text) : {};

  if (!response.ok) {
    throw new Error(`${url} failed (${response.status}): ${JSON.stringify(data)}`);
  }

  return data;
}

function sanitizeComposioAccounts(accounts: JsonRecord[]) {
  return accounts.map((account) => ({
    id: account.id,
    status: account.status,
    toolkit: account.toolkit,
    authConfig: account.auth_config || account.authConfig,
    alias: account.alias,
    userId: account.user_id || account.userId,
  }));
}

function summarizeOutput(output: JsonRecord) {
  const summary = JSON.stringify(output);
  return summary.length > 1000 ? `${summary.slice(0, 1000)}...` : summary;
}

function json(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      ...corsHeaders,
      "Content-Type": "application/json",
    },
  });
}

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function mustGetEnv(name: string) {
  const value = getEnv(name);
  if (!value) {
    throw new Error(`${name} is missing`);
  }
  return value;
}

function getEnv(name: string) {
  return Deno.env.get(name)?.trim();
}
