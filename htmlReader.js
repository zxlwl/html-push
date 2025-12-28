/**
 * HTML文件读取组件
 * 负责读取指定路径的HTML文件内容
 */
const fs = require('fs').promises;
const path = require('path');

class HTMLReader {
  /**
   * 构造函数
   * @param {string} basePath - HTML文件的基础路径
   */
  constructor(basePath) {
    this.basePath = basePath;
  }

  /**
   * 读取HTML文件内容
   * @param {string} filePath - 相对于basePath的HTML文件路径
   * @returns {Promise<string>} - HTML文件内容
   * @throws {Error} - 文件不存在或读取失败时抛出错误
   */
  async read(filePath) {
    // 确保filePath是相对路径，防止路径遍历攻击
    if (path.isAbsolute(filePath)) {
      throw new Error('Absolute file path is not allowed');
    }

    // 解析完整文件路径
    const fullPath = path.resolve(this.basePath, filePath);
    
    // 确保最终路径在basePath目录内，防止路径遍历攻击
    if (!fullPath.startsWith(path.resolve(this.basePath))) {
      throw new Error('Path traversal is not allowed');
    }

    try {
      // 检查文件是否存在
      await fs.access(fullPath);
      
      // 读取文件内容
      const content = await fs.readFile(fullPath, 'utf8');
      return content;
    } catch (error) {
      if (error.code === 'ENOENT') {
        throw new Error(`HTML file not found: ${filePath}`);
      }
      throw error;
    }
  }

  /**
   * 检查HTML文件是否存在
   * @param {string} filePath - 相对于basePath的HTML文件路径
   * @returns {Promise<boolean>} - 文件是否存在
   */
  async exists(filePath) {
    try {
      const fullPath = path.resolve(this.basePath, filePath);
      await fs.access(fullPath);
      return true;
    } catch {
      return false;
    }
  }

  /**
   * 获取HTML文件的统计信息
   * @param {string} filePath - 相对于basePath的HTML文件路径
   * @returns {Promise<Object>} - 文件统计信息
   */
  async stat(filePath) {
    const fullPath = path.resolve(this.basePath, filePath);
    return await fs.stat(fullPath);
  }
}

module.exports = HTMLReader;
