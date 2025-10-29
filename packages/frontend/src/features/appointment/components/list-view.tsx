import type { AppointmentResponseDto } from "../appointment.dto";
import { DataTable } from "@/components/data-table/data-table";
import type { ColumnDef } from "@tanstack/react-table";

type ListViewProps = {
  columns: ColumnDef<AppointmentResponseDto>[];
  appointments: AppointmentResponseDto[];
  isLoading: boolean;
  pagination: {
    page: number;
    limit: number;
    total: number;
    onChangePage: (page: number) => void;
    onChangeLimit: (limit: number) => void;
  };
};

export const ListView = ({
  columns,
  appointments,
  isLoading,
  pagination,
}: ListViewProps) => {
  return (
    <DataTable
      columns={columns}
      data={appointments}
      isLoading={isLoading}
      pagination={pagination}
    />
  );
};
