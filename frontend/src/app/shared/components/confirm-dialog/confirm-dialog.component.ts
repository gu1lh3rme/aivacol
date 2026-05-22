import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';

export interface ConfirmDialogData {
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
}

@Component({
  selector: 'app-confirm-dialog',
  standalone: true,
  imports: [MatDialogModule, MatButtonModule, MatIconModule],
  template: `
    <h2 mat-dialog-title class="dialog-title">
      <mat-icon>warning</mat-icon>
      {{ data.title }}
    </h2>
    <mat-dialog-content class="dialog-content">{{ data.message }}</mat-dialog-content>
    <mat-dialog-actions align="end">
      <button mat-stroked-button type="button" class="cancel-button" (click)="dialogRef.close(false)">
        {{ data.cancelLabel ?? 'Cancelar' }}
      </button>
      <button mat-flat-button type="button" class="confirm-button" (click)="dialogRef.close(true)">
        {{ data.confirmLabel ?? 'Excluir' }}
      </button>
    </mat-dialog-actions>
  `,
  styles: `
    .dialog-title {
      display: flex;
      align-items: center;
      gap: 10px;
      margin: 0;
      color: #2c2c2c;
      font-weight: 700;
    }

    .dialog-title mat-icon {
      width: 30px;
      height: 30px;
      font-size: 30px;
      color: #de8a00;
      background: #fff2cf;
      border-radius: 8px;
      padding: 4px;
    }

    .dialog-content {
      color: #474747;
      line-height: 1.45;
      margin-bottom: 6px;
    }

    .cancel-button {
      border-color: rgba(61, 61, 61, 0.32);
      color: #3d3d3d;
    }

    .confirm-button {
      background: linear-gradient(135deg, #f4b11b 0%, #ff9f1c 100%) !important;
      color: #262626 !important;
      font-weight: 700;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ConfirmDialogComponent {
  readonly data = inject<ConfirmDialogData>(MAT_DIALOG_DATA);
  readonly dialogRef = inject(MatDialogRef<ConfirmDialogComponent, boolean>);
}
