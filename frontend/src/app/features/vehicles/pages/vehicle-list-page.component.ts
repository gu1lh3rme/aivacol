import { ChangeDetectionStrategy, Component, ViewChild, effect, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatPaginator, MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { debounceTime } from 'rxjs';
import { EmptyStateComponent } from '../../../shared/components/empty-state/empty-state.component';
import { VehiclesApiService } from '../services/vehicles-api.service';
import { VehiclesStateService } from '../services/vehicles-state.service';

@Component({
  selector: 'app-vehicle-list-page',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    MatButtonModule,
    MatFormFieldModule,
    MatIconModule,
    MatInputModule,
    MatPaginatorModule,
    MatProgressBarModule,
    MatTableModule,
    EmptyStateComponent,
  ],
  templateUrl: './vehicle-list-page.component.html',
  styleUrl: './vehicle-list-page.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class VehicleListPageComponent {
  private readonly formBuilder = inject(FormBuilder);
  private readonly router = inject(Router);
  private readonly api = inject(VehiclesApiService);
  readonly state = inject(VehiclesStateService);

  @ViewChild(MatPaginator) paginator?: MatPaginator;

  readonly displayedColumns = ['plate', 'brand', 'model', 'year', 'actions'];
  readonly dataSource = new MatTableDataSource(this.state.vehicles());

  readonly filtersForm = this.formBuilder.nonNullable.group({
    plate: [''],
    brand: [''],
    model: [''],
  });

  constructor() {
    this.state.updateFilters({ page: 1 });

    this.filtersForm.valueChanges.pipe(debounceTime(300)).subscribe((values) => {
      this.state.updateFilters({
        plate: values.plate ?? '',
        brand: values.brand ?? '',
        model: values.model ?? '',
        page: 1,
      });
      this.dataSource.data = this.state.vehicles();
    });

    effect(() => {
      this.dataSource.data = this.state.vehicles();
    });
  }

  changePage(event: PageEvent) {
    this.state.updateFilters({ page: event.pageIndex + 1, pageSize: event.pageSize });
  }

  goToCreate() {
    void this.router.navigate(['/vehicles/new']);
  }

  editVehicle(id: number) {
    void this.router.navigate(['/vehicles', id, 'edit']);
  }

  deleteVehicle(id: number, plate: string) {
    const confirmed = window.confirm(
      `Deseja realmente excluir o veículo ${plate}?`,
    );

    if (!confirmed) {
      return;
    }

    this.loading.set(true);
    this.api
      .remove(id)
      .pipe(finalize(() => this.loading.set(false)))
      .subscribe(() => {
        this.state.updateFilters({ page: this.state.filters().page });
      });
  }
}
