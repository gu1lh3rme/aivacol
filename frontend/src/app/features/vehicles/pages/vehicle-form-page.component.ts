import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSelectModule } from '@angular/material/select';
import { finalize } from 'rxjs';
import { Brand, VehicleModel } from '../../../core/models/vehicle.models';
import { VehiclesApiService } from '../services/vehicles-api.service';

@Component({
  selector: 'app-vehicle-form-page',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatProgressSpinnerModule,
    MatSelectModule,
  ],
  templateUrl: './vehicle-form-page.component.html',
  styleUrl: './vehicle-form-page.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class VehicleFormPageComponent {
  private readonly formBuilder = inject(FormBuilder);
  private readonly api = inject(VehiclesApiService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);

  readonly loading = signal(false);
  readonly loadingModels = signal(false);
  readonly brands = signal<Brand[]>([]);
  readonly models = signal<VehicleModel[]>([]);
  readonly imagePreview = signal<string>('');
  readonly isEdit = computed(() => Boolean(this.route.snapshot.paramMap.get('id')));

  readonly form = this.formBuilder.nonNullable.group({
    plate: ['', [Validators.required, Validators.pattern(/^[A-Z]{3}[0-9][A-Z0-9][0-9]{2}$|^[A-Z]{3}-?[0-9]{4}$/)]],
    brandId: [0, [Validators.required, Validators.min(1)]],
    modelId: [0, [Validators.required, Validators.min(1)]],
    year: [new Date().getFullYear(), [Validators.required, Validators.min(1900)]],
    color: ['', [Validators.required, Validators.maxLength(30)]],
    mileage: [0, [Validators.required, Validators.min(0)]],
    imageUrl: [''],
  });

  constructor() {
    this.loadBrands();
    this.form.controls.brandId.valueChanges.subscribe((brandId) => {
      if (!brandId) return;
      this.loadModels(brandId);
      this.form.controls.modelId.setValue(0);
    });

    const vehicleId = Number(this.route.snapshot.paramMap.get('id'));
    if (vehicleId) {
      this.loading.set(true);
      this.api
        .getById(vehicleId)
        .pipe(finalize(() => this.loading.set(false)))
        .subscribe((vehicle) => {
          this.loadModels(vehicle.brandId);
          this.form.patchValue(vehicle);
          this.imagePreview.set(vehicle.imageUrl ?? '');
        });
    }
  }

  private loadBrands() {
    this.api.getBrands().subscribe((brands) => this.brands.set(brands));
  }

  private loadModels(brandId: number) {
    this.loadingModels.set(true);
    this.api
      .getModelsByBrand(brandId)
      .pipe(finalize(() => this.loadingModels.set(false)))
      .subscribe((models) => this.models.set(models));
  }

  onImageSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      this.imagePreview.set(String(reader.result));
      this.form.controls.imageUrl.setValue(String(reader.result));
    };
    reader.readAsDataURL(file);
  }

  cancel() {
    if (this.form.dirty && !window.confirm('Existem alterações não salvas. Deseja realmente cancelar?')) {
      return;
    }
    void this.router.navigate(['/vehicles']);
  }

  save() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const payload = this.form.getRawValue();
    const vehicleId = Number(this.route.snapshot.paramMap.get('id'));
    this.loading.set(true);

    const request$ = vehicleId ? this.api.update(vehicleId, payload) : this.api.create(payload);
    request$.pipe(finalize(() => this.loading.set(false))).subscribe(() => {
      void this.router.navigate(['/vehicles']);
    });
  }
}
