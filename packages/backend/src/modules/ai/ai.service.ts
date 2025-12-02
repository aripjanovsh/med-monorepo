import { Injectable, Logger, Inject, OnModuleInit } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { PromptService } from "./prompt.service";
import {
  AI_PROVIDER_TOKEN,
  type AiProvider,
  type AiProviderType,
  type AiCompletionResult,
  type AiMessage,
} from "./interfaces/ai-provider.interface";

export type AiCompletionInput = {
  promptKey: string;
  variables?: Record<string, string>;
  systemPrompt?: string;
  userMessage?: string;
  overrideModel?: string;
  overrideTemperature?: number;
  overrideMaxTokens?: number;
};

export type VisitSummaryInput = {
  visitData: string;
};

@Injectable()
export class AiService implements OnModuleInit {
  readonly #logger = new Logger(AiService.name);
  readonly #providers = new Map<AiProviderType, AiProvider>();
  #defaultProvider: AiProviderType;

  constructor(
    @Inject(AI_PROVIDER_TOKEN)
    private readonly aiProviders: AiProvider[],
    private readonly promptService: PromptService,
    private readonly configService: ConfigService
  ) {
    this.#defaultProvider =
      (this.configService.get<string>(
        "AI_DEFAULT_PROVIDER"
      ) as AiProviderType) ?? "openai";
  }

  onModuleInit(): void {
    // Register all available providers
    for (const provider of this.aiProviders) {
      if (provider.isAvailable()) {
        this.#providers.set(provider.providerType, provider);
        this.#logger.log(`AI Provider registered: ${provider.providerType}`);
      } else {
        this.#logger.warn(
          `AI Provider not available (missing API key): ${provider.providerType}`
        );
      }
    }

    if (this.#providers.size === 0) {
      this.#logger.warn(
        "No AI providers are configured. AI features will be unavailable."
      );
    }
  }

  /**
   * Get a provider by type, falls back to default if not specified
   */
  getProvider(providerType?: AiProviderType): AiProvider {
    const type = providerType ?? this.#defaultProvider;
    const provider = this.#providers.get(type);

    if (!provider) {
      // Try to get any available provider
      const fallback = this.#providers.values().next().value;
      if (fallback) {
        this.#logger.warn(
          `Provider ${type} not available, falling back to ${fallback.providerType}`
        );
        return fallback;
      }
      throw new Error(`No AI providers are available`);
    }

    return provider;
  }

  /**
   * Get all available providers
   */
  getAvailableProviders(): AiProviderType[] {
    return Array.from(this.#providers.keys());
  }

  /**
   * Execute a completion using a prompt key
   */
  async complete(input: AiCompletionInput): Promise<AiCompletionResult> {
    const compiled = await this.promptService.compilePrompt(
      input.promptKey,
      input.variables
    );

    const messages: AiMessage[] = [];

    // Add system prompt if provided
    if (input.systemPrompt) {
      messages.push({ role: "system", content: input.systemPrompt });
    }

    // Add compiled prompt as user message
    messages.push({ role: "user", content: compiled.content });

    // Add additional user message if provided
    if (input.userMessage) {
      messages.push({ role: "user", content: input.userMessage });
    }

    const provider = this.getProvider();

    return provider.complete({
      model: input.overrideModel ?? compiled.model ?? undefined,
      temperature: input.overrideTemperature,
      maxTokens: input.overrideMaxTokens ?? compiled.maxTokens,
      messages,
    });
  }

  /**
   * Execute a raw completion without using prompts
   */
  async rawComplete(
    messages: AiMessage[],
    options?: {
      model?: string;
      temperature?: number;
      maxTokens?: number;
      provider?: AiProviderType;
    }
  ): Promise<AiCompletionResult> {
    const provider = this.getProvider(options?.provider);

    return provider.complete({
      model: options?.model,
      temperature: options?.temperature ?? 0.7,
      maxTokens: options?.maxTokens ?? 1000,
      messages,
    });
  }

  // =========================================
  // Business Methods
  // =========================================

  /**
   * Summarize a medical visit
   */
  async summarizeVisit(input: VisitSummaryInput): Promise<string> {
    const result = await this.complete({
      promptKey: "visit-summary",
      variables: {
        visitData: input.visitData,
      },
    });

    return result.content;
  }

  /**
   * Generate a diagnosis suggestion based on symptoms
   */
  async suggestDiagnosis(symptoms: string): Promise<string> {
    const result = await this.complete({
      promptKey: "diagnosis-suggestion",
      variables: { symptoms },
    });

    return result.content;
  }

  /**
   * Generate prescription recommendations
   */
  async suggestPrescription(
    diagnosis: string,
    patientInfo?: string
  ): Promise<string> {
    const result = await this.complete({
      promptKey: "prescription-suggestion",
      variables: {
        diagnosis,
        patientInfo: patientInfo ?? "Информация о пациенте не предоставлена",
      },
    });

    return result.content;
  }

  /**
   * Translate medical text
   */
  async translateMedicalText(
    text: string,
    fromLang: string,
    toLang: string
  ): Promise<string> {
    const result = await this.complete({
      promptKey: "medical-translation",
      variables: { text, fromLang, toLang },
    });

    return result.content;
  }

  /**
   * Generate a patient-friendly explanation
   */
  async explainToPatient(medicalText: string): Promise<string> {
    const result = await this.complete({
      promptKey: "patient-explanation",
      variables: { medicalText },
    });

    return result.content;
  }
}
