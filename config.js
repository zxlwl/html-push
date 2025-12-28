/**
 * 配置文件
 * 定义路由规则和其他配置项
 */
module.exports = {
  // HTML文件的基础路径
  basePath: './html',

  // 路由规则配置
  // 支持静态路径、动态参数和通配符模式
  routes: [
    // 静态路径映射
    {
      pattern: '/',
      file: 'index.html'
    },
    {
      pattern: '/englishppt',
      file: 'englishppt.html'
    }
  ]
};
