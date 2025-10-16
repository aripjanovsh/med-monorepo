"use client";

import { useSearchParams } from "next/navigation";

type FilterValue = string | number | string[] | number[] | null;

export function useDataFilter() {
  const [searchParams, setSearchParams] = useSearchParams();
}
