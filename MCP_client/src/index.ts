import { StreamableHTTPClientTransport } from "@modelcontextprotocol/sdk/client/streamableHttp.js";
import { Client } from "@modelcontextprotocol/sdk/client/index.js";

import dotenv from "dotenv";
import { OpenAI } from "openai";
import { ChatCompletionMessageParam } from "openai/resources/chat/completions";

dotenv.config(); //加载环境变量

const API_KEY = process.env.DEEPSEEK_API_KEY; //获取OpenAI API密钥

const openai = new OpenAI({
  apiKey: API_KEY,
  baseURL: "https://api.deepseek.com", // DeepSeek API的基础URL
})

const transport = new StreamableHTTPClientTransport(new URL("http://localhost:20002/mcp")) //创建MCP客户端传输层(流式通信) 决定了MCP客户端的传输方式

const client = new Client({ name: "Agent-Client", version: "1.0.0" });//创建MCP客户端实例

client.connect(transport); //连接到MCP服务器

const toolsResult = await client.listTools()

const tools:any[] = toolsResult.tools.map((tool)=>{
  return{
    type: "function",
    function: {
    name: tool.name,
    description: tool.description,
    parameters: tool.inputSchema,
    }
  }
});//获取工具列表并格式化

const query = "银灰";//这里可以改为前端输入

const messages: ChatCompletionMessageParam[] = [
  {
    role: "user",
    content: query,
  }
];

// console.log("MCP Client Transport created:", tools);
// console.dir(tools, { depth: null });

const response = await openai.chat.completions.create({
        messages:messages,
        model:"deepseek-chat",
        tools:tools
})

const finalText = [];
// const toolResults = [];

const choice = response.choices?.[0];
// console.log(choice)

 if (choice.finish_reason === "tool_calls" && choice.message.tool_calls) {
    for (const toolCall of choice.message.tool_calls) {
        const toolName = toolCall.function.name;
        const toolArgs = JSON.parse(toolCall.function.arguments ?? "银灰");

        const result = await client.callTool({
        name: toolName,
        arguments: toolArgs
        });

        finalText.push(`[调用工具 ${toolName}, 参数: ${JSON.stringify(toolArgs)}]`);
        
        messages.push(choice.message)

        messages.push({
        role: "tool",
        tool_call_id: toolCall.id,
        content: typeof result.content === "string"
            ? result.content
            : JSON.stringify(result.content),
        });

        const followup = await openai.chat.completions.create({
        model: "deepseek-chat",
        messages
        });

        const followupContent = followup.choices?.[0]?.message?.content ?? "";
        finalText.push(followupContent);
    }
    } else {
    finalText.push(choice.message?.content ?? "");
    }

    console.log(finalText.join("\n"));
    console.log("MCP Client Transport created:");