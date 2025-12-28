/**
 * 响应处理机制
 * 负责生成符合serverless平台要求的HTTP响应
 */
class ResponseHandler {
  /**
   * 构造函数
   */
  constructor() {
    // 默认响应头
    this.defaultHeaders = {
      'Content-Type': 'text/html; charset=utf-8',
      'X-Powered-By': 'Serverless HTML Router',
      'Cache-Control': 'public, max-age=3600' // 默认缓存1小时
    };
  }

  /**
   * 生成成功响应
   * @param {string} body - 响应体内容（HTML）
   * @param {Object} headers - 自定义响应头
   * @param {number} statusCode - 状态码，默认为200
   * @returns {Object} - HTTP响应对象
   */
  success(body, headers = {}, statusCode = 200) {
    return {
      statusCode,
      headers: {
        ...this.defaultHeaders,
        ...headers
      },
      body,
      isBase64Encoded: false
    };
  }

  /**
   * 生成重定向响应
   * @param {string} location - 重定向目标URL
   * @param {number} statusCode - 状态码，默认为302
   * @returns {Object} - HTTP响应对象
   */
  redirect(location, statusCode = 302) {
    return {
      statusCode,
      headers: {
        Location: location,
        'Cache-Control': 'no-cache'
      },
      body: '',
      isBase64Encoded: false
    };
  }

  /**
   * 生成错误响应
   * @param {number} statusCode - 状态码
   * @param {string} message - 错误消息
   * @param {Object} headers - 自定义响应头
   * @returns {Object} - HTTP响应对象
   */
  error(statusCode, message, headers = {}) {
    const errorBody = `
      <!DOCTYPE html>
      <html lang="zh-CN">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Error ${statusCode}</title>
        <style>
          body {
            font-family: Arial, sans-serif;
            text-align: center;
            margin-top: 100px;
            color: #333;
          }
          h1 {
            font-size: 48px;
            color: #e74c3c;
            margin-bottom: 20px;
          }
          p {
            font-size: 18px;
            margin-bottom: 30px;
          }
        </style>
      </head>
      <body>
        <h1>${statusCode}</h1>
        <p>${message}</p>
      </body>
      </html>
    `;

    return {
      statusCode,
      headers: {
        ...this.defaultHeaders,
        'Cache-Control': 'no-cache',
        ...headers
      },
      body: errorBody,
      isBase64Encoded: false
    };
  }

  /**
   * 设置默认响应头
   * @param {Object} headers - 默认响应头
   */
  setDefaultHeaders(headers) {
    this.defaultHeaders = {
      ...this.defaultHeaders,
      ...headers
    };
  }

  /**
   * 获取当前默认响应头
   * @returns {Object} - 默认响应头
   */
  getDefaultHeaders() {
    return { ...this.defaultHeaders };
  }
}

module.exports = ResponseHandler;
