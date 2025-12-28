/**
 * 错误处理机制
 * 负责处理各种错误情况，生成适当的错误响应
 */
const ResponseHandler = require('./responseHandler');

class ErrorHandler {
  /**
   * 构造函数
   */
  constructor() {
    this.responseHandler = new ResponseHandler();
  }

  /**
   * 处理404未找到错误
   * @returns {Object} - HTTP响应对象
   */
  handleNotFound() {
    return this.responseHandler.error(404, '页面未找到', {
      'X-Error-Code': 'NOT_FOUND',
      'Cache-Control': 'no-cache'
    });
  }

  /**
   * 处理403禁止访问错误
   * @returns {Object} - HTTP响应对象
   */
  handleForbidden() {
    return this.responseHandler.error(403, '禁止访问', {
      'X-Error-Code': 'FORBIDDEN',
      'Cache-Control': 'no-cache'
    });
  }

  /**
   * 处理500服务器内部错误
   * @param {Error} error - 错误对象
   * @returns {Object} - HTTP响应对象
   */
  handleServerError(error) {
    // 在生产环境中，不向客户端暴露详细错误信息
    const message = process.env.NODE_ENV === 'production' 
      ? '服务器内部错误，请稍后重试' 
      : error.message;

    return this.responseHandler.error(500, message, {
      'X-Error-Code': 'INTERNAL_ERROR',
      'X-Error-Detail': process.env.NODE_ENV === 'production' ? undefined : error.message,
      'Cache-Control': 'no-cache'
    });
  }

  /**
   * 处理文件不存在错误
   * @param {string} filePath - 文件路径
   * @returns {Object} - HTTP响应对象
   */
  handleFileNotFound(filePath) {
    const message = process.env.NODE_ENV === 'production' 
      ? '页面未找到' 
      : `HTML文件不存在: ${filePath}`;

    return this.responseHandler.error(404, message, {
      'X-Error-Code': 'FILE_NOT_FOUND',
      'X-File-Path': filePath,
      'Cache-Control': 'no-cache'
    });
  }

  /**
   * 处理路径遍历攻击错误
   * @returns {Object} - HTTP响应对象
   */
  handlePathTraversal() {
    return this.responseHandler.error(400, '无效的请求路径', {
      'X-Error-Code': 'INVALID_PATH',
      'Cache-Control': 'no-cache'
    });
  }

  /**
   * 根据错误类型处理错误
   * @param {Error} error - 错误对象
   * @returns {Object} - HTTP响应对象
   */
  handleError(error) {
    if (error.message.includes('HTML file not found')) {
      return this.handleFileNotFound(error.message.split(': ')[1]);
    }

    if (error.message.includes('Path traversal') || error.message.includes('Absolute file path')) {
      return this.handlePathTraversal();
    }

    if (error.message.includes('not found')) {
      return this.handleNotFound();
    }

    // 默认处理为服务器内部错误
    return this.handleServerError(error);
  }
}

module.exports = ErrorHandler;
