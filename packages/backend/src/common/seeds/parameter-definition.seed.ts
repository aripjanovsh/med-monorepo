import { PrismaClient, ParameterType } from "@prisma/client";

/**
 * Default parameter definitions to seed initially.
 * After seeding, these should be managed via the ParameterDefinition CRUD API.
 */
const DEFAULT_PARAMETER_DEFINITIONS: Array<{
  code: string;
  name: string;
  unit?: string;
  valueType: string;
  comment?: string;
  category: string;
}> = [
  { code: 'PULSE', name: 'Пульс', unit: 'bpm', valueType: 'NUMBER', comment: 'Основной показатель', category: 'VITALS_CORE' },
  { code: 'BP_SYS', name: 'Артериальное давление (систолическое)', unit: 'mmHg', valueType: 'NUMBER', comment: 'Верхнее значение', category: 'VITALS_CORE' },
  { code: 'BP_DIA', name: 'Артериальное давление (диастолическое)', unit: 'mmHg', valueType: 'NUMBER', comment: 'Нижнее значение', category: 'VITALS_CORE' },
  { code: 'TEMP', name: 'Температура тела', unit: '°C', valueType: 'NUMBER', comment: 'Подмышечная / оральная', category: 'VITALS_CORE' },
  { code: 'RESP_RATE', name: 'Частота дыхания', unit: 'breaths/min', valueType: 'NUMBER', comment: 'дыхательных движений', category: 'VITALS_CORE' },
  { code: 'SPO2', name: 'Сатурация кислорода', unit: '%', valueType: 'NUMBER', comment: 'измеряется пульсоксиметром', category: 'VITALS_CORE' },
  { code: 'HEIGHT', name: 'Рост', unit: 'cm', valueType: 'NUMBER', comment: 'вводится вручную', category: 'ANTHROPOMETRY' },
  { code: 'WEIGHT', name: 'Вес', unit: 'kg', valueType: 'NUMBER', category: 'ANTHROPOMETRY' },
  { code: 'BMI', name: 'Индекс массы тела', unit: 'kg/m²', valueType: 'NUMBER', comment: 'вычисляется автоматически', category: 'ANTHROPOMETRY' },
  { code: 'BODY_SURFACE_AREA', name: 'Площадь поверхности тела', unit: 'm²', valueType: 'NUMBER', comment: 'по формуле Mosteller', category: 'ANTHROPOMETRY' },
  { code: 'WAIST_CIRC', name: 'Окружность талии', unit: 'cm', valueType: 'NUMBER', comment: 'при эндокринологических осмотрах', category: 'ANTHROPOMETRY' },
  { code: 'HIP_CIRC', name: 'Окружность бедер', unit: 'cm', valueType: 'NUMBER', comment: 'для расчёта WHR', category: 'ANTHROPOMETRY' },
  { code: 'WHR', name: 'Отношение талии к бедрам', valueType: 'NUMBER', comment: 'вычисляется', category: 'ANTHROPOMETRY' },
];

export class ParameterDefinitionSeed {
  constructor(private readonly prisma: PrismaClient) {}

  async seedParameterDefinitions(organizationId: string) {
    console.log("📊 Seeding parameter definitions...");

    const existing = await this.prisma.parameterDefinition.findMany({
      where: { organizationId },
      select: { code: true },
    });

    const existingCodes = new Set(existing.map((p) => p.code));

    const newDefinitions = DEFAULT_PARAMETER_DEFINITIONS.filter(
      (def) => !existingCodes.has(def.code)
    ).map((def) => ({
      code: def.code,
      name: def.name,
      category: def.category,
      valueType: def.valueType as ParameterType,
      defaultUnit: def.unit ?? null,
      description: def.comment ?? null,
      normalRange: null,
      isActive: true,
      organizationId,
    }));

    if (newDefinitions.length > 0) {
      await this.prisma.parameterDefinition.createMany({
        data: newDefinitions,
        skipDuplicates: true,
      });
      console.log(`✅ Created ${newDefinitions.length} parameter definitions`);
    } else {
      console.log("ℹ️  All parameter definitions already exist");
    }

    return { count: newDefinitions.length };
  }
}
