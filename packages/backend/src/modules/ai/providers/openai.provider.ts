import { Injectable, Logger } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import type {
  AiProvider,
  AiCompletionOptions,
  AiCompletionResult,
  AiProviderType,
} from "../interfaces/ai-provider.interface";

@Injectable()
export class OpenAiProvider implements AiProvider {
  readonly providerType: AiProviderType = "openai";
  readonly #logger = new Logger(OpenAiProvider.name);
  readonly #apiKey: string | undefined;
  readonly #baseUrl: string;
  readonly #defaultModel: string;

  constructor(private readonly configService: ConfigService) {
    this.#apiKey = this.configService.get<string>("OPENAI_API_KEY");
    this.#baseUrl =
      this.configService.get<string>("OPENAI_BASE_URL") ??
      "https://api.openai.com/v1";
    this.#defaultModel =
      this.configService.get<string>("OPENAI_DEFAULT_MODEL") ?? "gpt-4o-mini";
  }

  isAvailable(): boolean {
    return !!this.#apiKey;
  }

  async complete(options: AiCompletionOptions): Promise<AiCompletionResult> {
    if (!this.#apiKey) {
      throw new Error("OpenAI API key is not configured");
    }

    const model = options.model ?? this.#defaultModel;
    const maxTokens = options.maxTokens ?? 1000;

    // Build request body with only supported parameters
    const requestBody: any = {
      model,
      messages: options.messages,
      max_completion_tokens: maxTokens,
    };

    // Only add temperature if it's not the default value (1) and model supports it
    if (options.temperature !== undefined && options.temperature !== 1) {
      requestBody.temperature = options.temperature;
    }

    const response = await fetch(`${this.#baseUrl}/chat/completions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${this.#apiKey}`,
      },
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      const errorText = await response.text();
      this.#logger.error(`OpenAI API error: ${errorText}`);
      throw new Error(`OpenAI API error: ${response.status} ${errorText}`);
    }

    const data = await response.json();
    const choice = data.choices?.[0];
    const content = choice?.message?.content ?? "";

    return {
      content,
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
