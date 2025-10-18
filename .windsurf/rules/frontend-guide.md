---
trigger: model_decision
description: Frontend architecture patterns for Next.js features
---

## Feature Structure

```
features/[feature]/
├── components/
│   ├── [feature]-columns.tsx    # Table columns
│   ├── [feature]-form.tsx       # Form logic
│   ├── page-[feature]-form.tsx  # Page wrapper
│   └── detail/                  # Detail components
├── [feature].api.ts             # RTK Query
├── [feature].dto.ts             # API types
├── [feature].constants.ts       # Constants/enums
├── [feature].schema.ts          # Yup validation
├── [feature].model.ts           # Utilities
└── index.ts                     # Public exports
```

**Rules**: Singular naming (`employee` not `employees`), prefix files with feature name, named exports only.

---

## API (`*.api.ts`)

```typescript
export const featureApi = rootApi.injectEndpoints({
  endpoints: (builder) => ({
    getItems: builder.query<ItemsListDto, QueryDto>({
      query: (params) => ({ url: "/api/v1/items", params }),
      providesTags: [API_TAG],
    }),
    getItem: builder.query<ItemDto, string>({
      query: (id) => ({ url: `/api/v1/items/${id}` }),
      providesTags: (r, e, id) => [{ type: API_TAG, id }],
    }),
    createItem: builder.mutation<ItemDto, CreateDto>({
      query: (data) => ({ url: "/api/v1/items", method: "POST", body: data }),
      invalidatesTags: [API_TAG],
    }),
    updateItem: builder.mutation<ItemDto, UpdateDto>({
      query: ({ id, ...data }) => ({
        url: `/api/v1/items/${id}`,
        method: "PATCH",
        body: data,
      }),
      invalidatesTags: (r, e, { id }) => [{ type: API_TAG, id }, API_TAG],
    }),
    deleteItem: builder.mutation<void, string>({
      query: (id) => ({ url: `/api/v1/items/${id}`, method: "DELETE" }),
      invalidatesTags: (r, e, id) => [{ type: API_TAG, id }, API_TAG],
    }),
  }),
});

export const {
  useGetItemsQuery,
  useGetItemQuery,
  useCreateItemMutation,
  useUpdateItemMutation,
  useDeleteItemMutation,
} = featureApi;
```

**Must**: providesTags for queries, invalidatesTags for mutations.

---

## DTOs (`*.dto.ts`)

```typescript
import type { PaginatedResponseDto, QueryParamsDto } from "@/types/api.types";

export interface ItemResponseDto {
  id: string;
  name: string;
  status: "ACTIVE" | "INACTIVE";
  createdAt: string; // ISO
  updatedAt: string;
  category?: any; // CategoryResponseDto
}

export interface CreateItemRequestDto {
  name: string;
  status?: "ACTIVE" | "INACTIVE";
  categoryId?: string;
}

export interface UpdateItemRequestDto extends Partial<CreateItemRequestDto> {
  id: string;
}

export type ItemsListResponseDto = PaginatedResponseDto<ItemResponseDto>;
```

**Must**: Use `Dto` suffix, ISO strings for dates, match backend exactly.

---

## Constants (`*.constants.ts`)

```typescript
export const STATUS_OPTIONS = [
  { value: "ACTIVE", label: "Активен" },
  { value: "INACTIVE", label: "Неактивен" },
] as const;

export const STATUS = {
  ACTIVE: "ACTIVE",
  INACTIVE: "INACTIVE",
} as const;

export type Status = (typeof STATUS)[keyof typeof STATUS];
```

**Must**: Use `as const`, UPPER_CASE for constants.

---

## Schemas (`*.schema.ts`)

```typescript
import * as yup from "yup";

export const itemFormSchema = yup.object({
  name: yup.string().min(2).required(),
  status: yup.string().oneOf(Object.values(STATUS)),
  createRelated: yup.boolean().default(false), // UI-only
});

export const createItemRequestSchema = yup.object({
  name: yup.string().required(),
  status: yup.string().oneOf(Object.values(STATUS)).default("ACTIVE"),
});

export const updateItemRequestSchema = createItemRequestSchema.partial().shape({
  id: yup.string().required(),
});

export type ItemFormData = yup.InferType<typeof itemFormSchema>;
```

**Must**: Separate form/API schemas, use `yup.InferType<>`.

---

## Model (`*.model.ts`)

```typescript
export const getItemDisplayName = (item: ItemResponseDto): string => {
  return item.name.toUpperCase();
};

export const isItemActive = (item: ItemResponseDto): boolean => {
  return item.status === "ACTIVE";
};
```

**Must**: Pure functions only.

---

## Index (`index.ts`)

```typescript
export type { ItemResponseDto, CreateItemRequestDto } from "./item.dto";
export type { ItemFormData } from "./item.schema";
export { itemFormSchema } from "./item.schema";
export { STATUS_OPTIONS, STATUS } from "./item.constants";
export { getItemDisplayName, isItemActive } from "./item.model";
export { useGetItemsQuery, useCreateItemMutation } from "./item.api";
export { ItemForm } from "./components/item-form";
```

**Must**: `export type` for types, **NEVER** `export *`, group by category.

---

## Pages

### List (`app/cabinet/[feature]/page.tsx`)

```typescript
"use client";
import { useState } from "react";
import { useDebounce } from "@/hooks/use-debounce";

export default function ItemsPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const debouncedSearch = useDebounce(searchTerm, 300);

  const { data, isLoading, error, refetch } = useGetItemsQuery({
    search: debouncedSearch, page: 1, limit: 10,
  });

  const [deleteItem] = useDeleteItemMutation();

  const handleDelete = async (item: ItemDto) => {
    if (!confirm("Удалить?")) return;
    try {
      await deleteItem(item.id).unwrap();
      toast.success("Удалено!");
      refetch();
    } catch (error: any) {
      toast.error(error?.data?.message ?? "Ошибка");
    }
  };

  if (isLoading) return <LoadingState />;
  if (error) return <ErrorState onRetry={refetch} />;

  return (
    <div className="space-y-6">
      <Input value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
      <DataTable columns={createItemColumns(handleEdit, handleView, handleDelete)} data={data?.data ?? []} />
    </div>
  );
}
```

### Detail (`app/cabinet/[feature]/[id]/page.tsx`)

```typescript
"use client";
import { use } from "react";

export default function ItemDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { data: item, isLoading } = useGetItemQuery(id, { skip: !id });

  if (isLoading) return <LoadingState />;
  if (!item) return <NotFoundState />;

  return (
    <div className="space-y-6">
      <LayoutHeader backHref="/cabinet/items" />
      <Tabs>
        <TabsContent value="overview"><ItemOverview item={item} /></TabsContent>
      </Tabs>
    </div>
  );
}
```

### Create/Edit

```typescript
// create/page.tsx
export default function CreateItemPage() {
  return (
    <div className="space-y-6">
      <LayoutHeader backHref="/cabinet/items" />
      <PageItemForm mode="create" />
    </div>
  );
}

// [id]/edit/page.tsx
export default function EditItemPage({ params }: { params: Promise<{ id: string }> }) {
  return <PageItemForm mode="edit" itemId={use(params).id} />;
}
```

---

## Components

### Columns

```typescript
export const createItemColumns = (
  onEdit?: (item: ItemDto) => void,
  onView?: (item: ItemDto) => void,
  onDelete?: (item: ItemDto) => void
): ColumnDef<ItemDto>[] => [
  { id: "select", header: ({ table }) => <Checkbox />, cell: ({ row }) => <Checkbox /> },
  { accessorKey: "name", header: "ИМЯ", cell: ({ row }) => <button onClick={() => onView?.(row.original)}>{row.original.name}</button> },
  { id: "actions", cell: ({ row }) => <DropdownMenu><DropdownMenuItem onClick={() => onEdit?.(row.original)}>Edit</DropdownMenuItem></DropdownMenu> },
];
```

### Form

```typescript
"use client";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";

type ItemFormProps = { mode: "create" | "edit"; initialData?: ItemFormData; onSuccess?: () => void };

export const ItemForm = ({ mode, initialData, onSuccess }: ItemFormProps) => {
  const [createItem] = useCreateItemMutation();
  const [updateItem] = useUpdateItemMutation();

  const form = useForm<ItemFormData>({
    resolver: yupResolver(itemFormSchema),
    defaultValues: initialData ?? { name: "" },
  });

  const onSubmit = async (data: ItemFormData) => {
    try {
      mode === "create"
        ? await createItem(data).unwrap()
        : await updateItem({ id: initialData!.id, ...data }).unwrap();
      toast.success("Сохранено!");
      onSuccess?.();
    } catch (error: any) {
      toast.error(error?.data?.message ?? "Ошибка");
    }
  };

  return <Form {...form}><form onSubmit={form.handleSubmit(onSubmit)}><FormField control={form.control} name="name" render={({ field }) => <FormItem><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>} /><Button type="submit">Сохранить</Button></form></Form>;
};
```

---

## Code Quality

**DRY**: Extract repeated logic to model utilities.

**Early Returns**:

```typescript
if (!item) return <Empty />;
if (item.status !== "ACTIVE") return <Inactive />;
return <Active />;
```

**Meaningful Names**:

```typescript
const currentDate = new Date(); // Not: const d
const activeItems = items.filter((item) => item.status === "ACTIVE"); // Not: const e
```

**No Magic Numbers**:

```typescript
const DEBOUNCE_DELAY_MS = 300;
setTimeout(() => refetch(), DEBOUNCE_DELAY_MS);
```

**Error Handling**:

```typescript
try {
  await createItem(data).unwrap();
  toast.success("OK!");
} catch (error: any) {
  const msg = error?.data?.message || error?.message || "Error";
  toast.error(msg);
}
```

---

## TypeScript

```typescript
// ✅ Named exports only
export const Component = () => {};

// ✅ Type props
type Props = { children: ReactNode; onClick: () => void; disabled?: boolean };

// ✅ Destructure with defaults
export const Button = ({ children, onClick, disabled = false }: Props) => {};

// ✅ Explicit returns
const calc = (nums: number[]): number => nums.reduce((a, b) => a + b, 0);

// ✅ Null coalescing
const name = item.name ?? "Unknown";

// ✅ Type guards
const getError = (e: unknown): string => {
  if (e instanceof Error) return e.message;
  if (typeof e === "object" && e && "message" in e) return String(e.message);
  return "Unknown";
};
```

---

## Imports

```typescript
// ✅ From feature index
import { useGetItemsQuery, STATUS } from "@/features/items";

// ❌ Don't import internal
import { ItemDto } from "@/features/items/item.dto";

// ✅ Group: React → Next → UI → Features
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { useGetItemsQuery } from "@/features/items";
```

---

## Performance

```typescript
const debounced = useDebounce(search, 300);
const filtered = useMemo(() => items.filter(i => i.active).sort(), [items]);
const handleDel = useCallback((id: string) => del(id), [del]);
export const Card = memo(({ item }: Props) => <div>{item.name}</div>);
```

---

## Checklist

**Feature**: [ ] api/dto/constants/schema/model/index files, [ ] Named exports, [ ] Singular naming
**API**: [ ] providesTags/invalidatesTags, [ ] Export hooks
**Types**: [ ] DTOs match backend, [ ] Separate form/API schemas, [ ] No `any`
**Components**: [ ] Loading/error states, [ ] `"use client"`, [ ] Type props
**Quality**: [ ] DRY, [ ] No magic numbers, [ ] Early returns, [ ] Meaningful names
