# DataTable - Примеры использования

## 1. Простая таблица с Client-Side сортировкой

```tsx
"use client";

import { DataTable } from "@/components/data-table";
import type { ColumnDef } from "@tanstack/react-table";

type Product = {
  id: string;
  name: string;
  price: number;
  category: string;
};

const columns: ColumnDef<Product>[] = [
  {
    accessorKey: "name",
    header: "Product Name",
  },
  {
    accessorKey: "price",
    header: "Price",
    cell: ({ row }) => {
      const price = row.getValue("price") as number;
      return `${price.toLocaleString()} сум`;
    },
  },
  {
    accessorKey: "category",
    header: "Category",
  },
];

export function ProductsTable({ products }: { products: Product[] }) {
  return (
    <DataTable
      columns={columns}
      data={products}
      enableSorting
    />
  );
}
```

## 2. Таблица с Toolbar и Filters

```tsx
"use client";

import { DataTable, DataTableToolbar } from "@/components/data-table";
import type { ColumnDef } from "@tanstack/react-table";
import { Badge } from "@/components/ui/badge";

type Invoice = {
  id: string;
  invoiceNumber: string;
  patientName: string;
  amount: number;
  status: "PAID" | "UNPAID" | "REFUNDED";
  createdAt: Date;
};

const columns: ColumnDef<Invoice>[] = [
  {
    accessorKey: "invoiceNumber",
    header: "Номер счета",
  },
  {
    accessorKey: "patientName",
    header: "Пациент",
  },
  {
    accessorKey: "amount",
    header: "Сумма",
    cell: ({ row }) => {
      const amount = row.getValue("amount") as number;
      return `${amount.toLocaleString()} сум`;
    },
  },
  {
    accessorKey: "status",
    header: "Статус",
    cell: ({ row }) => {
      const status = row.getValue("status") as string;
      const variant = {
        PAID: "default",
        UNPAID: "secondary",
        REFUNDED: "destructive",
      }[status] as "default" | "secondary" | "destructive";
      
      return <Badge variant={variant}>{status}</Badge>;
    },
  },
];

export function InvoicesTable({ invoices }: { invoices: Invoice[] }) {
  return (
    <DataTable
      columns={columns}
      data={invoices}
      enableSorting
      enableFiltering
      toolbar={(table) => (
        <DataTableToolbar
          table={table}
          searchKey="patientName"
          searchPlaceholder="Поиск по пациенту..."
          filters={[
            {
              column: "status",
              title: "Статус",
              options: [
                { label: "Оплачен", value: "PAID" },
                { label: "Не оплачен", value: "UNPAID" },
                { label: "Возврат", value: "REFUNDED" },
              ],
            },
          ]}
        />
      )}
    />
  );
}
```

## 3. Server-Side таблица с Pagination

```tsx
"use client";

import { useState } from "react";
import { DataTable } from "@/components/data-table";
import type { ColumnDef } from "@tanstack/react-table";
import { useGetPatientsQuery } from "@/features/patients";
import { Skeleton } from "@/components/ui/skeleton";

type Patient = {
  id: string;
  firstName: string;
  lastName: string;
  dateOfBirth: Date;
  phone: string;
};

const columns: ColumnDef<Patient>[] = [
  {
    accessorKey: "lastName",
    header: "Фамилия",
  },
  {
    accessorKey: "firstName",
    header: "Имя",
  },
  {
    accessorKey: "dateOfBirth",
    header: "Дата рождения",
    cell: ({ row }) => {
      const date = row.getValue("dateOfBirth") as Date;
      return new Date(date).toLocaleDateString("ru-RU");
    },
  },
  {
    accessorKey: "phone",
    header: "Телефон",
  },
];

export function PatientsTable() {
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [sort, setSort] = useState<string[]>(["lastName"]);

  const { data, isLoading } = useGetPatientsQuery({
    page,
    limit,
    sort,
  });

  return (
    <DataTable
      columns={columns}
      data={data?.items || []}
      isLoading={isLoading}
      pagination={{
        page,
        limit,
        total: data?.total || 0,
        onChangePage: setPage,
        onChangeLimit: setLimit,
      }}
      sort={{
        value: sort,
        onChange: setSort,
      }}
    />
  );
}
```

## 4. Таблица с Row Selection

```tsx
"use client";

import { useState } from "react";
import { DataTable } from "@/components/data-table";
import type { ColumnDef } from "@tanstack/react-table";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";

type Task = {
  id: string;
  title: string;
  status: string;
};

const columns: ColumnDef<Task>[] = [
  {
    id: "select",
    header: ({ table }) => (
      <Checkbox
        checked={
          table.getIsAllPageRowsSelected() ||
          (table.getIsSomePageRowsSelected() && "indeterminate")
        }
        onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
        aria-label="Select all"
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(value) => row.toggleSelected(!!value)}
        aria-label="Select row"
      />
    ),
    enableSorting: false,
    enableHiding: false,
  },
  {
    accessorKey: "title",
    header: "Task",
  },
  {
    accessorKey: "status",
    header: "Status",
  },
];

export function TasksTable({ tasks }: { tasks: Task[] }) {
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  const handleDelete = () => {
    console.log("Deleting tasks:", selectedIds);
    // Implement delete logic
  };

  return (
    <div className="space-y-4">
      {selectedIds.length > 0 && (
        <Button onClick={handleDelete} variant="destructive">
          <Trash2 />
          Delete {selectedIds.length} tasks
        </Button>
      )}
      
      <DataTable
        columns={columns}
        data={tasks}
        enableSorting
        selection={{
          enable: true,
          onChange: (selection) => {
            const ids = Object.keys(selection).filter((key) => selection[key]);
            setSelectedIds(ids);
          },
        }}
      />
    </div>
  );
}
```

## 5. Таблица с Row Actions

```tsx
"use client";

import { DataTable } from "@/components/data-table";
import type { ColumnDef } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MoreHorizontal, Pencil, Trash2, Eye } from "lucide-react";

type Employee = {
  id: string;
  firstName: string;
  lastName: string;
  position: string;
  email: string;
};

const createEmployeeColumns = (
  onEdit: (employee: Employee) => void,
  onView: (employee: Employee) => void,
  onDelete: (employee: Employee) => void
): ColumnDef<Employee>[] => [
  {
    accessorKey: "firstName",
    header: "Имя",
  },
  {
    accessorKey: "lastName",
    header: "Фамилия",
  },
  {
    accessorKey: "position",
    header: "Должность",
  },
  {
    accessorKey: "email",
    header: "Email",
  },
  {
    id: "actions",
    cell: ({ row }) => {
      const employee = row.original;

      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <span className="sr-only">Open menu</span>
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Действия</DropdownMenuLabel>
            <DropdownMenuItem onClick={() => onView(employee)}>
              <Eye className="mr-2 h-4 w-4" />
              Просмотр
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onEdit(employee)}>
              <Pencil className="mr-2 h-4 w-4" />
              Редактировать
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={() => onDelete(employee)}
              className="text-red-600"
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Удалить
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];

export function EmployeesTable({ employees }: { employees: Employee[] }) {
  const handleEdit = (employee: Employee) => {
    console.log("Edit:", employee);
  };

  const handleView = (employee: Employee) => {
    console.log("View:", employee);
  };

  const handleDelete = (employee: Employee) => {
    console.log("Delete:", employee);
  };

  const columns = createEmployeeColumns(handleEdit, handleView, handleDelete);

  return (
    <DataTable
      columns={columns}
      data={employees}
      enableSorting
    />
  );
}
```

## 6. Таблица с Custom Cell Formatting

```tsx
"use client";

import { DataTable } from "@/components/data-table";
import type { ColumnDef } from "@tanstack/react-table";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";

type User = {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  role: "admin" | "user" | "moderator";
  progress: number;
};

const columns: ColumnDef<User>[] = [
  {
    accessorKey: "name",
    header: "User",
    cell: ({ row }) => {
      const user = row.original;
      return (
        <div className="flex items-center gap-3">
          <Avatar className="h-8 w-8">
            <AvatarImage src={user.avatar} alt={user.name} />
            <AvatarFallback>{user.name[0]}</AvatarFallback>
          </Avatar>
          <div>
            <div className="font-medium">{user.name}</div>
            <div className="text-sm text-muted-foreground">{user.email}</div>
          </div>
        </div>
      );
    },
  },
  {
    accessorKey: "role",
    header: "Role",
    cell: ({ row }) => {
      const role = row.getValue("role") as string;
      const variant = {
        admin: "destructive",
        moderator: "default",
        user: "secondary",
      }[role] as "destructive" | "default" | "secondary";
      
      return <Badge variant={variant}>{role}</Badge>;
    },
  },
  {
    accessorKey: "progress",
    header: "Progress",
    cell: ({ row }) => {
      const progress = row.getValue("progress") as number;
      return (
        <div className="flex items-center gap-2">
          <Progress value={progress} className="w-[100px]" />
          <span className="text-sm text-muted-foreground">{progress}%</span>
        </div>
      );
    },
  },
];

export function UsersTable({ users }: { users: User[] }) {
  return (
    <DataTable
      columns={columns}
      data={users}
      enableSorting
    />
  );
}
```

## 7. Таблица с Row Click Handler

```tsx
"use client";

import { useRouter } from "next/navigation";
import { DataTable } from "@/components/data-table";
import type { ColumnDef } from "@tanstack/react-table";

type Order = {
  id: string;
  orderNumber: string;
  customerName: string;
  total: number;
  status: string;
};

const columns: ColumnDef<Order>[] = [
  {
    accessorKey: "orderNumber",
    header: "Order #",
  },
  {
    accessorKey: "customerName",
    header: "Customer",
  },
  {
    accessorKey: "total",
    header: "Total",
    cell: ({ row }) => {
      const total = row.getValue("total") as number;
      return `${total.toLocaleString()} сум`;
    },
  },
  {
    accessorKey: "status",
    header: "Status",
  },
];

export function OrdersTable({ orders }: { orders: Order[] }) {
  const router = useRouter();

  return (
    <DataTable
      columns={columns}
      data={orders}
      enableSorting
      onRowClick={(row) => {
        router.push(`/orders/${row.original.id}`);
      }}
    />
  );
}
```

## 8. Таблица с Multiple Filters

```tsx
"use client";

import { DataTable, DataTableToolbar } from "@/components/data-table";
import type { ColumnDef } from "@tanstack/react-table";
import { Circle, CheckCircle2, XCircle, Clock } from "lucide-react";

type Task = {
  id: string;
  title: string;
  status: "todo" | "in_progress" | "done" | "cancelled";
  priority: "low" | "medium" | "high";
  assignee: string;
};

const columns: ColumnDef<Task>[] = [
  {
    accessorKey: "title",
    header: "Task",
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => {
      const status = row.getValue("status") as string;
      const Icon = {
        todo: Circle,
        in_progress: Clock,
        done: CheckCircle2,
        cancelled: XCircle,
      }[status];
      
      return (
        <div className="flex items-center gap-2">
          <Icon className="h-4 w-4" />
          <span>{status}</span>
        </div>
      );
    },
  },
  {
    accessorKey: "priority",
    header: "Priority",
  },
  {
    accessorKey: "assignee",
    header: "Assignee",
  },
];

export function TasksTable({ tasks }: { tasks: Task[] }) {
  return (
    <DataTable
      columns={columns}
      data={tasks}
      enableSorting
      enableFiltering
      toolbar={(table) => (
        <DataTableToolbar
          table={table}
          searchKey="title"
          searchPlaceholder="Search tasks..."
          filters={[
            {
              column: "status",
              title: "Status",
              options: [
                { label: "Todo", value: "todo", icon: Circle },
                { label: "In Progress", value: "in_progress", icon: Clock },
                { label: "Done", value: "done", icon: CheckCircle2 },
                { label: "Cancelled", value: "cancelled", icon: XCircle },
              ],
            },
            {
              column: "priority",
              title: "Priority",
              options: [
                { label: "Low", value: "low" },
                { label: "Medium", value: "medium" },
                { label: "High", value: "high" },
              ],
            },
          ]}
        />
      )}
    />
  );
}
```

## Сравнение Client-Side vs Server-Side

### Client-Side (enableSorting, enableFiltering)
- ✅ Быстрая сортировка и фильтрация
- ✅ Не требует API запросов
- ✅ Проще в реализации
- ❌ Все данные должны быть загружены
- ❌ Не подходит для больших datasets

### Server-Side (sort, pagination props)
- ✅ Работает с большими datasets
- ✅ Загружает только нужные данные
- ✅ Меньше нагрузки на клиент
- ❌ Требует API поддержки
- ❌ Медленнее из-за network latency

## Когда использовать что?

- **Client-Side**: < 100 записей, статические данные, быстрая фильтрация
- **Server-Side**: > 100 записей, динамические данные, большие таблицы
