import { Injectable, computed, inject, signal } from '@angular/core';
import { debounceTime, finalize, Subject, switchMap } from 'rxjs';
import { Vehicle } from '../../../core/models/vehicle.models';
import { VehiclesApiService } from './vehicles-api.service';

interface Filters {
  plate: string;
  brand: string;
  model: string;
  page: number;
  pageSize: number;
}

@Injectable({ providedIn: 'root' })
export class VehiclesStateService {
  private readonly api = inject(VehiclesApiService);
  private readonly searchTrigger$ = new Subject<Filters>();

  readonly loading = signal(false);
  readonly vehicles = signal<Vehicle[]>([]);
  readonly total = signal(0);
  readonly filters = signal<Filters>({ plate: '', brand: '', model: '', page: 1, pageSize: 10 });
  readonly hasData = computed(() => this.vehicles().length > 0);

  constructor() {
    this.searchTrigger$
      .pipe(
        debounceTime(250),
        switchMap((filters) => {
          this.loading.set(true);
          return this.api.list(filters).pipe(finalize(() => this.loading.set(false)));
        }),
      )
      .subscribe((result) => {
        this.vehicles.set(result.data);
        this.total.set(result.total);
      });
  }

  updateFilters(partial: Partial<Filters>) {
    this.filters.update((current) => ({ ...current, ...partial }));
    this.searchTrigger$.next(this.filters());
  }
}
