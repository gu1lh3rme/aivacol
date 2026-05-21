import { ChangeDetectionStrategy, Component } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressBarModule } from '@angular/material/progress-bar';

@Component({
  selector: 'app-home-page',
  standalone: true,
  imports: [MatCardModule, MatIconModule, MatProgressBarModule],
  templateUrl: './home-page.component.html',
  styleUrl: './home-page.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HomePageComponent {
  readonly cards = [
    { title: 'Veículos Cadastrados', value: '128', icon: 'directions_car', trend: '+12% no mês' },
    { title: 'Em Manutenção', value: '9', icon: 'build', trend: '2 vencendo hoje' },
    { title: 'Taxa de Disponibilidade', value: '92%', icon: 'verified', trend: '+3 p.p.' },
    { title: 'Custos Operacionais', value: 'R$ 84 mil', icon: 'payments', trend: '-4% vs mês anterior' },
  ];

  readonly healthByArea = [
    { area: 'Logística', value: 88 },
    { area: 'Comercial', value: 94 },
    { area: 'Operações', value: 79 },
  ];
}
