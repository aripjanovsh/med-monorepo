export interface Treatment {
  id: string;
  name: string;
  description: string;
  category: TreatmentCategory;
  duration: number; // in minutes
  price: number;
  status: TreatmentStatus;
  requirements?: string[];
  equipmentNeeded?: string[];
  specialization?: string;
  difficulty: TreatmentDifficulty;
  createdAt: string;
  updatedAt: string;
  createdBy: string;
  // Additional fields for detailed management
  procedures?: TreatmentProcedure[];
  contraindications?: string[];
  sideEffects?: string[];
  followUpRequired?: boolean;
  followUpDays?: number;
  preparationInstructions?: string;
  postTreatmentCare?: string;
  estimatedSessions?: number;
  tags?: string[];
  isActive: boolean;
}

export interface TreatmentProcedure {
  id: string;
  step: number;
  title: string;
  description: string;
  duration: number; // in minutes
  tools?: string[];
  notes?: string;
}

export type TreatmentCategory = 
  | "GENERAL_DENTISTRY"
  | "ORTHODONTICS" 
  | "ORAL_SURGERY"
  | "PERIODONTICS"
  | "ENDODONTICS"
  | "PROSTHODONTICS"
  | "PEDIATRIC_DENTISTRY"
  | "COSMETIC_DENTISTRY"
  | "PREVENTIVE_CARE"
  | "EMERGENCY_CARE";

export type TreatmentStatus = "ACTIVE" | "INACTIVE" | "DISCONTINUED" | "UNDER_REVIEW";

export type TreatmentDifficulty = "BASIC" | "INTERMEDIATE" | "ADVANCED" | "EXPERT";

export interface TreatmentStats {
  total: number;
  active: number;
  inactive: number;
  byCategory: Record<TreatmentCategory, number>;
  averagePrice: number;
  averageDuration: number;
}

export interface TreatmentFilter {
  category?: TreatmentCategory;
  status?: TreatmentStatus;
  difficulty?: TreatmentDifficulty;
  priceRange?: {
    min: number;
    max: number;
  };
  durationRange?: {
    min: number;
    max: number;
  };
  search?: string;
}