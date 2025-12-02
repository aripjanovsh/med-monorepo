import { Injectable, Logger, NotFoundException } from "@nestjs/common";
import type { Prisma } from "@prisma/client";
import { PrismaService } from "@/common/prisma/prisma.service";
import { plainToInstance } from "class-transformer";
import {
  type CreatePromptDto,
  type UpdatePromptDto,
  PromptResponseDto,
} from "./dto/prompt.dto";
import { DEFAULT_PROMPTS } from "./default-prompts";

export type CompiledPrompt = {
  key: string;
  content: string;
  model: string | null;
  temperature: number;
  maxTokens: number;
};

@Injectable()
export class PromptService {
  readonly #logger = new Logger(PromptService.name);

  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreatePromptDto): Promise<PromptResponseDto> {
    const prompt = await this.prisma.aiPrompt.create({
      data: {
        key: dto.key,
        name: dto.name,
        description: dto.description,
        template: dto.template,
        category: dto.category,
        model: dto.model,
        temperature: dto.temperature,
        maxTokens: dto.maxTokens,
        metadata: dto.metadata as Prisma.InputJsonValue,
        isActive: dto.isActive ?? true,
      },
    });

    return plainToInstance(PromptResponseDto, prompt);
  }

  async findByKey(key: string): Promise<PromptResponseDto | null> {
    const prompt = await this.prisma.aiPrompt.findUnique({
      where: { key },
    });

    if (!prompt) {
      return null;
    }

    return plainToInstance(PromptResponseDto, prompt);
  }

  async findByKeyOrThrow(key: string): Promise<PromptResponseDto> {
    const prompt = await this.findByKey(key);

    if (!prompt) {
      throw new NotFoundException(`Prompt with key "${key}" not found`);
    }

    return prompt;
  }

  async findAll(category?: string): Promise<PromptResponseDto[]> {
    const prompts = await this.prisma.aiPrompt.findMany({
      where: {
        isActive: true,
        ...(category ? { category } : {}),
      },
      orderBy: { name: "asc" },
    });

    return prompts.map((p) => plainToInstance(PromptResponseDto, p));
  }

  async update(key: string, dto: UpdatePromptDto): Promise<PromptResponseDto> {
    const existing = await this.prisma.aiPrompt.findUnique({
      where: { key },
    });

    if (!existing) {
      throw new NotFoundException(`Prompt with key "${key}" not found`);
    }

    const updated = await this.prisma.aiPrompt.update({
      where: { key },
      data: {
        name: dto.name,
        description: dto.description,
        template: dto.template,
        category: dto.category,
        model: dto.model,
        temperature: dto.temperature,
        maxTokens: dto.maxTokens,
        metadata: dto.metadata as Prisma.InputJsonValue,
        isActive: dto.isActive,
      },
    });

    return plainToInstance(PromptResponseDto, updated);
  }

  async delete(key: string): Promise<void> {
    await this.prisma.aiPrompt.delete({
      where: { key },
    });
  }

  /**
   * Compile a prompt template with variables
   */
  async compilePrompt(
    key: string,
    variables: Record<string, string> = {}
  ): Promise<CompiledPrompt> {
    const prompt = await this.findByKeyOrThrow(key);

    let content = prompt.template;

    // Replace {{variable}} placeholders with actual values
    for (const [varKey, value] of Object.entries(variables)) {
      const regex = new RegExp(`\\{\\{\\s*${varKey}\\s*\\}\\}`, "g");
      content = content.replace(regex, value);
    }

    // Increment usage count
    await this.incrementUsedCount(key);

    return {
      key,
      content,
      model: prompt.model,
      temperature: prompt.temperature ?? 0.7,
      maxTokens: prompt.maxTokens ?? 1000,
    };
  }

  async incrementUsedCount(key: string): Promise<void> {
    await this.prisma.aiPrompt.update({
      where: { key },
      data: {
        usedCount: { increment: 1 },
      },
    });
  }

  async incrementLikeCount(key: string): Promise<void> {
    await this.prisma.aiPrompt.update({
      where: { key },
      data: {
        likeCount: { increment: 1 },
      },
    });
  }

  async incrementDislikeCount(key: string): Promise<void> {
    await this.prisma.aiPrompt.update({
      where: { key },
      data: {
        dislikeCount: { increment: 1 },
      },
    });
  }

  /**
   * Ensure a prompt exists, create it if it doesn't
   */
  async ensurePrompt(dto: CreatePromptDto): Promise<PromptResponseDto> {
    const existing = await this.findByKey(dto.key);

    if (existing) {
      return existing;
    }

    return this.create(dto);
  }

  /**
   * Seed default prompts into the database
   * Call this on application startup to ensure all required prompts exist
   */
  async seedDefaultPrompts(): Promise<void> {
    this.#logger.log("Seeding default prompts...");

    for (const prompt of DEFAULT_PROMPTS) {
      try {
        await this.ensurePrompt(prompt);
        this.#logger.debug(`Prompt "${prompt.key}" ensured`);
      } catch (error) {
        this.#logger.error(`Failed to seed prompt "${prompt.key}": ${error}`);
      }
    }

    this.#logger.log(
      `Default prompts seeded (${DEFAULT_PROMPTS.length} prompts)`
    );
  }
}
