export interface Brand {
  id: number;
  name: string;
}

export interface BrandPayload {
  name: string;
}

export interface VehicleModel {
  id: number;
  name: string;
  brandId: number;
}

export interface VehicleModelPayload {
  name: string;
  brandId: number;
}

export type VehicleStatus = 'available' | 'maintenance' | 'archived';

export interface Vehicle {
  id: number;
  plate: string;
  brandId: number;
  modelId: number;
  year: number;
  color: string;
  imageUrl?: string;
  mileage: number;
  brand?: Brand;
  model?: VehicleModel;
}

export interface VehiclePage {
  data: Vehicle[];
  total: number;
  page: number;
  pageSize: number;
}
