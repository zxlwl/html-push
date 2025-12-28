/**
 * 路由规则定义模块
 * 支持静态路径、动态参数和通配符模式
 */
class Router {
  /**
   * 构造函数
   * @param {Array<Object>} routes - 路由规则数组
   */
  constructor(routes = []) {
    this.routes = routes;
    this.compiledRoutes = this.compileRoutes(routes);
  }

  /**
   * 编译路由规则，将动态路由转换为正则表达式
   * @param {Array<Object>} routes - 路由规则数组
   * @returns {Array<Object>} - 编译后的路由规则
   */
  compileRoutes(routes) {
    return routes.map(route => {
      const compiled = {
        ...route,
        pattern: route.pattern,
        file: route.file
      };

      // 如果是静态路径
      if (!route.pattern.includes(':') && !route.pattern.includes('*')) {
        compiled.type = 'static';
        return compiled;
      }

      // 动态路径参数匹配
      if (route.pattern.includes(':')) {
        compiled.type = 'dynamic';
        // 将动态参数转换为正则表达式
        const regexPattern = route.pattern
          .replace(/:\w+/g, '([^/]+)') // 将:param转换为([^/]+)
          .replace(/\//g, '\\/') // 转义斜杠
          .replace(/\*/g, '(.*)'); // 处理通配符
        compiled.regex = new RegExp(`^${regexPattern}$`);
        // 提取参数名
        compiled.params = (route.pattern.match(/:\w+/g) || []).map(p => p.slice(1));
        return compiled;
      }

      // 通配符模式
      if (route.pattern.includes('*')) {
        compiled.type = 'wildcard';
        const regexPattern = route.pattern
          .replace(/\//g, '\\/')
          .replace(/\*/g, '(.*)');
        compiled.regex = new RegExp(`^${regexPattern}`);
        return compiled;
      }

      return compiled;
    });
  }

  /**
   * 匹配请求路径
   * @param {string} path - 请求路径
   * @returns {Object|null} - 匹配的路由规则或null
   */
  match(path) {
    // 标准化路径，确保以/开头，不以/结尾
    // 特殊处理根路径，保持为/而不是空字符串
    let normalizedPath = path.replace(/^\/*/, '/').replace(/\/*$/, '');
    // 确保根路径始终为/
    if (normalizedPath === '') {
      normalizedPath = '/';
    }

    // 优先匹配静态路由
    const staticRoute = this.compiledRoutes.find(route => 
      route.type === 'static' && route.pattern === normalizedPath
    );
    if (staticRoute) {
      return staticRoute;
    }

    // 匹配动态路由
    for (const route of this.compiledRoutes) {
      if (route.type === 'dynamic' && route.regex) {
        const match = normalizedPath.match(route.regex);
        if (match) {
          // 提取动态参数
          const params = {};
          route.params.forEach((param, index) => {
            params[param] = match[index + 1];
          });
          return {
            ...route,
            params
          };
        }
      }
    }

    // 匹配通配符路由
    for (const route of this.compiledRoutes) {
      if (route.type === 'wildcard' && route.regex) {
        const match = normalizedPath.match(route.regex);
        if (match) {
          return route;
        }
      }
    }

    return null;
  }

  /**
   * 添加路由规则
   * @param {Object} route - 路由规则
   */
  addRoute(route) {
    this.routes.push(route);
    this.compiledRoutes = this.compileRoutes(this.routes);
  }

  /**
   * 移除路由规则
   * @param {string} pattern - 路由模式
   */
  removeRoute(pattern) {
    this.routes = this.routes.filter(route => route.pattern !== pattern);
    this.compiledRoutes = this.compileRoutes(this.routes);
  }

  /**
   * 获取所有路由规则
   * @returns {Array<Object>} - 路由规则数组
   */
  getRoutes() {
    return this.routes;
  }
}

module.exports = Router;
