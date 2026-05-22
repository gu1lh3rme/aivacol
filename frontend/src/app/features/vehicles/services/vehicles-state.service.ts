import { Injectable, computed, inject, signal } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { Brand, Vehicle, VehicleModel, VehicleStatus } from '../../../core/models/vehicle.models';
import { CatalogApiService } from '../../../core/services/catalog-api.service';
import { VehiclesApiService } from './vehicles-api.service';

interface Filters {
  search: string;
  brandId: number | null;
  modelId: number | null;
  year: number | null;
  status: VehicleStatus | 'all';
  sortBy: 'plate' | 'brand' | 'model' | 'year' | 'mileage';
  sortDirection: 'asc' | 'desc';
  page: number;
  pageSize: number;
}

const DEFAULT_FILTERS: Filters = {
  search: '',
  brandId: null,
  modelId: null,
  year: null,
  status: 'all',
  sortBy: 'plate',
  sortDirection: 'asc',
  page: 1,
  pageSize: 8,
};

@Injectable({ providedIn: 'root' })
export class VehiclesStateService {
  private readonly api = inject(VehiclesApiService);
  private readonly catalogApi = inject(CatalogApiService);

  readonly loading = signal(false);
  readonly vehicles = signal<Vehicle[]>([]);
  readonly brands = signal<Brand[]>([]);
  readonly models = signal<VehicleModel[]>([]);
  readonly total = signal(0);
  readonly filters = signal<Filters>({ ...DEFAULT_FILTERS });
  readonly viewMode = signal<'table' | 'cards'>('table');

  readonly availableModels = computed(() => {
    const brandId = this.filters().brandId;
    return brandId ? this.models().filter((model) => model.brandId === brandId) : this.models();
  });

  readonly filteredVehicles = computed(() => {
    const filters = this.filters();
    const search = filters.search.trim().toLowerCase();

    const result = this.vehicles().filter((vehicle) => {
      const brandMatches = filters.brandId ? vehicle.brandId === filters.brandId : true;
      const modelMatches = filters.modelId ? vehicle.modelId === filters.modelId : true;
      const yearMatches = filters.year ? vehicle.year === filters.year : true;
      const statusMatches = filters.status === 'all' ? true : this.resolveStatus(vehicle) === filters.status;

      if (!search) {
        return brandMatches && modelMatches && yearMatches && statusMatches;
      }

      const searchable = [
        vehicle.plate,
        vehicle.brand?.name ?? '',
        vehicle.model?.name ?? '',
        vehicle.color,
        String(vehicle.year),
      ]
        .join(' ')
        .toLowerCase();

      return searchable.includes(search) && brandMatches && modelMatches && yearMatches && statusMatches;
    });

    return result.sort((left, right) => this.compareVehicles(left, right, filters.sortBy, filters.sortDirection));
  });

  readonly pagedVehicles = computed(() => {
    const filters = this.filters();
    const start = (filters.page - 1) * filters.pageSize;
    return this.filteredVehicles().slice(start, start + filters.pageSize);
  });

  readonly hasData = computed(() => this.filteredVehicles().length > 0);

  constructor() {
    void this.bootstrap();
  }

  updateFilters(partial: Partial<Filters>) {
    this.filters.update((current) => {
      const next = { ...current, ...partial };

      if (partial.brandId !== undefined && partial.brandId !== current.brandId) {
        next.modelId = null;
      }

      if (
        partial.search !== undefined ||
        partial.brandId !== undefined ||
        partial.modelId !== undefined ||
        partial.year !== undefined ||
        partial.status !== undefined ||
        partial.sortBy !== undefined ||
        partial.sortDirection !== undefined
      ) {
        next.page = 1;
      }

      return next;
    });
    this.total.set(this.filteredVehicles().length);
  }

  setViewMode(viewMode: 'table' | 'cards') {
    this.viewMode.set(viewMode);
  }

  clearFilters() {
    this.filters.set({ ...DEFAULT_FILTERS });
    this.total.set(this.filteredVehicles().length);
  }

  async bootstrap() {
    this.loading.set(true);
    try {
      const [vehiclePage, brands, models] = await Promise.all([
        firstValueFrom(this.api.list({ page: 1, pageSize: 1000 })),
        firstValueFrom(this.catalogApi.listBrands()),
        firstValueFrom(this.catalogApi.listModels()),
      ]);

      this.vehicles.set(vehiclePage.data);
      this.brands.set(brands);
      this.models.set(models);
      this.total.set(this.filteredVehicles().length);
    } finally {
      this.loading.set(false);
    }
  }

  resolveStatus(vehicle: Vehicle): VehicleStatus {
    const currentYear = new Date().getFullYear();

    if (vehicle.year >= currentYear - 2 && vehicle.mileage < 30000) {
      return 'available';
    }

    if (vehicle.year < currentYear - 7 || vehicle.mileage >= 90000) {
      return 'archived';
    }

    return 'maintenance';
  }

  statusLabel(status: VehicleStatus): string {
    switch (status) {
      case 'available':
        return 'Operando';
      case 'maintenance':
        return 'Revisão';
      case 'archived':
        return 'Reserva';
    }
  }

  private compareVehicles(
    left: Vehicle,
    right: Vehicle,
    sortBy: Filters['sortBy'],
    sortDirection: Filters['sortDirection'],
  ) {
    const direction = sortDirection === 'asc' ? 1 : -1;
    const leftValue = this.sortValue(left, sortBy);
    const rightValue = this.sortValue(right, sortBy);

    if (leftValue < rightValue) return -1 * direction;
    if (leftValue > rightValue) return 1 * direction;
    return 0;
  }

  private sortValue(vehicle: Vehicle, sortBy: Filters['sortBy']) {
    switch (sortBy) {
      case 'brand':
        return vehicle.brand?.name ?? '';
      case 'model':
        return vehicle.model?.name ?? '';
      case 'mileage':
        return vehicle.mileage ?? 0;
      case 'year':
        return vehicle.year ?? 0;
      case 'plate':
      default:
        return vehicle.plate ?? '';
    }
  }
}
