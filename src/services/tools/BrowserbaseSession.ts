import { GetBrowserbase } from "@/lib/browserbase";
import { BrowserSessionToolOutput } from "@/types";
import { tool } from "@openai/agents";
import z from "zod";

export const createBrowserbaseSessionTool = tool({
    name: 'create_browser_session',
    description: `
Create a Browserbase cloud browser session.

Use this tool when the user's request requires:
- opening a website
- interacting with a website
- browsing current web content
- logging into a website
- filling forms
- booking
- checkout
- browser automation
- web research
`,

    parameters: z.object({
        reason: z
            .string()
            .describe("Why a browser session is required."),

        startUrl: z
            .string()
            .optional()
            .describe("Optional website the user wants to visit."),
    }),
    execute: async ({ reason, startUrl }) => {
        const projectId = process.env.BROWSERBASE_PROJECT_ID;

        const browserbase = GetBrowserbase();

        //Create browserbase Session
        const session = await browserbase.sessions.create({
            projectId,
            keepAlive: true
        })

        console.log(session, startUrl);
        const debugUrl = await browserbase.sessions.debug(session.id);
        const previewUrl = debugUrl.debuggerFullscreenUrl ?? debugUrl.debuggerUrl

        return {
            type: 'browser_session',
            sessionId: session?.id,
            reason,
            startUrl,
            previewUrl
        } satisfies BrowserSessionToolOutput

    }

})