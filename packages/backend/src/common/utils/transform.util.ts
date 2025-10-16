import { plainToInstance, Transform } from "class-transformer";
import { PaginatedResponseDto, PaginationMetaDto } from "../dto/pagination.dto";

export function transformToDto<T, V>(
  cls: new (...args: any[]) => T,
  obj: V | V[],
): T | T[] {
  return plainToInstance(cls, obj);
}

export function createPaginatedResponse<T>(
  data: any[],
  page: number,
  limit: number,
  total: number,
  dtoClass: new (...args: any[]) => T,
): PaginatedResponseDto<T> {
  const transformedData = transformToDto(dtoClass, data) as T[];
  const meta = new PaginationMetaDto(page, limit, total);
  return new PaginatedResponseDto(transformedData, meta);
}

export const Decimal = () =>
  Transform(({ value }) => (value ? Number(value) : null));
