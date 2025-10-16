import { DocumentBuilder, SwaggerModule } from "@nestjs/swagger";

import { readFileSync } from "fs";
import { join } from "path";

export const useSwagger = (app) => {
  // Чтение версии из package.json
  const packageJson = JSON.parse(
    readFileSync(join(process.cwd(), "package.json"), "utf-8"),
  );

  const config = new DocumentBuilder()
    .setTitle("Medical Clinic API")
    .setDescription("Medical Clinic API documentation.")
    .setVersion(packageJson.version)
    .addBearerAuth()
    .addSecurity("x-organization-id", {
      type: "apiKey",
      in: "header",
      name: "x-organization-id",
    })
    .addApiKey(
      {
        type: "apiKey",
        in: "header",
        name: "x-organization-id",
      },
      "x-organization-id",
    )

    .build();

  const document = SwaggerModule.createDocument(app, config);

  SwaggerModule.setup("docs", app, document, {
    swaggerOptions: {
      docExpansion: "none",
      persistAuthorization: true,
    },
    jsonDocumentUrl: "/docs.json",
    customCss:
      '@import url("https://fonts.googleapis.com/css?family=Nunito+Sans:200,200i,300,300i,400,400i,600,600i,700,700i,800,800i,900,900i&display=swap");body{background-color:#fff!important}*{font-family:Nunito Sans,sans-serif!important}.model-example>div *,.opblock-summary-path a span{font-family:monospace!important}.swagger-ui .info{margin:0 0 20px;padding:40px;border-bottom:1px solid #f7f7f7}.swagger-ui .wrapper{padding:0}.swagger-ui .opblock-tag-section{margin:20px;border-radius:8px;background-color:#fff;box-shadow:0 1px 3px 0 rgba(0,0,0,.2)}.swagger-ui .opblock-tag-section>.opblock-tag{margin:0!important;padding:20px!important;border:none!important}.swagger-ui .opblock-tag-section>div{border-top:1px solid rgba(213,213,214,.3)!important;padding:20px!important}.swagger-ui .opblock-tag-section>div>span:last-child>div{margin:0}.swagger-ui .opblock-tag-section small{padding:0 20px!important}.swagger-ui .opblock-tag-section .markdown p{margin:0!important;padding-top:2px}.swagger-ui .opblock{box-shadow:none!important}.swagger-ui .expand-operation{display:inline-flex}.swagger-ui .swagger-ui .info .base-url{font-size:14px!important;background:#0af;display:inline-block;padding:2px 5px;color:#fff;border-radius:2px}.swagger-ui [data-code="400"],.swagger-ui [data-code="500"]{color:#dc143c}',
    customJsStr: `
     
    `,

    // customJsStr: `
    // // Функция для автоматической авторизации
    // function autoAuthorize() {
    //   // Определяем, был ли выполнен запрос на /login
    //   const originalFetch = window.fetch;
    //   window.fetch = async function (...args) {
    //     const response = await originalFetch.apply(this, args);
    //     // Проверяем, был ли запрос на /auth/login
    //     if (args[0].endsWith('/auth/login') && response.ok) {
    //       const data = await response.clone().json();
    //       if (data.accessToken) {
    //         const value = data.accessToken;
    //
    //         // Автоматически авторизуем Swagger с полученным токеном
    //         window.ui.authActions.authorize({
    //           bearer: {
    //             name: 'Bearer',
    //             schema: {
    //               type: 'http',
    //               in: 'header',
    //               scheme: 'bearer',
    //               bearerFormat: 'JWT',
    //             },
    //             value,
    //           },
    //         });
    //
    //         const token = {
    //           name: 'authorization',
    //           schema: {
    //             scheme: 'bearer',
    //             bearerFormat: 'JWT',
    //             name: 'authorization',
    //             type: 'http',
    //             in: 'header',
    //           },
    //           value,
    //           authorization: {
    //             name: 'authorization',
    //             schema: {
    //               scheme: 'bearer',
    //               bearerFormat: 'JWT',
    //               name: 'authorization',
    //               type: 'http',
    //               in: 'header',
    //             },
    //             value,
    //           },
    //         };
    //         localStorage.setItem('authorized', JSON.stringify(token));
    //
    //         alert('Swagger автоматически авторизован с токеном:', data.accessToken);
    //       }
    //     }
    //
    //     return response;
    //   };
    // }
    //
    // // Инициализируем автоматическую авторизацию
    // autoAuthorize();
    // `,
  });
};
