export interface ProtocolTemplate {
  id: string;
  name: string;
  description: string;
  content: string; // JSON содержимое из Lexical Editor
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  createdBy?: string;
  updatedBy?: string;
}

export interface CreateProtocolTemplateDto {
  name: string;
  description: string;
  content: string;
}

export interface UpdateProtocolTemplateDto {
  name?: string;
  description?: string;
  content?: string;
  isActive?: boolean;
}

export interface ProtocolTemplateFilters {
  search?: string;
  isActive?: boolean;
  page?: number;
  limit?: number;
}

export interface PaginatedProtocolTemplateResponse {
  success: boolean;
  data: ProtocolTemplate[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

// Типы для кастомных элементов в редакторе
export interface CustomElement {
  type: 'text' | 'select' | 'radio' | 'checkbox' | 'textarea';
  id: string;
  label?: string;
  placeholder?: string;
  required?: boolean;
  options?: Array<{
    value: string;
    label: string;
  }>;
  defaultValue?: string | boolean | string[];
}