export interface Brand {
  id: number;
  name: string;
}

export interface VehicleModel {
  id: number;
  name: string;
  brandId: number;
}

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
