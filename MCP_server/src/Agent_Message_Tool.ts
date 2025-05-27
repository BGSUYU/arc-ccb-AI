import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import {fetchPage} from './PRTS_crawler.js';
// import { z } from "zod";

export async function handleAgentMessageTool(server:McpServer,state:string) {
    server.tool(
        "getAgentMessage",
        "获取某个干员信息",
        async (state) => {
            const data = await fromatAgentMessage();
            if(!data || data.length === 0) {
                return {
                    content:[
                        {
                            type: "text",
                            text: "没有找到干员信息，请检查数据源或网络连接。",
                        }
                    ]
                }
            }

            const AgentMessage = `以下是干员信息:\n\n${data.join('\n\n')}，根据提供的姓名${state}，告诉除干员姓名外的某一个信息（如子职业或者性别，但只返回一个）`;
            return{
                content:[
                    {
                        type: "text",
                        text: AgentMessage,
                    }
                ]
            }
        }
    )
}//注册获取干员信息的工具

async function fromatAgentMessage(){
    // 这里可以根据需要对数据进行格式化
    const data = await fetchPage();
    const props:string[] = [];

    for(let i = 0; i < data.name.length; i++) {
        props.push([
            `干员姓名: ${data.name[i] || 'Unknown'}`,
            `子职业: ${data.SubProfession[i] || 'Unknown'}`,
            `势力: ${data.Power[i] || 'Unknown'}`,
            `出生地: ${data.BirthPlace[i] || 'Unknown'}`,
            `种族: ${data.Race[i] || 'Unknown'}`,
            `性别: ${data.Sex[i] || 'Unknown'}`,
            `位置: ${data.Position[i] || 'Unknown'}`,
            `获取方式: ${data.Obtain[i] || 'Unknown'}`,
            `标签: ${data.Tag[i] || 'Unknown'}`,
            `特性: ${data.Feature[i] || 'Unknown'}`,
            '---'
        ]
        .join('\n'));
    }
    console.log(props);
    return props;
}//数据格式换函数

// fromatAgentMessage();
// handleAgentMessageTool();