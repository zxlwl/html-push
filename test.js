/**
 * 路由管理器测试脚本
 * 用于验证不同路由规则的匹配和响应情况
 */
const http = require('http');

// 测试服务器配置
const TEST_SERVER_URL = 'http://localhost:8080';

/**
 * 发送HTTP请求并返回响应
 * @param {string} path - 请求路径
 * @returns {Promise<Object>} - HTTP响应对象
 */
async function sendRequest(path) {
  return new Promise((resolve, reject) => {
    const options = {
      // 使用IPv4地址，避免localhost解析为IPv6地址导致的连接拒绝问题
      hostname: '127.0.0.1',
      port: 8080,
      path: path,
      method: 'GET'
    };

    const req = http.request(options, (res) => {
      let body = '';
      res.on('data', (chunk) => {
        body += chunk;
      });
      res.on('end', () => {
        resolve({
          statusCode: res.statusCode,
          headers: res.headers,
          body: body
        });
      });
    });

    req.on('error', (error) => {
      reject(error);
    });

    req.end();
  });
}

/**
 * 测试静态路由
 */
async function testStaticRoutes() {
  console.log('=== 测试静态路由 ===');

  const testPaths = ['/', '/about', '/contact', '/privacy'];

  for (const path of testPaths) {
    try {
      const response = await sendRequest(path);
      console.log(`${path} - 状态码: ${response.statusCode}`);
      // 验证响应头
      if (response.headers['content-type'].includes('text/html')) {
        console.log(`  ✅ 响应类型正确: ${response.headers['content-type']}`);
      } else {
        console.log(`  ❌ 响应类型错误: ${response.headers['content-type']}`);
      }
      // 验证响应体包含基本HTML结构
      if (response.body.includes('<html')) {
        console.log(`  ✅ 响应体包含HTML内容`);
      } else {
        console.log(`  ❌ 响应体不包含HTML内容`);
      }
    } catch (error) {
      console.log(`${path} - ❌ 测试失败: ${error.message}`);
    }
    console.log('');
  }
}

/**
 * 测试动态路由
 */
async function testDynamicRoutes() {
  console.log('=== 测试动态路由 ===');

  const testPaths = ['/users/123', '/users/456', '/posts/2025/12/serverless-router'];

  for (const path of testPaths) {
    try {
      const response = await sendRequest(path);
      console.log(`${path} - 状态码: ${response.statusCode}`);
      if (response.statusCode === 200) {
        console.log(`  ✅ 动态路由匹配成功`);
      } else {
        console.log(`  ❌ 动态路由匹配失败`);
      }
    } catch (error) {
      console.log(`${path} - ❌ 测试失败: ${error.message}`);
    }
    console.log('');
  }
}

/**
 * 测试通配符路由
 */
async function testWildcardRoutes() {
  console.log('=== 测试通配符路由 ===');

  const testPaths = [
    '/docs/getting-started',
    '/docs/api/reference',
    '/products/123/details',
    '/products/456/details',
    '/categories/electronics/laptops',
    '/categories/fashion/clothes'
  ];

  for (const path of testPaths) {
    try {
      const response = await sendRequest(path);
      console.log(`${path} - 状态码: ${response.statusCode}`);
      if (response.statusCode === 200) {
        console.log(`  ✅ 通配符路由匹配成功`);
      } else {
        console.log(`  ❌ 通配符路由匹配失败`);
      }
    } catch (error) {
      console.log(`${path} - ❌ 测试失败: ${error.message}`);
    }
    console.log('');
  }
}

/**
 * 测试404错误处理
 */
async function test404Handling() {
  console.log('=== 测试404错误处理 ===');

  const testPaths = ['/nonexistent', '/invalid/path', '/unknown/route'];

  for (const path of testPaths) {
    try {
      const response = await sendRequest(path);
      console.log(`${path} - 状态码: ${response.statusCode}`);
      if (response.statusCode === 404) {
        console.log(`  ✅ 404错误处理正确`);
      } else {
        console.log(`  ❌ 404错误处理失败，预期状态码404，实际${response.statusCode}`);
      }
    } catch (error) {
      console.log(`${path} - ❌ 测试失败: ${error.message}`);
    }
    console.log('');
  }
}

/**
 * 运行所有测试
 */
async function runAllTests() {
  console.log('开始测试Serverless HTML Router...\n');

  try {
    await testStaticRoutes();
    await testDynamicRoutes();
    await testWildcardRoutes();
    await test404Handling();

    console.log('=== 所有测试完成 ===');
    console.log('🎉 路由管理器功能测试通过！');
  } catch (error) {
    console.error('测试过程中发生错误:', error);
  }
}

// 运行测试
runAllTests();
