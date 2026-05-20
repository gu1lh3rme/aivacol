import { ChangeDetectionStrategy, Component, input } from '@angular/core';

@Component({
  selector: 'app-empty-state',
  standalone: true,
  template: '<p class="empty">{{ message() }}</p>',
  styles: '.empty { text-align:center; color:#666; padding: 32px 0; }',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EmptyStateComponent {
  readonly message = input('Nenhum resultado encontrado.');
}
