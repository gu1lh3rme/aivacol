import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { finalize } from 'rxjs';
import { VehiclesApiService } from '../../vehicles/services/vehicles-api.service';
import { Vehicle } from '../../../core/models/vehicle.models';

@Component({
  selector: 'app-home-page',
  standalone: true,
  imports: [RouterLink, MatButtonModule, MatCardModule, MatIconModule, MatProgressBarModule],
  templateUrl: './home-page.component.html',
  styleUrl: './home-page.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HomePageComponent {
  private readonly api = inject(VehiclesApiService);

  readonly loading = signal(true);
  readonly vehicles = signal<Vehicle[]>([]);

  readonly totalVehicles = computed(() => this.vehicles().length);
  readonly totalBrands = computed(() => new Set(this.vehicles().map((vehicle) => vehicle.brand?.name ?? 'Sem marca')).size);
  readonly averageMileage = computed(() => {
    const mileage = this.vehicles().map((vehicle) => vehicle.mileage ?? 0);
    return mileage.length ? Math.round(mileage.reduce((sum, value) => sum + value, 0) / mileage.length) : 0;
  });
  readonly newestYear = computed(() => Math.max(...this.vehicles().map((vehicle) => vehicle.year), 0));

  readonly topBrands = computed(() => {
    const counts = new Map<string, number>();
    this.vehicles().forEach((vehicle) => {
      const key = vehicle.brand?.name ?? 'Sem marca';
      counts.set(key, (counts.get(key) ?? 0) + 1);
    });

    return [...counts.entries()]
      .map(([label, value]) => ({ label, value }))
      .sort((left, right) => right.value - left.value)
      .slice(0, 5);
  });

  readonly yearDistribution = computed(() => {
    const counts = new Map<number, number>();
    this.vehicles().forEach((vehicle) => {
      counts.set(vehicle.year, (counts.get(vehicle.year) ?? 0) + 1);
    });

    return [...counts.entries()]
      .map(([label, value]) => ({ label, value }))
      .sort((left, right) => right.label - left.label)
      .slice(0, 6);
  });

  readonly recentVehicles = computed(() => [...this.vehicles()].sort((left, right) => right.id - left.id).slice(0, 4));

  readonly kpis = computed(() => [
    { title: 'Veículos cadastrados', value: this.totalVehicles(), icon: 'directions_car' },
    { title: 'Marcas ativas', value: this.totalBrands(), icon: 'account_tree' },
    { title: 'Média de km', value: this.formatMileage(this.averageMileage()), icon: 'speed' },
    { title: 'Ano mais novo', value: this.newestYear() || 'N/D', icon: 'calendar_month' },
  ]);

  constructor() {
    this.loadDashboard();
  }

  loadDashboard() {
    this.loading.set(true);
    this.api
      .list({ page: 1, pageSize: 1000 })
      .pipe(finalize(() => this.loading.set(false)))
      .subscribe((page) => this.vehicles.set(page.data));
  }

  countByBrand(label: string) {
    return this.vehicles().filter((vehicle) => (vehicle.brand?.name ?? 'Sem marca') === label).length;
  }

  countByYear(label: number) {
    return this.vehicles().filter((vehicle) => vehicle.year === label).length;
  }

  formatMileage(mileage: number) {
    return new Intl.NumberFormat('pt-BR').format(mileage);
  }

  percentage(value: number, total: number) {
    return total ? Math.round((value / total) * 100) : 0;
  }
}
