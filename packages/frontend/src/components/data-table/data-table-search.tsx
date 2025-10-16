import { DataTableToolbarSearch } from "@/components/data-table/data-table.model";
import { Input } from "@/components/ui/input";
import { ChangeEvent, useEffect, useRef } from "react";

interface DataTableSearchProps {
  search?: DataTableToolbarSearch;
}

export function DataTableSearch({ search }: DataTableSearchProps) {
  const inputRef = useRef<HTMLInputElement | null>(null);

  const handleSearch = (e: ChangeEvent<HTMLInputElement>) => {
    if (search?.onChange) search.onChange(e.target.value);
  };

  useEffect(() => {
    if (inputRef.current && search?.value !== undefined) {
      inputRef.current.value = search.value;
    }
  }, [search?.value]);

  return (
    <Input
      ref={inputRef}
      onChange={handleSearch}
      placeholder="Search"
      defaultValue={search?.value}
      className="h-8 w-[150px] lg:w-[250px]"
    />
  );
}
