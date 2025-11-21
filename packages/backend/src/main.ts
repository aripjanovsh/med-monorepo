import { NestFactory } from "@nestjs/core";
import { NestExpressApplication } from "@nestjs/platform-express";
import { join } from "path";
import { AppModule } from "./app.module";
import { useValidator } from "./common/useValidator";
import { useContainer } from "class-validator";
import { useSwagger } from "./common/useSwagger";
import { Logger } from "@nestjs/common";
import * as hbs from "hbs";

async function bootstrap() {
  const logger = new Logger("Bootstrap");
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  app.enableCors();

  app.setGlobalPrefix("api/v1");

  app.useStaticAssets(join(__dirname, "..", "public"));
  app.setBaseViewsDir(join(__dirname, "..", "modules", "html", "templates"));
  app.setViewEngine("hbs");

  // Register Handlebars helpers for templates
  hbs.registerHelper("eq", (a, b) => a === b);
  hbs.registerHelper("ne", (a, b) => a !== b);

  useContainer(app.select(AppModule), { fallbackOnErrors: true });
  useValidator(app);
  useSwagger(app);

  const port = process.env.PORT;

  await app.listen(port).then(() => {
    logger.log(`Application started on port ${port}`);
  });
}

bootstrap();
