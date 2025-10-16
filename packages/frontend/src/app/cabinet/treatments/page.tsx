"use client";

import { useState, useMemo } from "react";
import {
  Plus,
  Filter,
  Search,
  Stethoscope,
  Clock,
  DollarSign,
  Activity,
  BarChart3,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DataTable } from "@/components/data-table/data-table";
import { Badge } from "@/components/ui/badge";

import { mockTreatments, getTreatmentStats } from "@/data/treatments";
import { Treatment, TreatmentFilter } from "@/types/treatment";
import PageHeader from "@/components/layouts/page-header";

import { createTreatmentColumns } from "@/components/treatments/treatment-columns";
import { TreatmentSheet } from "@/components/treatments/treatment-sheet";
import { TreatmentFilters } from "@/components/treatments/treatment-filters";

export default function TreatmentsPage() {
  const [activeTab, setActiveTab] = useState("all");
  const [treatmentSheetOpen, setTreatmentSheetOpen] = useState(false);
  const [sheetMode, setSheetMode] = useState<"create" | "edit">("create");
  const [selectedTreatment, setSelectedTreatment] = useState<
    Treatment | undefined
  >();
  const [searchQuery, setSearchQuery] = useState("");
  const [filters, setFilters] = useState<TreatmentFilter>({});
  const [showFilters, setShowFilters] = useState(false);

  const handleCreateTreatment = () => {
    setSelectedTreatment(undefined);
    setSheetMode("create");
    setTreatmentSheetOpen(true);
  };

  const handleEditTreatment = (treatment: Treatment) => {
    setSelectedTreatment(treatment);
    setSheetMode("edit");
    setTreatmentSheetOpen(true);
  };

  const handleViewTreatment = (treatment: Treatment) => {
    setSelectedTreatment(treatment);
    setSheetMode("edit"); // For now, use edit mode for viewing
    setTreatmentSheetOpen(true);
  };

  // Filter treatments based on search and filters
  const filteredTreatments = useMemo(() => {
    let filtered = mockTreatments;

    // Apply search
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (treatment) =>
          treatment.name.toLowerCase().includes(query) ||
          treatment.description.toLowerCase().includes(query) ||
          treatment.category.toLowerCase().includes(query) ||
          treatment.tags?.some((tag) => tag.toLowerCase().includes(query))
      );
    }

    // Apply filters
    if (filters.category) {
      filtered = filtered.filter(
        (treatment) => treatment.category === filters.category
      );
    }

    if (filters.status) {
      filtered = filtered.filter(
        (treatment) => treatment.status === filters.status
      );
    }

    if (filters.difficulty) {
      filtered = filtered.filter(
        (treatment) => treatment.difficulty === filters.difficulty
      );
    }

    if (filters.priceRange) {
      filtered = filtered.filter(
        (treatment) =>
          treatment.price >= filters.priceRange!.min &&
          treatment.price <= filters.priceRange!.max
      );
    }

    if (filters.durationRange) {
      filtered = filtered.filter(
        (treatment) =>
          treatment.duration >= filters.durationRange!.min &&
          treatment.duration <= filters.durationRange!.max
      );
    }

    // Apply tab filter
    if (activeTab !== "all") {
      switch (activeTab) {
        case "active":
          filtered = filtered.filter(
            (treatment) => treatment.status === "ACTIVE"
          );
          break;
        case "inactive":
          filtered = filtered.filter(
            (treatment) => treatment.status === "INACTIVE"
          );
          break;
        case "popular":
          // Mock popular treatments (in real app, this would be based on usage stats)
          filtered = filtered.filter((treatment) =>
            ["1", "2", "4", "6"].includes(treatment.id)
          );
          break;
      }
    }

    return filtered;
  }, [searchQuery, filters, activeTab]);

  const treatmentColumns = createTreatmentColumns(
    handleEditTreatment,
    handleViewTreatment
  );
  const stats = getTreatmentStats();

  return (
    <div className="space-y-6">
      <PageHeader
        title="Процедуры"
        description="Управление медицинскими процедурами и лечением"
        actions={
          <Button onClick={handleCreateTreatment}>
            <Plus className="mr-2 h-4 w-4" />
            Добавить процедуру
          </Button>
        }
      />

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Stethoscope className="h-4 w-4 text-blue-600" />
              <div>
                <p className="text-sm font-medium">Всего процедур</p>
                <p className="text-2xl font-bold">{stats.total}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Activity className="h-4 w-4 text-green-600" />
              <div>
                <p className="text-sm font-medium">Активные</p>
                <p className="text-2xl font-bold">{stats.active}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <DollarSign className="h-4 w-4 text-purple-600" />
              <div>
                <p className="text-sm font-medium">Средняя цена</p>
                <p className="text-2xl font-bold">${stats.averagePrice}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Clock className="h-4 w-4 text-red-600" />
              <div>
                <p className="text-sm font-medium">Средняя длительность</p>
                <p className="text-2xl font-bold">{stats.averageDuration}min</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filters */}
      <div className="flex items-center justify-between space-x-4">
        <div className="flex items-center space-x-2 flex-1">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Поиск процедур..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <Button
            variant="outline"
            onClick={() => setShowFilters(!showFilters)}
            className={showFilters ? "bg-blue-50 border-blue-200" : ""}
          >
            <Filter className="mr-2 h-4 w-4" />
            Фильтры
            {Object.keys(filters).length > 0 && (
              <Badge variant="secondary" className="ml-2">
                {Object.keys(filters).length}
              </Badge>
            )}
          </Button>
        </div>
      </div>

      {/* Advanced Filters */}
      {showFilters && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Расширенные фильтры</CardTitle>
          </CardHeader>
          <CardContent>
            <TreatmentFilters
              filters={filters}
              onFiltersChange={setFilters}
              onReset={() => setFilters({})}
            />
          </CardContent>
        </Card>
      )}

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList
          variant="underline"
          className="-mx-6 mb-6"
          contentClassName="px-4"
        >
          <TabsTrigger value="all" variant="underline">
            Все процедуры
            <Badge variant="secondary" className="ml-2">
              {mockTreatments.length}
            </Badge>
          </TabsTrigger>
          <TabsTrigger value="active" variant="underline">
            Активные
            <Badge variant="secondary" className="ml-2">
              {stats.active}
            </Badge>
          </TabsTrigger>
          <TabsTrigger value="inactive" variant="underline">
            Неактивные
            <Badge variant="secondary" className="ml-2">
              {stats.inactive}
            </Badge>
          </TabsTrigger>
          <TabsTrigger value="popular" variant="underline">
            Популярные
            <Badge variant="secondary" className="ml-2">
              4
            </Badge>
          </TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab} className="space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">
              Показано {filteredTreatments.length} из {mockTreatments.length}{" "}
              процедур
            </p>
          </div>

          <DataTable
            columns={treatmentColumns}
            data={filteredTreatments}
            pagination={{
              page: 1,
              limit: 10,
              total: filteredTreatments.length,
            }}
          />
        </TabsContent>
      </Tabs>

      {/* Treatment Sheet */}
      <TreatmentSheet
        open={treatmentSheetOpen}
        onOpenChange={setTreatmentSheetOpen}
        treatment={selectedTreatment}
        mode={sheetMode}
      />
    </div>
  );
}
