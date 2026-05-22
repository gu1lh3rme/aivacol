import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatSelectModule } from '@angular/material/select';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatTableModule } from '@angular/material/table';
import { MatTabsModule } from '@angular/material/tabs';
import { finalize, forkJoin } from 'rxjs';
import { CatalogApiService } from '../../../core/services/catalog-api.service';
import { Brand, VehicleModel } from '../../../core/models/vehicle.models';
import { ConfirmDialogComponent } from '../../../shared/components/confirm-dialog/confirm-dialog.component';

@Component({
  selector: 'app-catalog-page',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    MatButtonModule,
    MatCardModule,
    MatDialogModule,
    MatFormFieldModule,
    MatIconModule,
    MatInputModule,
    MatProgressBarModule,
    MatSelectModule,
    MatSnackBarModule,
    MatTableModule,
    MatTabsModule,
  ],
  templateUrl: './catalog-page.component.html',
  styleUrl: './catalog-page.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CatalogPageComponent {
  private readonly fb = inject(FormBuilder);
  private readonly api = inject(CatalogApiService);
  private readonly dialog = inject(MatDialog);
  private readonly snackBar = inject(MatSnackBar);

  readonly loading = signal(false);
  readonly brands = signal<Brand[]>([]);
  readonly models = signal<VehicleModel[]>([]);
  readonly editingBrandId = signal<number | null>(null);
  readonly editingModelId = signal<number | null>(null);

  readonly brandColumns = ['name', 'models', 'actions'];
  readonly modelColumns = ['name', 'brand', 'actions'];

  readonly brandForm = this.fb.nonNullable.group({
    name: ['', [Validators.required, Validators.minLength(2)]],
  });

  readonly modelForm = this.fb.nonNullable.group({
    name: ['', [Validators.required, Validators.minLength(2)]],
    brandId: [0, [Validators.required, Validators.min(1)]],
  });

  readonly sortedBrands = computed(() => [...this.brands()].sort((left, right) => left.name.localeCompare(right.name)));
  readonly sortedModels = computed(() => [...this.models()].sort((left, right) => left.name.localeCompare(right.name)));

  constructor() {
    void this.loadData();
  }

  async loadData() {
    this.loading.set(true);

    forkJoin({ brands: this.api.listBrands(), models: this.api.listModels() })
      .pipe(finalize(() => this.loading.set(false)))
      .subscribe(({ brands, models }) => {
        this.brands.set(brands);
        this.models.set(models);
      });
  }

  editBrand(brand: Brand) {
    this.editingBrandId.set(brand.id);
    this.brandForm.setValue({ name: brand.name });
  }

  cancelBrandEdit() {
    this.editingBrandId.set(null);
    this.brandForm.reset({ name: '' });
  }

  saveBrand() {
    if (this.brandForm.invalid) {
      this.brandForm.markAllAsTouched();
      return;
    }

    const payload = this.brandForm.getRawValue();
    const request$ = this.editingBrandId()
      ? this.api.updateBrand(this.editingBrandId() as number, payload)
      : this.api.createBrand(payload);

    request$.subscribe(() => {
      this.cancelBrandEdit();
      void this.loadData();
      this.snackBar.open('Marca salva com sucesso.', 'Fechar', { duration: 2400 });
    });
  }

  deleteBrand(brand: Brand) {
    this.dialog
      .open(ConfirmDialogComponent, {
        width: '420px',
        data: {
          title: 'Excluir marca',
          message: `Deseja excluir a marca ${brand.name}? Modelos vinculados também serão removidos.`,
          confirmLabel: 'Excluir',
          cancelLabel: 'Cancelar',
        },
      })
      .afterClosed()
      .subscribe((confirmed) => {
        if (!confirmed) {
          return;
        }

        this.api.deleteBrand(brand.id).subscribe(() => {
          void this.loadData();
          this.snackBar.open('Marca removida.', 'Fechar', { duration: 2400 });
        });
      });
  }

  editModel(model: VehicleModel) {
    this.editingModelId.set(model.id);
    this.modelForm.setValue({ name: model.name, brandId: model.brandId });
  }

  cancelModelEdit() {
    this.editingModelId.set(null);
    this.modelForm.reset({ name: '', brandId: 0 });
  }

  saveModel() {
    if (this.modelForm.invalid) {
      this.modelForm.markAllAsTouched();
      return;
    }

    const payload = this.modelForm.getRawValue();
    const request$ = this.editingModelId()
      ? this.api.updateModel(this.editingModelId() as number, payload)
      : this.api.createModel(payload);

    request$.subscribe(() => {
      this.cancelModelEdit();
      void this.loadData();
      this.snackBar.open('Modelo salvo com sucesso.', 'Fechar', { duration: 2400 });
    });
  }

  deleteModel(model: VehicleModel) {
    this.dialog
      .open(ConfirmDialogComponent, {
        width: '420px',
        data: {
          title: 'Excluir modelo',
          message: `Deseja excluir o modelo ${model.name}?`,
          confirmLabel: 'Excluir',
          cancelLabel: 'Cancelar',
        },
      })
      .afterClosed()
      .subscribe((confirmed) => {
        if (!confirmed) {
          return;
        }

        this.api.deleteModel(model.id).subscribe(() => {
          void this.loadData();
          this.snackBar.open('Modelo removido.', 'Fechar', { duration: 2400 });
        });
      });
  }

  brandName(brandId: number) {
    return this.brands().find((brand) => brand.id === brandId)?.name ?? 'Sem marca';
  }

  modelCount(brandId: number) {
    return this.models().filter((model) => model.brandId === brandId).length;
  }
}