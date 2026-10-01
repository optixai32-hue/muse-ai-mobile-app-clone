import { agent } from "@/lib/openAiAgent";
import { ChatMessage } from "@/types";
import { AgentInputItem, run } from "@openai/agents";

type ChatReqBody = {
    messages?: ChatMessage[]
}

export async function POST(req: Request) {

    const body = await req.json();
    const messages = body.messages as ChatReqBody;
    const MappedMessages = MapAgentInput(messages?.messages || []);


    const result = await run(agent, MappedMessages);

    return Response.json({
        output: result.finalOutput ?? ''
    })

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