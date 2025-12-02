import { Injectable, Logger } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import type {
  AiProvider,
  AiCompletionOptions,
  AiCompletionResult,
  AiProviderType,
} from "../interfaces/ai-provider.interface";

@Injectable()
export class DeepSeekProvider implements AiProvider {
  readonly providerType: AiProviderType = "deepseek";
  readonly #logger = new Logger(DeepSeekProvider.name);
  readonly #apiKey: string | undefined;
  readonly #baseUrl: string;
  readonly #defaultModel: string;

  constructor(private readonly configService: ConfigService) {
    this.#apiKey = this.configService.get<string>("DEEPSEEK_API_KEY");
    this.#baseUrl =
      this.configService.get<string>("DEEPSEEK_BASE_URL") ??
      "https://api.deepseek.com/v1";
    this.#defaultModel =
      this.configService.get<string>("DEEPSEEK_DEFAULT_MODEL") ??
      "deepseek-chat";
  }

  isAvailable(): boolean {
    return !!this.#apiKey;
  }

  async complete(options: AiCompletionOptions): Promise<AiCompletionResult> {
    if (!this.#apiKey) {
      throw new Error("DeepSeek API key is not configured");
    }

    const model = options.model ?? this.#defaultModel;
    const temperature = options.temperature ?? 0.7;
    const maxTokens = options.maxTokens ?? 1000;

    // DeepSeek uses OpenAI-compatible API
    const response = await fetch(`${this.#baseUrl}/chat/completions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${this.#apiKey}`,
      },
      body: JSON.stringify({
        model,
        messages: options.messages,
        temperature,
        max_tokens: maxTokens,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      this.#logger.error(`DeepSeek API error: ${errorText}`);
      throw new Error(`DeepSeek API error: ${response.status} ${errorText}`);
    }

    const data = await response.json();
    const choice = data.choices?.[0];

    return {
      content: choice?.message?.content ?? "",
      model: data.model,
      usage: data.usage
        ? {
            promptTokens: data.usage.prompt_tokens,
            completionTokens: data.usage.completion_tokens,
            totalTokens: data.usage.total_tokens,
          }
        : undefined,
      finishReason: choice?.finish_reason,
    };
  }
}
