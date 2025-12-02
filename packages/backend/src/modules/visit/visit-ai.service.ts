import { Injectable, Logger } from "@nestjs/common";
import type { Decimal } from "@prisma/client/runtime/library";
import { PrismaService } from "@/common/prisma/prisma.service";
import { AiService } from "@/modules/ai/ai.service";
import { format } from "date-fns";
import { ru } from "date-fns/locale";

type VisitWithRelations = {
  id: string;
  visitDate: Date;
  notes: string | null;
  protocolData: string | null;
  patient: {
    id: string;
    firstName: string;
    middleName: string | null;
    lastName: string;
    dateOfBirth: Date;
    gender: string;
  };
  employee: {
    id: string;
    firstName: string;
    middleName: string | null;
    lastName: string;
    title?: { name: string } | null;
  };
  prescriptions: Array<{
    name: string;
    dosage: string | null;
    frequency: string | null;
    duration: string | null;
    notes: string | null;
  }>;
  serviceOrders: Array<{
    id: string;
    status: string;
    resultText: string | null;
    service: {
      name: string;
      type: string;
    };
  }>;
  patientParameters: Array<{
    parameterCode: string;
    valueNumeric: Decimal | null;
    valueText: string | null;
    unit: string | null;
  }>;
  allergies: Array<{
    substance: string;
    reaction: string | null;
    severity: string | null;
  }>;
};

@Injectable()
export class VisitAiService {
  readonly #logger = new Logger(VisitAiService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly aiService: AiService
  ) {}

  /**
   * Generate AI summary for a completed visit
   */
  async generateVisitSummary(visitId: string): Promise<string | null> {
    try {
      const visit = await this.getVisitWithAllData(visitId);

      if (!visit) {
        this.#logger.warn(`Visit ${visitId} not found for AI summary`);
        return null;
      }

      const summaryInput = this.buildSummaryInput(visit);
      const summary = await this.aiService.summarizeVisit(summaryInput);

      // Save the summary to the visit
      await this.prisma.visit.update({
        where: { id: visitId },
        data: {
          aiSummary: summary,
          aiSummaryGeneratedAt: new Date(),
        },
      });

      this.#logger.log(`AI summary generated and saved for visit ${visitId}`);
      return summary;
    } catch (error) {
      this.#logger.error(
        `Failed to generate AI summary for visit ${visitId}: ${error}`
      );
      return null;
    }
  }

  /**
   * Regenerate AI summary for a visit
   */
  async regenerateVisitSummary(visitId: string): Promise<string | null> {
    return this.generateVisitSummary(visitId);
  }

  /**
   * Get visit with all related data needed for AI summary
   */
  private async getVisitWithAllData(
    visitId: string
  ): Promise<VisitWithRelations | null> {
    return this.prisma.visit.findUnique({
      where: { id: visitId },
      include: {
        patient: {
          select: {
            id: true,
            firstName: true,
            middleName: true,
            lastName: true,
            dateOfBirth: true,
            gender: true,
          },
        },
        employee: {
          select: {
            id: true,
            firstName: true,
            middleName: true,
            lastName: true,
            title: { select: { name: true } },
          },
        },
        prescriptions: {
          select: {
            name: true,
            dosage: true,
            frequency: true,
            duration: true,
            notes: true,
          },
        },
        serviceOrders: {
          select: {
            id: true,
            status: true,
            resultText: true,
            service: {
              select: {
                name: true,
                type: true,
              },
            },
          },
        },
        patientParameters: {
          select: {
            parameterCode: true,
            valueNumeric: true,
            valueText: true,
            unit: true,
          },
        },
        allergies: {
          select: {
            substance: true,
            reaction: true,
            severity: true,
          },
        },
      },
    });
  }

  /**
   * Build input for AI summarization from visit data
   */
  private buildSummaryInput(visit: VisitWithRelations) {
    // Build full visit data text
    const visitData = this.buildVisitDataText(visit);

    return {
      visitData,
    };
  }

  /**
   * Build full text representation of visit data
   */
  private buildVisitDataText(visit: VisitWithRelations): string {
    const sections: string[] = [];

    // Protocol data (main visit content)
    const protocolText = this.buildProtocolText(visit.protocolData);
    if (protocolText) {
      sections.push(protocolText);
    }

    // Prescriptions
    const prescriptions = this.formatPrescriptions(visit.prescriptions);
    if (prescriptions) {
      sections.push(`--- Назначенные препараты ---\n${prescriptions}`);
    }

    // Service orders (analyses, procedures)
    const serviceOrders = this.formatServiceOrders(visit.serviceOrders);
    if (serviceOrders) {
      sections.push(`--- Направления на исследования ---\n${serviceOrders}`);
    }

    // Patient parameters (vitals)
    const parameters = this.formatParameters(visit.patientParameters);
    if (parameters) {
      sections.push(`--- Показатели пациента ---\n${parameters}`);
    }

    // Allergies
    const allergies = this.formatAllergies(visit.allergies);
    if (allergies) {
      sections.push(`--- Аллергии ---\n${allergies}`);
    }

    // Notes
    if (visit.notes) {
      sections.push(`--- Заметки врача ---\n${visit.notes}`);
    }

    return sections.join("\n\n") || "Данные визита отсутствуют";
  }

  /**
   * Build text from protocol data
   */
  private buildProtocolText(protocolData: string | null): string | null {
    if (!protocolData) return null;

    try {
      const data = JSON.parse(protocolData);

      // Handle template-based structure
      if (data.templateContent && data.filledData) {
        return this.buildTemplateProtocolText(data);
      }

      // Fallback for simple JSON - just stringify nicely
      return this.formatJsonAsText(data);
    } catch {
      // Return raw text if not JSON
      return protocolData;
    }
  }

  /**
   * Build text from template-based protocol
   */
  private buildTemplateProtocolText(data: {
    templateName: string;
    templateContent: string;
    filledData: Record<string, unknown>;
  }): string | null {
    try {
      const template = JSON.parse(data.templateContent);
      const filled = data.filledData;

      if (!template.sections || !Array.isArray(template.sections)) {
        return this.formatJsonAsText(filled);
      }

      const sections: string[] = [];

      // Add template name as header
      if (data.templateName) {
        sections.push(`Шаблон: ${data.templateName}`);
      }

      // Process each section
      for (const section of template.sections) {
        const sectionText = this.buildSectionText(section, filled);
        if (sectionText) {
          const title = section.title || section.id;
          sections.push(`--- ${title} ---\n${sectionText}`);
        }
      }

      return sections.length > 0 ? sections.join("\n\n") : null;
    } catch {
      return null;
    }
  }

  /**
   * Build text for a single protocol section
   */
  private buildSectionText(
    section: { fields?: Array<{ id: string; label?: string }> },
    filled: Record<string, unknown>
  ): string | null {
    if (!section.fields || !Array.isArray(section.fields)) {
      return null;
    }

    const lines: string[] = [];

    for (const field of section.fields) {
      const value = filled[field.id];
      if (value === undefined || value === null || value === "") {
        continue;
      }

      const label = field.label || field.id;
      const formattedValue = this.formatFieldValue(value);

      if (formattedValue) {
        lines.push(`${label}: ${formattedValue}`);
      }
    }

    return lines.length > 0 ? lines.join("\n") : null;
  }

  /**
   * Format any JSON object as readable text
   */
  private formatJsonAsText(obj: Record<string, unknown>): string {
    const lines: string[] = [];

    for (const [key, value] of Object.entries(obj)) {
      if (value === undefined || value === null || value === "") continue;
      const formatted = this.formatFieldValue(value);
      if (formatted) {
        lines.push(`${key}: ${formatted}`);
      }
    }

    return lines.join("\n");
  }

  private formatDoctorName(employee: VisitWithRelations["employee"]): string {
    const parts = [employee.lastName, employee.firstName];
    if (employee.middleName) {
      parts.push(employee.middleName);
    }
    const name = parts.join(" ");
    return employee.title ? `${employee.title.name} ${name}` : name;
  }

  private formatFieldValue(value: unknown): string | null {
    if (value === undefined || value === null || value === "") {
      return null;
    }

    if (typeof value === "boolean") {
      return value ? "Да" : "Нет";
    }

    if (Array.isArray(value)) {
      const filtered = value.filter((v) => v !== null && v !== "");
      return filtered.length > 0 ? filtered.join(", ") : null;
    }

    if (typeof value === "object") {
      return JSON.stringify(value);
    }

    return String(value);
  }

  private formatPrescriptions(
    prescriptions: VisitWithRelations["prescriptions"]
  ): string | null {
    if (!prescriptions.length) return null;

    return prescriptions
      .map((p) => {
        const parts = [p.name];
        if (p.dosage) parts.push(`дозировка: ${p.dosage}`);
        if (p.frequency) parts.push(`приём: ${p.frequency}`);
        if (p.duration) parts.push(`курс: ${p.duration}`);
        if (p.notes) parts.push(`(${p.notes})`);
        return `- ${parts.join(", ")}`;
      })
      .join("\n");
  }

  private formatServiceOrders(
    serviceOrders: VisitWithRelations["serviceOrders"]
  ): string | null {
    if (!serviceOrders.length) return null;

    const ordered = serviceOrders.filter((so) => so.status !== "CANCELLED");
    if (!ordered.length) return null;

    return ordered
      .map((so) => {
        const status = so.status === "COMPLETED" ? "(выполнено)" : "(ожидание)";
        const result = so.resultText ? ` - ${so.resultText}` : "";
        return `- ${so.service.name} ${status}${result}`;
      })
      .join("\n");
  }

  private formatParameters(
    parameters: VisitWithRelations["patientParameters"]
  ): string | null {
    if (!parameters.length) return null;

    return parameters
      .map((p) => {
        const value = p.valueNumeric ?? p.valueText ?? "-";
        const unit = p.unit ? ` ${p.unit}` : "";
        return `- ${p.parameterCode}: ${value}${unit}`;
      })
      .join("\n");
  }

  private formatAllergies(
    allergies: VisitWithRelations["allergies"]
  ): string | null {
    if (!allergies.length) return null;

    return allergies
      .map((a) => {
        const parts = [a.substance];
        if (a.reaction) parts.push(`реакция: ${a.reaction}`);
        if (a.severity) parts.push(`тяжесть: ${a.severity}`);
        return `- ${parts.join(", ")}`;
      })
      .join("\n");
  }
}
