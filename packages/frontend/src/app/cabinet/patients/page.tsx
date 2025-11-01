"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Filter, Plus, Users, Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DataTable } from "@/components/data-table/data-table";
import { createPatientColumns } from "@/features/patients/components/patient-columns";
import {
  PatientResponseDto,
  useGetPatientsQuery,
  useGetPatientStatsQuery,
  useDeletePatientMutation,
} from "@/features/patients";
import { Input } from "@/components/ui/input";
import PageHeader from "@/components/layouts/page-header";
import { useDebounce } from "@/hooks/use-debounce";
import { toast } from "sonner";
import { useConfirmDialog } from "@/components/dialogs";

export default function PatientsPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("active");
  const [searchTerm, setSearchTerm] = useState("");
  const [page, setPage] = useState(1);
  const [limit] = useState(10);

  const confirm = useConfirmDialog();
  const debouncedSearchTerm = useDebounce(searchTerm, 300);

  const {
    data: patientsData,
    isLoading: isLoadingPatients,
    error: patientsError,
    refetch: refetchPatients,
  } = useGetPatientsQuery({
    page,
    limit,
    search: debouncedSearchTerm,
    sortBy: "firstName",
    sortOrder: "asc",
    status:
      activeTab === "active"
        ? "ACTIVE"
        : activeTab === "inactive"
        ? "INACTIVE"
        : "DECEASED",
  });

  const { data: statsData, isLoading: isLoadingStats } =
    useGetPatientStatsQuery({});

  const [deletePatient] = useDeletePatientMutation();

  const handleCreatePatient = () => {
    router.push("/cabinet/patients/create");
  };

  const handleDeletePatient = async (patient: PatientResponseDto) => {
    confirm({
      title: "Удалить пациента?",
      description: `Вы уверены, что хотите удалить пациента ${patient.firstName} ${patient.lastName}? Это действие нельзя отменить.`,
      variant: "destructive",
      confirmText: "Удалить",
      onConfirm: async () => {
        try {
          await deletePatient({ id: patient.id }).unwrap();
          toast.success("Пациент успешно удален!");
          refetchPatients();
        } catch (error: any) {
          console.error("Error deleting patient:", error);
          const errorMessage =
            error?.data?.message ||
            error?.message ||
            "Ошибка при удалении пациента";
          toast.error(errorMessage);
        }
      },
    });
  };

  const patientActions = {
    onDelete: handleDeletePatient,
  };

  const patientColumns = createPatientColumns(patientActions);

  const patients = patientsData?.data || [];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Пациенты"
        actions={
          <Button onClick={handleCreatePatient}>
            <Plus className="mr-2 h-4 w-4" />
            Добавить пациента
          </Button>
        }
      />

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList
          variant="underline"
          className="-mx-6 mb-6"
          contentClassName="px-4"
        >
          <TabsTrigger value="active" variant="underline">
            Активные пациенты ({statsData?.byStatus?.active || 0})
          </TabsTrigger>
          <TabsTrigger value="inactive" variant="underline">
            Неактивные ({statsData?.byStatus?.inactive || 0})
          </TabsTrigger>
          <TabsTrigger value="deceased" variant="underline">
            Умершие ({statsData?.byStatus?.deceased || 0})
          </TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab} className="space-y-4">
          <div className="flex items-center justify-between">
            <Input
              placeholder="Поиск пациентов по имени..."
              className="w-full max-w-md"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <div className="flex items-center space-x-2">
              <Button variant="outline">
                <Filter className="mr-2 h-4 w-4" />
                Фильтры
              </Button>
            </div>
          </div>

          {isLoadingPatients ? (
            <div className="flex items-center justify-center h-64">
              <Loader2 className="h-8 w-8 animate-spin" />
            </div>
          ) : patientsError ? (
            <div className="flex items-center justify-center h-64">
              <div className="text-center">
                <p className="text-red-500">Ошибка при загрузке данных</p>
                <Button
                  onClick={() => refetchPatients()}
                  variant="outline"
                  className="mt-2"
                >
                  Повторить
                </Button>
              </div>
            </div>
          ) : patients.length > 0 ? (
            <DataTable
              columns={patientColumns}
              data={patients}
              pagination={{
                page,
                limit,
                total: patientsData?.meta?.total || 0,
                onChangePage: setPage,
              }}
            />
          ) : (
            <div className="flex items-center justify-center h-64 border-2 border-dashed border-gray-300 rounded-lg">
              <div className="text-center">
                <Users className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-sm font-medium text-gray-900">
                  Нет пациентов
                </h3>
                <p className="mt-1 text-sm text-gray-500">
                  {activeTab === "active"
                    ? "Активных пациентов пока нет."
                    : activeTab === "inactive"
                    ? "Неактивных пациентов нет."
                    : "Нет записей об умерших пациентах."}
                </p>
                <div className="mt-6">
                  <Button size="sm" onClick={handleCreatePatient}>
                    <Plus className="mr-2 h-4 w-4" />
                    Добавить пациента
                  </Button>
                </div>
              </div>
            </div>
          )}
        </TabsContent>
      </Tabs>

    </div>
  );
}
