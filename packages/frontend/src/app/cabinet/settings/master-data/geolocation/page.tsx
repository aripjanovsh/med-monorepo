"use client";

import { LocationTreeManager } from "@/features/master-data";

export default function LocationsPage() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4">
        <div>
          <h1 className="text-2xl font-gilroy font-semibold text-gray-900">
            Управление локациями
          </h1>
          <p className="mt-1 text-sm text-gray-600">
            Гибкая иерархия локаций: страны, регионы, города, районы
          </p>
        </div>
      </div>

      {/* Location Tree */}
      <LocationTreeManager />
    </div>
  );
}
