import { ChangeDetectionStrategy, Component, OnDestroy, ViewChild, effect, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatPaginator, MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatSelectModule } from '@angular/material/select';
import { MatTableModule } from '@angular/material/table';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { debounceTime, finalize } from 'rxjs';
import { ConfirmDialogComponent } from '../../../shared/components/confirm-dialog/confirm-dialog.component';
import { EmptyStateComponent } from '../../../shared/components/empty-state/empty-state.component';
import { VehiclesApiService } from '../services/vehicles-api.service';
import { VehiclesStateService } from '../services/vehicles-state.service';

@Component({
  selector: 'app-vehicle-list-page',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    MatButtonModule,
    MatButtonToggleModule,
    MatCardModule,
    MatFormFieldModule,
    MatIconModule,
    MatInputModule,
    MatDialogModule,
    MatPaginatorModule,
    MatProgressBarModule,
    MatSelectModule,
    MatSnackBarModule,
    MatTableModule,
    EmptyStateComponent,
  ],
  templateUrl: './vehicle-list-page.component.html',
  styleUrl: './vehicle-list-page.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class VehicleListPageComponent implements OnDestroy {
  private readonly formBuilder = inject(FormBuilder);
  private readonly router = inject(Router);
  private readonly api = inject(VehiclesApiService);
  private readonly dialog = inject(MatDialog);
  private readonly snackBar = inject(MatSnackBar);
  readonly state = inject(VehiclesStateService);

  @ViewChild(MatPaginator) paginator?: MatPaginator;

  readonly displayedColumns = ['plate', 'brand', 'model', 'year', 'mileage', 'status', 'actions'];

  readonly filtersForm = this.formBuilder.nonNullable.group({
    search: [''],
    brandId: [null as number | null],
    modelId: [null as number | null],
    year: [null as number | null],
    status: ['all' as 'all' | 'available' | 'maintenance' | 'archived'],
    sortBy: ['plate' as 'plate' | 'brand' | 'model' | 'year' | 'mileage'],
    sortDirection: ['asc' as 'asc' | 'desc'],
  });

  constructor() {
    this.state.updateFilters({ page: 1 });

    this.filtersForm.controls.brandId.valueChanges.subscribe(() => {
      this.filtersForm.controls.modelId.setValue(null);
    });

    this.filtersForm.valueChanges.pipe(debounceTime(250)).subscribe((values) => {
      this.state.updateFilters({
        search: values.search ?? '',
        brandId: values.brandId ?? null,
        modelId: values.modelId ?? null,
        year: values.year ?? null,
        status: values.status ?? 'all',
        sortBy: values.sortBy ?? 'plate',
        sortDirection: values.sortDirection ?? 'asc',
        page: 1,
      });
    });

    effect(() => {
      this.filtersForm.patchValue(
        {
          search: this.state.filters().search,
          brandId: this.state.filters().brandId,
          modelId: this.state.filters().modelId,
          year: this.state.filters().year,
          status: this.state.filters().status,
          sortBy: this.state.filters().sortBy,
          sortDirection: this.state.filters().sortDirection,
        },
        { emitEvent: false },
      );
    });
  }

  readonly brandOptions = this.state.brands;
  readonly modelOptions = this.state.availableModels;

  changePage(event: PageEvent) {
    this.state.updateFilters({ page: event.pageIndex + 1, pageSize: event.pageSize });
  }

  toggleView(viewMode: 'table' | 'cards') {
    this.state.setViewMode(viewMode);
  }

  clearFilters() {
    this.filtersForm.reset({
      search: '',
      brandId: null,
      modelId: null,
      year: null,
      status: 'all',
      sortBy: 'plate',
      sortDirection: 'asc',
    });
    this.state.clearFilters();
  }

  refresh() {
    void this.state.bootstrap().then(() => {
      this.snackBar.open('Lista atualizada.', 'Fechar', { duration: 2500 });
    });
  }

  goToCreate() {
    void this.router.navigate(['/vehicles/new']);
  }

  editVehicle(id: number) {
    void this.router.navigate(['/vehicles', id, 'edit']);
  }

  deleteVehicle(id: number, plate: string) {
    this.dialog
      .open(ConfirmDialogComponent, {
        width: '420px',
        data: {
          title: 'Excluir veículo',
          message: `Deseja realmente excluir o veículo ${plate}? Esta ação não poderá ser desfeita.`,
          confirmLabel: 'Excluir',
          cancelLabel: 'Cancelar',
        },
      })
      .afterClosed()
      .subscribe((confirmed) => {
        if (!confirmed) {
          return;
        }

        this.state.loading.set(true);
        this.api
          .remove(id)
          .pipe(finalize(() => this.state.loading.set(false)))
          .subscribe(() => {
            void this.state.bootstrap().then(() => {
              this.snackBar.open(`Veículo ${plate} removido.`, 'Fechar', { duration: 2800 });
            });
          });
      });
  }

  exportCsv() {
    const rows = this.state.filteredVehicles().map((vehicle) => ({
      Placa: vehicle.plate,
      Marca: vehicle.brand?.name ?? '-',
      Modelo: vehicle.model?.name ?? '-',
      Ano: vehicle.year,
      Cor: vehicle.color,
      Quilometragem: vehicle.mileage,
      Status: this.state.statusLabel(this.state.resolveStatus(vehicle)),
    }));

    if (!rows.length) {
      this.snackBar.open('Não há dados para exportar.', 'Fechar', { duration: 2500 });
      return;
    }

    const headers = Object.keys(rows[0]);
    const csvLines = [
      headers.join(';'),
      ...rows.map((row) =>
        headers
          .map((header) => `"${String(row[header as keyof typeof row]).replace(/"/g, '""')}"`)
          .join(';'),
      ),
    ];

    const blob = new Blob([csvLines.join('\n')], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = 'veiculos-aivacol.csv';
    anchor.click();
    URL.revokeObjectURL(url);

    this.snackBar.open('CSV exportado com sucesso.', 'Fechar', { duration: 2500 });
  }

  statusClass(vehicleStatus: 'available' | 'maintenance' | 'archived') {
    return `status-${vehicleStatus}`;
  }

  formatStatus(vehicleStatus: 'available' | 'maintenance' | 'archived') {
    return this.state.statusLabel(vehicleStatus);
  }

  formatMileage(mileage: number) {
    return new Intl.NumberFormat('pt-BR').format(mileage);
  }

  ngOnDestroy() {
    this.state.clearFilters();
  }
}
