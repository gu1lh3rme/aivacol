import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
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

    return this.http
      .get<VehiclePage>(`${this.apiUrl}/vehicles`, { params })
      .pipe(map((page) => this.normalizeVehiclePage(page)));
  }

  getById(id: number): Observable<Vehicle> {
    return this.http
      .get<Vehicle>(`${this.apiUrl}/vehicles/${id}`)
      .pipe(map((vehicle) => this.normalizeVehicle(vehicle)));
  }

  create(payload: Partial<Vehicle>) {
    return this.http
      .post<Vehicle>(`${this.apiUrl}/vehicles`, payload)
      .pipe(map((vehicle) => this.normalizeVehicle(vehicle)));
  }

  update(id: number, payload: Partial<Vehicle>) {
    return this.http
      .patch<Vehicle>(`${this.apiUrl}/vehicles/${id}`, payload)
      .pipe(map((vehicle) => this.normalizeVehicle(vehicle)));
  }

  remove(id: number) {
    return this.http.delete<{ deleted: boolean }>(`${this.apiUrl}/vehicles/${id}`);
  }

  getBrands() {
    return this.http.get<Brand[]>(`${this.apiUrl}/brands`);
  }

  getModelsByBrand(brandId: number) {
    return this.http.get<VehicleModel[]>(`${this.apiUrl}/models`, {
      params: new HttpParams().set('brandId', brandId),
    });
  }

  private normalizeVehiclePage(page: VehiclePage): VehiclePage {
    return {
      ...page,
      data: page.data.map((vehicle) => this.normalizeVehicle(vehicle)),
    };
  }

  private normalizeVehicle(vehicle: Vehicle): Vehicle {
    return {
      ...vehicle,
      imageUrl: this.toAbsoluteAssetUrl(vehicle.imageUrl),
    };
  }

  private toAbsoluteAssetUrl(imageUrl?: string): string | undefined {
    if (!imageUrl) {
      return imageUrl;
    }

    if (imageUrl.startsWith('data:image/')) {
      return imageUrl;
    }

    if (/^https?:\/\//i.test(imageUrl)) {
      return imageUrl;
    }

    if (!imageUrl.startsWith('/')) {
      return `${this.apiUrl}/${imageUrl}`;
    }

    return `${this.apiUrl}${imageUrl}`;
  }
}
