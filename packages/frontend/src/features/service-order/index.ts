export * from "./service-order.api";
export * from "./service-order.dto";
export * from "./service-order.model";
export * from "./service-order.constants";
export * from "./components/service-order-list";
export * from "./components/service-order-list-compact";
export * from "./components/service-order-status-badge";
export * from "./components/add-services-dialog";
export * from "./components/service-order-columns";
export * from "./components/service-order-execution-card";
export * from "./components/result-input-text";
export { ResultInputAnalysis } from "./components/result-input-analysis";
export { ResultInputProtocol } from "./components/result-input-protocol";
export {
  ResultInputFile,
  type SavedFileData,
} from "./components/result-input-file";
export * from "./components/service-order-result-dialog";
export {
  AnalysisResultView,
  type AnalysisResultData,
} from "./components/analysis-result-view";
export { ProtocolResultView } from "./components/protocol-result-view";

// Re-export types from other features for convenience
export type { SavedAnalysisData } from "@/features/analysis-form-builder";
export type { SavedProtocolData } from "@/features/visit/visit-protocol.types";
