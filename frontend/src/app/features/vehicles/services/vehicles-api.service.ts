import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { Brand, Vehicle, VehicleModel, VehiclePage } from '../../../core/models/vehicle.models';

@Injectable({ providedIn: 'root' })
export class VehiclesApiService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = environment.apiUrl;

  list(filters: { plate?: string; brand?: string; model?: string; page: number; pageSize: number }) {
    let params = new HttpParams().set('page', filters.page).set('pageSize', filters.pageSize);
    if (filters.plate) params = params.set('plate', filters.plate);
    if (filters.brand) params = params.set('brand', filters.brand);
    if (filters.model) params = params.set('model', filters.model);

    return this.http.get<VehiclePage>(`${this.apiUrl}/vehicles`, { params });
  }

  getById(id: number): Observable<Vehicle> {
    return this.http.get<Vehicle>(`${this.apiUrl}/vehicles/${id}`);
  }

  create(payload: Partial<Vehicle>) {
    return this.http.post<Vehicle>(`${this.apiUrl}/vehicles`, payload);
  }

  update(id: number, payload: Partial<Vehicle>) {
    return this.http.patch<Vehicle>(`${this.apiUrl}/vehicles/${id}`, payload);
  }

  getBrands() {
    return this.http.get<Brand[]>(`${this.apiUrl}/brands`);
  }

  getModelsByBrand(brandId: number) {
    return this.http.get<VehicleModel[]>(`${this.apiUrl}/models`, {
      params: new HttpParams().set('brandId', brandId),
    });
  }
}
