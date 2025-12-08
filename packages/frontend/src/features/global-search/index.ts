// Types
export type {
  GlobalSearchPatientDto,
  GlobalSearchEmployeeDto,
  GlobalSearchResponseDto,
  GlobalSearchQueryParams,
} from "./global-search.dto";

// API hooks
export {
  useGlobalSearchQuery,
  useLazyGlobalSearchQuery,
} from "./global-search.api";

// Components
export { GlobalSearchAutocomplete } from "./components/global-search-autocomplete";
