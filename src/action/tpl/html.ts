import { env } from '../..'

export default (base: string) => `
<!DOCTYPE html>
<html lang="zh">
<head>
    <meta charset="UTF-8">
    <title>接口文档</title>
    <link rel="icon" type="image/png" href="https://cdn.jsdelivr.net/npm/swagger-ui-dist@3.22.3/favicon-32x32.png" sizes="32x32"/>
    <link rel="icon" type="image/png" href="https://cdn.jsdelivr.net/npm/swagger-ui-dist@3.22.3/favicon-16x16.png" sizes="16x16"/>
    <link rel="stylesheet" type="text/css" href="https://cdn.jsdelivr.net/npm/swagger-ui-dist@3.22.3/swagger-ui.css">
    <style>
        html {
            box-sizing: border-box;
            overflow: -moz-scrollbars-vertical;
            overflow-y: scroll;
        }

        *,
        *:before,
        *:after {
            box-sizing: inherit;
        }

        body {
            margin: 0;
            background: #fafafa;
        }

        /* 下面是自定义 */

        /* 底部距离 */
        .swagger-container {
            margin-bottom: 100px;
        }

        /* 页面最大宽度 */
        .swagger-container .wrapper {
            max-width: 1100px;
        }

        /* 不显示curl框 */
        .swagger-ui .responses-inner > div > div > div:first-child {
            display: none;
        }

        /* 不显示顶部链接 */
        .swagger-ui .topbar .download-url-wrapper {
            display: none;
        }

        /* 大标题小链接字体 */
        .swagger-ui .info .link .url {
            font-size: 12px;
        }

        /* 大标题描述字体 */
        .swagger-ui .info .description p, .swagger-ui .info .link {
            font-size: 15px;
        }

        /* 模块标题字体 */
        .swagger-ui .opblock-tag, .swagger-ui .opblock-tag small {
            font-size: 16px;
        }

        /* servers标题隐藏 */
        .swagger-ui .servers-title {
            display: none;
        }

        /* servers框对齐 */
        .swagger-ui .scheme-container .schemes {
            align-items: center;
        }

        /* 接口标题字体 */
        .swagger-ui .opblock .opblock-summary-method, .swagger-ui .opblock .opblock-summary-path, .swagger-ui .opblock .opblock-summary-description {
            font-size: 14px;
        }

        /* 参数字体 */
        .swagger-ui .parameters-col_description {
            font-size: 13px;
        }

        /* 数据框改为白色风格 */
        .swagger-ui .response-col_description__inner div.markdown, .swagger-ui .response-col_description__inner div.renderedMarkdown, .swagger-ui .opblock-body pre {
            background-color: #fff;
            color: #555;
            border: 1px solid #d9d9d9;
        }

        /* 数据框改为白色风格 */
        .swagger-ui .response-col_description__inner div.markdown p, .swagger-ui .response-col_description__inner div.renderedMarkdown p {
            color: #555 !important;
        }

        /* 数据框改为白色风格 */
        .swagger-ui .opblock-body pre span {
            color: #555 !important;
        }
        
        /* 隐藏地址第一个字母 */
        .swagger-ui .opblock-summary .opblock-summary-path a:first-letter {
            font-size: 0;
        }

    </style>
</head>
<body>
<div id="swagger-ui"></div>
<script src="https://cdn.jsdelivr.net/npm/swagger-ui-dist@3.22.3/swagger-ui-bundle.js"></script>
<script src="https://cdn.jsdelivr.net/npm/swagger-ui-dist@3.22.3/swagger-ui-standalone-preset.js"></script>
<script>
    window.onload = function () {

        window.ui = SwaggerUIBundle({

            url: location.origin + '/doc${base}.json',

            dom_id: '#swagger-ui',

            deepLinking: true,
            
            filter: ${env.docs.filter || false},

            validatorUrl: null,

            docExpansion: '${env.docs.expansion || 'list'}',

            defaultModelsExpandDepth: 10,
            defaultModelExpandDepth : 10,
            displayRequestDuration  : true,

            presets: [
                SwaggerUIBundle.presets.apis,
                SwaggerUIStandalonePreset,
            ],
            plugins: [
                SwaggerUIBundle.plugins.DownloadUrl,
            ],
            layout : 'StandaloneLayout',
        });
    };
</script>
</body>
</html>
`
