const Router = require('./router');
const HTMLReader = require('./htmlReader');
const ResponseHandler = require('./responseHandler');
const ErrorHandler = require('./errorHandler');
const config = require('./config');

// 创建路由实例
const router = new Router(config.routes);
const htmlReader = new HTMLReader(config.basePath || './html');
const responseHandler = new ResponseHandler();
const errorHandler = new ErrorHandler();

/**
 * Serverless函数主入口
 * @param {Object} event - serverless平台事件对象
 * @param {Object} context - serverless平台上下文对象
 * @returns {Promise<Object>} - HTTP响应
 */
module.exports.handler = async (event, context) => {
  try {
    // 从事件对象中获取请求路径
    // 兼容不同serverless平台的事件格式
    let path = '/';
    if (event.path) {
      path = event.path;
    } else if (event.requestContext && event.requestContext.http && event.requestContext.http.path) {
      path = event.requestContext.http.path;
    } else if (event.url) {
      path = new URL(event.url).pathname;
    }

    console.log(`Received request for path: ${path}`);

    // 匹配路由
    const matchedRoute = router.match(path);
    if (!matchedRoute) {
      return errorHandler.handleNotFound();
    }

    console.log(`Matched route: ${matchedRoute.pattern} -> ${matchedRoute.file}`);

    // 读取HTML文件
    try {
      const htmlContent = await htmlReader.read(matchedRoute.file);
      
      // 返回成功响应
      return responseHandler.success(htmlContent);
    } catch (readError) {
      console.error(`Error reading file ${matchedRoute.file}:`, readError);
      if (readError.message.includes('HTML file not found')) {
        return errorHandler.handleFileNotFound(matchedRoute.file);
      }
      throw readError;
    }
  } catch (error) {
    console.error('Error handling request:', error);
    return errorHandler.handleServerError(error);
  }
};
