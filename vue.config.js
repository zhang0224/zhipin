module.exports = {
    css: {
        loaderOptions: {
          css: {},
          postcss: {
            plugins: [
              require('postcss-px2rem')({
                remUnit: 37.5
              })
            ]
          }
        }
    },
    baseUrl: './',
    devServer: {
      // port: 8071,
      // open: true, //配置自动启动浏览器 
      proxy: {
        '/api': {
          target: 'http://39.104.93.155:8081/', //jiajia的接口
          changeOrigin: true,
          ws: true,
          pathRewrite: {
            '^/api': ''
          }
        },
        '/pay': { // 遗留的接口
          target: "http://39.104.93.155:9300/",
          changeOrigin: true,
          ws: true,
          pathRewrite: {
            '^/pay': ''
          }
        },
      }
    }, 
}