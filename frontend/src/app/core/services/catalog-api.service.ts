import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Brand, BrandPayload, VehicleModel, VehicleModelPayload } from '../models/vehicle.models';

@Injectable({ providedIn: 'root' })
export class CatalogApiService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = environment.apiUrl;

  listBrands(): Observable<Brand[]> {
    return this.http.get<Brand[]>(`${this.apiUrl}/brands`);
  }

  createBrand(payload: BrandPayload): Observable<Brand> {
    return this.http.post<Brand>(`${this.apiUrl}/brands`, payload);
  }

  updateBrand(id: number, payload: BrandPayload): Observable<Brand> {
    return this.http.patch<Brand>(`${this.apiUrl}/brands/${id}`, payload);
  }

  deleteBrand(id: number): Observable<{ deleted: boolean }> {
    return this.http.delete<{ deleted: boolean }>(`${this.apiUrl}/brands/${id}`);
  }

  listModels(brandId?: number): Observable<VehicleModel[]> {
    let params = new HttpParams();
    if (brandId) {
      params = params.set('brandId', brandId);
    }

    return this.http.get<VehicleModel[]>(`${this.apiUrl}/models`, { params });
  }

  createModel(payload: VehicleModelPayload): Observable<VehicleModel> {
    return this.http.post<VehicleModel>(`${this.apiUrl}/models`, payload);
  }

  updateModel(id: number, payload: VehicleModelPayload): Observable<VehicleModel> {
    return this.http.patch<VehicleModel>(`${this.apiUrl}/models/${id}`, payload);
  }

  deleteModel(id: number): Observable<{ deleted: boolean }> {
    return this.http.delete<{ deleted: boolean }>(`${this.apiUrl}/models/${id}`);
  }
}