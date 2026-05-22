import { ChangeDetectionStrategy, Component } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-history-page',
  standalone: true,
  imports: [MatCardModule, MatIconModule],
  templateUrl: './history-page.component.html',
  styleUrl: './history-page.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HistoryPageComponent {
  readonly metrics = [
    { label: 'Eventos hoje', value: '14', icon: 'bolt' },
    { label: 'Alterações de cadastro', value: '6', icon: 'edit_note' },
    { label: 'Exclusões auditadas', value: '3', icon: 'delete_forever' },
  ];

  readonly events = [
    {
      time: '09:12',
      title: 'Veículo atualizado',
      detail: 'Placa ABC1D23 teve quilometragem e cor ajustadas.',
      actor: 'Juliana',
    },
    {
      time: '10:45',
      title: 'Modelo criado',
      detail: 'Novo modelo adicionado à marca Toyota.',
      actor: 'Paulo',
    },
    {
      time: '13:20',
      title: 'Veículo excluído',
      detail: 'Registro obsoleto removido após conferência operacional.',
      actor: 'Equipe de frota',
    },
  ];
}