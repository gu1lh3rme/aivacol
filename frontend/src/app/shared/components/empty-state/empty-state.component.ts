import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-empty-state',
  standalone: true,
  imports: [MatIconModule],
  template: `
    <section class="empty-state">
      <div class="empty-state__icon">
        <mat-icon>{{ icon() }}</mat-icon>
      </div>
      <h3>{{ title() }}</h3>
      <p>{{ message() }}</p>
    </section>
  `,
  styles: `
    .empty-state {
      display: grid;
      justify-items: center;
      gap: 10px;
      text-align: center;
      color: #5d5d5d;
      padding: 40px 20px;
      background: linear-gradient(180deg, rgba(255, 250, 240, 0.85), rgba(255, 255, 255, 0.9));
      border: 1px solid rgba(255, 159, 28, 0.16);
      border-radius: 18px;
    }

    .empty-state__icon {
      width: 56px;
      height: 56px;
      display: grid;
      place-items: center;
      border-radius: 16px;
      background: #fff1c8;
      color: #c07a00;
    }

    h3,
    p {
      margin: 0;
    }

    p {
      max-width: 540px;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EmptyStateComponent {
  readonly title = input('Nada por aqui');
  readonly message = input('Nenhum resultado encontrado.');
  readonly icon = input('inbox');
}
