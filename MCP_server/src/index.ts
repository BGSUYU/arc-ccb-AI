import express from 'express';
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import cors from 'cors';
import { StreamableHTTPServerTransport } from '@modelcontextprotocol/sdk/server/streamableHttp.js';
import {registerArcTool} from './Arc_Tool.js'; //引入干员信息工具的注册方法

const app = express();//创建Express应用实例

app.use(express.json());//解析JSON请求体

const port = 20002;

app.use(cors());//配置跨域

app.post('/mcp', async (req, res) => {
    try{
        const server = new McpServer({
            name:'ark-mcp-server',
            version:'1.0.0',
        })//创建MCP服务器实例（不声明 capabilities：SDK 在注册工具时会自动声明 tools 能力）

        const transport :StreamableHTTPServerTransport = new StreamableHTTPServerTransport({
            sessionIdGenerator:undefined,
        }); //创建MCP服务器实例和传输层 并使用无状态连接

        res.on('close', () => {
          console.log('Request closed');
          transport.close();
          server.close();
        });//监听请求关闭事件（HTTP连接关闭）

        console.log('Received MCP request:', req.body);

        // initialized  客户端告诉服务器希望请求初始化连接
        // tools/list  客户端请求工具列表
        // notifications/initialized 客户端告诉服务器初始化完成能够继续进行通信

        await registerArcTool(server);//注册获取干员信息的工具
        await server.connect(transport);
        await transport.handleRequest(req, res, req.body);

    } catch (error) {
    console.error('Error handling MCP request:', error);
    if (!res.headersSent) {
      res.status(500).json({
        jsonrpc: '2.0',
        error: {
          code: -32603,
          message: 'Internal server error',
        },
        id: null,
      });
    }
  }
})//处理MCP请求的路由 不选择SSE因为SEE虽然浏览器原生支持SSE 但不支持双向传输

app.listen(port, () => {
  console.log(`MCP Stateless Streamable HTTP Server listening on port ${port}`);
});