"use client";

import { ColumnDef } from "@tanstack/react-table";
import { MoreHorizontal, Clock, DollarSign, Eye } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Treatment } from "@/types/treatment";

const getCategoryColor = (category: string) => {
  const colors: Record<string, string> = {
    "GENERAL_DENTISTRY": "bg-blue-100 text-blue-800",
    "ORTHODONTICS": "bg-purple-100 text-purple-800", 
    "ORAL_SURGERY": "bg-red-100 text-red-800",
    "PERIODONTICS": "bg-green-100 text-green-800",
    "ENDODONTICS": "bg-yellow-100 text-yellow-800",
    "PROSTHODONTICS": "bg-indigo-100 text-indigo-800",
    "PEDIATRIC_DENTISTRY": "bg-pink-100 text-pink-800",
    "COSMETIC_DENTISTRY": "bg-cyan-100 text-cyan-800",
    "PREVENTIVE_CARE": "bg-emerald-100 text-emerald-800",
    "EMERGENCY_CARE": "bg-orange-100 text-orange-800",
  };
  return colors[category] || "bg-gray-100 text-gray-800";
};

const getStatusColor = (status: string) => {
  switch (status) {
    case "ACTIVE":
      return "bg-green-100 text-green-800";
    case "INACTIVE":
      return "bg-gray-100 text-gray-800";
    case "DISCONTINUED":
      return "bg-red-100 text-red-800";
    case "UNDER_REVIEW":
      return "bg-yellow-100 text-yellow-800";
    default:
      return "bg-gray-100 text-gray-800";
  }
};

const getDifficultyColor = (difficulty: string) => {
  switch (difficulty) {
    case "BASIC":
      return "bg-green-100 text-green-800";
    case "INTERMEDIATE":
      return "bg-yellow-100 text-yellow-800";
    case "ADVANCED":
      return "bg-orange-100 text-orange-800";
    case "EXPERT":
      return "bg-red-100 text-red-800";
    default:
      return "bg-gray-100 text-gray-800";
  }
};

const formatCategoryName = (category: string) => {
  return category.split('_').map(word => 
    word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
  ).join(' ');
};

export const createTreatmentColumns = (
  onEditTreatment?: (treatment: Treatment) => void,
  onViewTreatment?: (treatment: Treatment) => void
): ColumnDef<Treatment>[] => [
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
    accessorKey: "name",
    header: "ПРОЦЕДУРА",
    cell: ({ row }) => {
      const treatment = row.original;
      return (
        <div className="space-y-1">
          <button 
            className="font-medium text-left hover:text-blue-600 transition-colors"
            onClick={() => onViewTreatment?.(treatment)}
          >
            {treatment.name}
          </button>
          <p className="text-sm text-muted-foreground line-clamp-2">
            {treatment.description}
          </p>
          {treatment.tags && treatment.tags.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {treatment.tags.slice(0, 2).map((tag, index) => (
                <Badge key={index} variant="outline" className="text-xs">
                  {tag}
                </Badge>
              ))}
              {treatment.tags.length > 2 && (
                <Badge variant="outline" className="text-xs">
                  +{treatment.tags.length - 2}
                </Badge>
              )}
            </div>
          )}
        </div>
      );
    },
  },
  {
    accessorKey: "category",
    header: "КАТЕГОРИЯ",
    cell: ({ row }) => {
      const category = row.getValue("category") as string;
      return (
        <Badge variant="secondary" className={getCategoryColor(category)}>
          {formatCategoryName(category)}
        </Badge>
      );
    },
  },
  {
    accessorKey: "duration",
    header: "ДЛИТЕЛЬНОСТЬ",
    cell: ({ row }) => {
      const duration = row.getValue("duration") as number;
      return (
        <div className="flex items-center space-x-1">
          <Clock className="h-3 w-3 text-muted-foreground" />
          <span className="text-sm">{duration} min</span>
        </div>
      );
    },
  },
  {
    accessorKey: "price",
    header: "ЦЕНА",
    cell: ({ row }) => {
      const price = row.getValue("price") as number;
      return (
        <div className="flex items-center space-x-1">
          <DollarSign className="h-3 w-3 text-muted-foreground" />
          <span className="font-medium">${price}</span>
        </div>
      );
    },
  },
  {
    accessorKey: "difficulty",
    header: "СЛОЖНОСТЬ",
    cell: ({ row }) => {
      const difficulty = row.getValue("difficulty") as string;
      return (
        <Badge variant="outline" className={getDifficultyColor(difficulty)}>
          {difficulty}
        </Badge>
      );
    },
  },
  {
    accessorKey: "status",
    header: "СТАТУС",
    cell: ({ row }) => {
      const status = row.getValue("status") as string;
      return (
        <Badge variant="secondary" className={getStatusColor(status)}>
          {status}
        </Badge>
      );
    },
  },
  {
    accessorKey: "specialization",
    header: "СПЕЦИАЛИЗАЦИЯ",
    cell: ({ row }) => {
      const specialization = row.getValue("specialization") as string;
      return (
        <span className="text-sm text-muted-foreground">
          {specialization || "Общая"}
        </span>
      );
    },
  },
  {
    id: "actions",
    enableHiding: false,
    cell: ({ row }) => {
      const treatment = row.original;

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
            <DropdownMenuItem
              onClick={() => navigator.clipboard.writeText(treatment.id)}
            >
              Копировать ID процедуры
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => onViewTreatment?.(treatment)}>
              <Eye className="mr-2 h-4 w-4" />
              Просмотр деталей
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onEditTreatment?.(treatment)}>
              Редактировать процедуру
            </DropdownMenuItem>
            <DropdownMenuItem>
              Дублировать процедуру
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="text-red-600">
              {treatment.status === "ACTIVE" ? "Деактивировать" : "Удалить"} процедуру
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];

// Default columns without edit functionality for backwards compatibility
export const treatmentColumns = createTreatmentColumns();