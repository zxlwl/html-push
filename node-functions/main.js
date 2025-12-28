// EdgeOne Pages Node Functions 主入口
// 此文件将处理所有HTTP请求并路由到相应的HTML文件

const fs = require('fs').promises;
const pathModule = require('path');

// 配置路由规则
const routes = [
    { pattern: '/', file: 'index.html' },
    { pattern: '/englishppt', file: 'englishppt.html' },
    // 添加对带.html后缀的支持
    { pattern: '/englishppt.html', file: 'englishppt.html' }
];

// HTML文件基础路径 - 适配EdgeOne Pages部署环境
const BASE_PATH = './html';

/**
 * EdgeOne Pages HTTP 处理函数
 * @param {Object} request - 请求对象
 * @param {Object} context - 上下文对象
 * @returns {Promise<Object>} - HTTP响应
 */
async function handler(request, context) {
    try {
        // 获取请求路径
        const url = new URL(request.url);
        let requestPath = url.pathname;

        console.log(`Received request for path: ${requestPath}`);

        // 路径归一化
        requestPath = normalizePath(requestPath);

        // 匹配路由
        const matchedRoute = matchRoute(requestPath, routes);
        if (!matchedRoute) {
            return createNotFoundResponse();
        }

        console.log(`Matched route: ${matchedRoute.pattern} -> ${matchedRoute.file}`);

        // 读取HTML文件
        const htmlContent = await readHTMLFile(matchedRoute.file);

        // 返回成功响应
        return createSuccessResponse(htmlContent);
    } catch (error) {
        console.error('Error handling request:', error);
        return createServerErrorResponse(error);
    }
}

/**
 * 路径归一化
 * @param {string} path - 请求路径
 * @returns {string} - 归一化后的路径
 */
function normalizePath(path) {
    let normalizedPath = path.replace(/^\/*/, '/').replace(/\/*$/, '');
    if (normalizedPath === '') normalizedPath = '/';
    return normalizedPath;
}

/**
 * 路由匹配
 * @param {string} path - 请求路径
 * @param {Array} routes - 路由规则数组
 * @returns {Object|null} - 匹配的路由或null
 */
function matchRoute(path, routes) {
    // 先尝试完全匹配
    for (const route of routes) {
        if (route.pattern === path) {
            return route;
        }
    }

    // 再尝试动态参数匹配（目前未实现，如需可扩展）
    // 再尝试通配符匹配（目前未实现，如需可扩展）

    return null;
}

/**
 * 读取HTML文件
 * @param {string} fileName - 文件名
 * @returns {Promise<string>} - 文件内容
 */
async function readHTMLFile(fileName) {
    const filePath = pathModule.join(__dirname, BASE_PATH, fileName);
    try {
        const content = await fs.readFile(filePath, 'utf8');
        return content;
    } catch (error) {
        if (error.code === 'ENOENT') {
            throw new Error(`HTML file not found: ${fileName}`);
        }
        throw error;
    }
}

/**
 * 创建成功响应
 * @param {string} content - 响应内容
 * @returns {Object} - HTTP响应
 */
function createSuccessResponse(content) {
    return {
        status: 200,
        headers: {
            'Content-Type': 'text/html; charset=utf-8',
            'Cache-Control': 'public, max-age=3600'
        },
        body: content
    };
}

/**
 * 创建404响应
 * @returns {Object} - HTTP响应
 */
function createNotFoundResponse() {
    const html = `
    <!DOCTYPE html>
    <html lang="zh-CN">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>404 - 页面未找到</title>
      <style>
        body { font-family: Arial, sans-serif; text-align: center; padding: 50px; }
        h1 { color: #333; }
        p { color: #666; }
      </style>
    </head>
    <body>
      <h1>404</h1>
      <h2>页面未找到</h2>
      <p>您请求的页面不存在或已被移除。</p>
      <a href="/">返回首页</a>
    </body>
    </html>
  `;

    return {
        status: 404,
        headers: {
            'Content-Type': 'text/html; charset=utf-8'
        },
        body: html
    };
}

/**
 * 创建500响应
 * @param {Error} error - 错误对象
 * @returns {Object} - HTTP响应
 */
function createServerErrorResponse(error) {
    const html = `
    <!DOCTYPE html>
    <html lang="zh-CN">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>500 - 服务器错误</title>
      <style>
        body { font-family: Arial, sans-serif; text-align: center; padding: 50px; }
        h1 { color: #333; }
        p { color: #666; }
      </style>
    </head>
    <body>
      <h1>500</h1>
      <h2>服务器错误</h2>
      <p>服务器内部发生错误，请稍后重试。</p>
      <a href="/">返回首页</a>
    </body>
    </html>
  `;

    return {
        status: 500,
        headers: {
            'Content-Type': 'text/html; charset=utf-8'
        },
        body: html
    };
}

// EdgeOne Pages 要求使用 CommonJS 模块导出
module.exports = handler;