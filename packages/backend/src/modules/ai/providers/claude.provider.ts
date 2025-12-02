import { Injectable, Logger } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import type {
  AiProvider,
  AiCompletionOptions,
  AiCompletionResult,
  AiProviderType,
} from "../interfaces/ai-provider.interface";

@Injectable()
export class ClaudeProvider implements AiProvider {
  readonly providerType: AiProviderType = "claude";
  readonly #logger = new Logger(ClaudeProvider.name);
  readonly #apiKey: string | undefined;
  readonly #baseUrl: string;
  readonly #defaultModel: string;

  constructor(private readonly configService: ConfigService) {
    this.#apiKey = this.configService.get<string>("ANTHROPIC_API_KEY");
    this.#baseUrl =
      this.configService.get<string>("ANTHROPIC_BASE_URL") ??
      "https://api.anthropic.com";
    this.#defaultModel =
      this.configService.get<string>("ANTHROPIC_DEFAULT_MODEL") ??
      "claude-3-5-sonnet-20241022";
  }

  isAvailable(): boolean {
    return !!this.#apiKey;
  }

  async complete(options: AiCompletionOptions): Promise<AiCompletionResult> {
    if (!this.#apiKey) {
      throw new Error("Anthropic API key is not configured");
    }

    const model = options.model ?? this.#defaultModel;
    const temperature = options.temperature ?? 0.7;
    const maxTokens = options.maxTokens ?? 1000;

    // Extract system message if present
    const systemMessage = options.messages.find((m) => m.role === "system");
    const nonSystemMessages = options.messages.filter(
      (m) => m.role !== "system"
    );

    const body: Record<string, unknown> = {
      model,
      max_tokens: maxTokens,
      messages: nonSystemMessages.map((m) => ({
        role: m.role === "assistant" ? "assistant" : "user",
        content: m.content,
      })),
    };

    if (systemMessage) {
      body.system = systemMessage.content;
    }

    // Only add temperature if not 1.0 (Claude default)
    if (temperature !== 1.0) {
      body.temperature = temperature;
    }

    const response = await fetch(`${this.#baseUrl}/v1/messages`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": this.#apiKey,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const errorText = await response.text();
      this.#logger.error(`Anthropic API error: ${errorText}`);
      throw new Error(`Anthropic API error: ${response.status} ${errorText}`);
    }

    const data = await response.json();
    const textContent = data.content?.find(
      (c: { type: string }) => c.type === "text"
    );

    return {
      content: textContent?.text ?? "",
      model: data.model,
      usage: data.usage
        ? {
            promptTokens: data.usage.input_tokens,
            completionTokens: data.usage.output_tokens,
            totalTokens: data.usage.input_tokens + data.usage.output_tokens,
          }
        : undefined,
      finishReason: data.stop_reason,
    };
  }
}
