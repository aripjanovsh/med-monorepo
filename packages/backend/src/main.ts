import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module";
import { useValidator } from "./common/useValidator";
import { useContainer } from "class-validator";
import { useSwagger } from "./common/useSwagger";
import { ConfigService } from "@nestjs/config";
import { Logger } from "@nestjs/common";

async function bootstrap() {
  const logger = new Logger("Bootstrap");
  const app = await NestFactory.create(AppModule);

  app.enableCors();

  app.setGlobalPrefix("api/v1");

  useContainer(app.select(AppModule), { fallbackOnErrors: true });
  useValidator(app);
  useSwagger(app);

  const port = process.env.PORT;

  await app.listen(port).then(() => {
    logger.log(`Application started on port ${port}`);
  });
}

bootstrap();
