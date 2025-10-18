"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/data-table/data-table";
import { toast } from "sonner";

import { useGetVisitsQuery, useDeleteVisitMutation } from "@/features/visit";
import { createVisitColumns } from "@/features/visit/components/visit-columns";
import { useDebounce } from "@/hooks/use-debounce";

export default function VisitsPage() {
  const router = useRouter();
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const { data, isLoading, refetch } = useGetVisitsQuery({
    page,
    limit: pageSize,
  });

  const [deleteVisit] = useDeleteVisitMutation();

  const handleView = (visit: any) => {
    router.push(`/cabinet/visits/${visit.id}`);
  };

  const handleEdit = (visit: any) => {
    router.push(`/cabinet/visits/${visit.id}/edit`);
  };

  const handleDelete = async (visit: any) => {
    if (!confirm("Удалить визит?")) return;

    try {
      await deleteVisit(visit.id).unwrap();
      toast.success("Визит удален");
      refetch();
    } catch (error: any) {
      toast.error(error?.data?.message || "Ошибка при удалении");
    }
  };

  const columns = createVisitColumns(handleEdit, handleView, handleDelete);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Визиты</h1>
          <p className="text-muted-foreground">
            Управление медицинскими визитами пациентов
          </p>
        </div>
        <Button onClick={() => router.push("/cabinet/visits/create")}>
          <Plus className="h-4 w-4 mr-2" />
          Начать прием
        </Button>
      </div>

      <DataTable
        columns={columns}
        data={data?.data || []}
        isLoading={isLoading}
        pagination={{
          page,
          pageSize,
          total: data?.meta?.total || 0,
          onPageChange: setPage,
          onPageSizeChange: setPageSize,
        }}
      />
    </div>
  );
}
