import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { PrismaModule } from "@/common/prisma/prisma.module";
import { AiService } from "./ai.service";
import { PromptService } from "./prompt.service";
import { OpenAiProvider } from "./providers/openai.provider";
import { DeepSeekProvider } from "./providers/deepseek.provider";
import { ClaudeProvider } from "./providers/claude.provider";
import { AI_PROVIDER_TOKEN } from "./interfaces/ai-provider.interface";

@Module({
  imports: [PrismaModule, ConfigModule],
  providers: [
    AiService,
    PromptService,
    OpenAiProvider,
    DeepSeekProvider,
    ClaudeProvider,
    {
      provide: AI_PROVIDER_TOKEN,
      useFactory: (
        openai: OpenAiProvider,
        deepseek: DeepSeekProvider,
        claude: ClaudeProvider
      ) => [openai, deepseek, claude],
      inject: [OpenAiProvider, DeepSeekProvider, ClaudeProvider],
    },
  ],
  exports: [AiService, PromptService],
})
export class AiModule {}
