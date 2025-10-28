export type ParameterValueType = 'NUMBER' | 'TEXT' | 'BOOLEAN';

export type ParameterDefinition = {
  id: string;
  code: string;
  name: string;
  category: string;
  valueType: ParameterValueType;
  defaultUnit?: string;
  normalRange?: unknown;
  description?: string;
  isActive: boolean;
  organizationId: string;
  createdAt: string;
  updatedAt: string;
};

export type CreateParameterDefinitionRequest = {
  code: string;
  name: string;
  category: string;
  valueType: ParameterValueType;
  defaultUnit?: string;
  normalRange?: unknown;
  description?: string;
  isActive?: boolean;
};

export type UpdateParameterDefinitionRequest = Partial<CreateParameterDefinitionRequest>;
