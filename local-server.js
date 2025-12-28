/**
 * 本地测试服务器
 * 用于在本地环境中测试Serverless HTML Router
 */
const http = require('http');
const url = require('url');
const handler = require('./index').handler;

// 本地服务器端口
const PORT = process.env.PORT || 8080;

/**
 * 模拟serverless事件对象
 * @param {Object} req - HTTP请求对象
 * @returns {Object} - 模拟的serverless事件对象
 */
function createEvent(req) {
  const parsedUrl = url.parse(req.url, true);
  return {
    path: parsedUrl.pathname,
    httpMethod: req.method,
    headers: req.headers,
    queryStringParameters: parsedUrl.query,
    body: '',
    isBase64Encoded: false
  };
}

/**
 * 模拟serverless上下文对象
 * @returns {Object} - 模拟的serverless上下文对象
 */
function createContext() {
  return {
    functionName: 'local-test',
    memoryLimitInMB: 128,
    invokedFunctionArn: 'arn:aws:lambda:local:000000000000:function:local-test',
    awsRequestId: `local-${Date.now()}`
  };
}

// 创建HTTP服务器
const server = http.createServer(async (req, res) => {
  try {
    // 构建模拟的serverless事件和上下文
    const event = createEvent(req);
    const context = createContext();

    // 调用serverless函数处理程序
    const result = await handler(event, context);

    // 设置响应头
    if (result.headers) {
      Object.entries(result.headers).forEach(([key, value]) => {
        if (value !== undefined) {
          res.setHeader(key, value);
        }
      });
    }

    // 设置状态码
    res.statusCode = result.statusCode || 200;

    // 发送响应体
    res.end(result.body);
  } catch (error) {
    console.error('Error handling request:', error);
    res.statusCode = 500;
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.end('<h1>500 Internal Server Error</h1><p>An error occurred while processing your request.</p>');
  }
});

// 启动服务器
server.listen(PORT, () => {
  console.log(`\n🚀 Local test server is running at http://localhost:${PORT}`);
  console.log('\nAvailable routes:');
  console.log('  Static routes:');
  console.log('    http://localhost:3000/');
  console.log('    http://localhost:3000/about');
  console.log('    http://localhost:3000/contact');
  console.log('    http://localhost:3000/privacy');
  console.log('  Dynamic routes:');
  console.log('    http://localhost:3000/users/123');
  console.log('    http://localhost:3000/posts/2025/12/serverless-router');
  console.log('  Wildcard routes:');
  console.log('    http://localhost:3000/docs/getting-started');
  console.log('    http://localhost:3000/products/123/details');
  console.log('    http://localhost:3000/categories/electronics/laptops');
  console.log('\nPress Ctrl+C to stop the server.');
});
