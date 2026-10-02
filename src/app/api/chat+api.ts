import { agent } from "@/lib/openAiAgent";
import { ChatMessage } from "@/types";
import { AgentInputItem, run } from "@openai/agents";

type ChatReqBody = {
    messages?: ChatMessage[]
}

export async function POST(req: Request) {

    try {
        const body = await req.json();
        const messages = Array.isArray(body.messages) ? body.messages : [];

        const MappedMessages = MapAgentInput(messages);

        const result = await run(agent, MappedMessages);

        let browserbaseSession = null;

        for (const item of result?.newItems) {
            if (item.type === 'tool_call_output_item') {
                const output = item.output as any;

                if (output?.type == 'browser_session') {
                    browserbaseSession = output
                }
            }
        }

        return Response.json({
            output: result.finalOutput ?? '',
            browser: browserbaseSession
        })
    }
    catch (e) {
        console.log(e);
        return { e }
    }

}

function MapAgentInput(messages: ChatMessage[]): AgentInputItem[] {
    return messages.map((message: ChatMessage) => {
        if (message.sender === 'agent') {
            return {
                role: 'assistant',
                status: 'completed',
                content: [
                    {
                        type: 'output_text',
                        text: message.text
                    }
                ],
            }
        }
        return {
            role: 'user',
            content: message.text
        }
    })
}