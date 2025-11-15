"use client";

import { ColumnDef } from "@tanstack/react-table";
import { MoreHorizontal, Calendar, Phone, Eye } from "lucide-react";
import { useRouter } from "next/navigation";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
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
import { Patient } from "@/types/patient";
import { getPatientDetailRoute } from "@/constants/route.constants";

// Separate components for table cells that need router
const PatientNameCell = ({ patient }: { patient: Patient }) => {
  const router = useRouter();
  const age =
    new Date().getFullYear() - new Date(patient.birthDate).getFullYear();

  const handleNameClick = () => {
    router.push(getPatientDetailRoute(patient.id));
  };

  return (
    <div className="flex items-center space-x-3">
      <Avatar className="h-10 w-10">
        <AvatarImage src={patient.avatar} alt={patient.name} />
        <AvatarFallback>
          {patient.name
            .split(" ")
            .map((n) => n[0])
            .join("")
            .toUpperCase()}
        </AvatarFallback>
      </Avatar>
      <div>
        <div
          className="font-medium text-blue-600 hover:text-blue-800 cursor-pointer hover:underline"
          onClick={handleNameClick}
        >
          {patient.name}
        </div>
        <div className="text-sm text-muted-foreground">
          {age} years old • {patient.gender}
        </div>
      </div>
    </div>
  );
};

const PatientActionsCell = ({
  patient,
  onEditPatient,
}: {
  patient: Patient;
  onEditPatient?: (patient: Patient) => void;
}) => {
  const router = useRouter();

  const handleViewDetails = () => {
    router.push(getPatientDetailRoute(patient.id));
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="h-8 w-8 p-0">
          <span className="sr-only">Open menu</span>
          <MoreHorizontal className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuLabel>Actions</DropdownMenuLabel>
        <DropdownMenuItem onClick={handleViewDetails}>
          <Eye className="h-4 w-4 mr-2" />
          View Details
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => navigator.clipboard.writeText(patient.id)}
        >
          Copy patient ID
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={handleViewDetails}>
          View medical history
        </DropdownMenuItem>
        <DropdownMenuItem>Schedule appointment</DropdownMenuItem>
        <DropdownMenuItem onClick={() => onEditPatient?.(patient)}>
          Edit patient
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem className="text-red-600">
          Archive patient
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export const createPatientColumns = (
  onEditPatient?: (patient: Patient) => void,
): ColumnDef<Patient>[] => [
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
    header: "PATIENT",
    cell: ({ row }) => {
      const patient = row.original;
      return <PatientNameCell patient={patient} />;
    },
  },
  {
    accessorKey: "contact",
    header: "CONTACT",
    cell: ({ row }) => {
      const patient = row.original;
      return (
        <div>
          <div className="flex items-center mb-1">
            <Phone className="h-3 w-3 mr-1" />
            {patient.phone}
          </div>
          <div className="text-sm text-blue-600 hover:text-blue-800">
            <a href={`mailto:${patient.email}`}>{patient.email}</a>
          </div>
        </div>
      );
    },
  },
  {
    accessorKey: "assignedDoctor",
    header: "ASSIGNED DOCTOR",
    cell: ({ row }) => {
      const patient = row.original;
      return <div className="font-medium">{patient.assignedDoctor}</div>;
    },
  },
  {
    accessorKey: "appointments",
    header: "APPOINTMENTS",
    cell: ({ row }) => {
      const patient = row.original;
      return (
        <div className="space-y-1">
          {patient.lastVisit && (
            <div className="flex items-center text-sm">
              <Calendar className="h-3 w-3 mr-1" />
              Last: {new Date(patient.lastVisit).toLocaleDateString()}
            </div>
          )}
          {patient.nextAppointment && (
            <div className="flex items-center text-sm text-blue-600">
              <Calendar className="h-3 w-3 mr-1" />
              Next: {new Date(patient.nextAppointment).toLocaleDateString()}
            </div>
          )}
        </div>
      );
    },
  },
  {
    accessorKey: "status",
    header: "STATUS",
    cell: ({ row }) => {
      const status = row.getValue("status") as string;
      return (
        <Badge
          variant={
            status === "ACTIVE"
              ? "default"
              : status === "PENDING"
                ? "secondary"
                : "destructive"
          }
          className={
            status === "ACTIVE"
              ? "bg-green-100 text-green-800 hover:bg-green-100"
              : status === "PENDING"
                ? "bg-yellow-100 text-yellow-800 hover:bg-yellow-100"
                : "bg-red-100 text-red-800 hover:bg-red-100"
          }
        >
          {status}
        </Badge>
      );
    },
  },
  {
    id: "actions",
    enableHiding: false,
    cell: ({ row }) => {
      const patient = row.original;
      return (
        <PatientActionsCell patient={patient} onEditPatient={onEditPatient} />
      );
    },
  },
];

// Default columns without edit functionality for backwards compatibility
export const patientColumns = createPatientColumns();
