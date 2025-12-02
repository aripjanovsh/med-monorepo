export type AiMessage = {
  role: "system" | "user" | "assistant";
  content: string;
};

export type AiCompletionOptions = {
  model?: string;
  temperature?: number;
  maxTokens?: number;
  messages: AiMessage[];
};

export type AiCompletionResult = {
  content: string;
  model: string;
  usage?: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
  finishReason?: string;
};

export type AiProviderType = "openai" | "deepseek" | "claude";

export const AI_PROVIDER_TOKEN = "AI_PROVIDER";

export interface AiProvider {
  readonly providerType: AiProviderType;

  /**
   * Generate a completion from the AI model
   */
  complete(options: AiCompletionOptions): Promise<AiCompletionResult>;

  /**
   * Check if the provider is configured and ready to use
   */
  isAvailable(): boolean;
}
