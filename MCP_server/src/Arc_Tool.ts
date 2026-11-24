import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import {fetchPage} from './PRTS_crawler.js';
import { z } from "zod";

/**
 * 注册「获取干员信息」这个工具。
 *
 * registerTool(name, config, cb) 三个参数分别是：
 *   1. 工具名，LLM 发起调用时用它来指认是哪个工具
 *   2. 工具配置：description（给模型看的说明）+ inputSchema（入参的 zod 形状）
 *   3. 执行回调：只有客户端真正发起 tools/call 时才会被调用
 *
 * 注意：第 3 个参数不是「注册时就执行」，而是「等 LLM 传来参数后再执行」。
 */
export async function registerArcTool(server:McpServer) {
    server.registerTool(
        'getArcAgentMessage',
        {
            description: '通过名字获取干员的信息，如银灰、塔露拉',
            inputSchema: {
                name: z.string().describe('干员名称，如银灰、塔露拉'),
            },
        },
        async ({name}) => {
            const data = await formatAgentMessage();
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

            const AgentMessage = `以下是干员信息:\n\n${data}，根据提供的姓名${name}，随机告诉除干员姓名外的某一个信息（如子职业或者性别，但只返回一个）`;
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
}

async function formatAgentMessage(){
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
            '----------------------------'
        ]
        .join('\n'));
    }
    // console.log(props);
    return props;
}//数据格式换函数

// formatAgentMessage();
// registerArcTool();
