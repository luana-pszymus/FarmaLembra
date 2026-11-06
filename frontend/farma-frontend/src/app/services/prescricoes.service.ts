import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import { environment } from '../../environments/environment';

export interface Prescricao {
  id: number;
  paciente_id: number;
  medicamento_id: number;

  origem_informacao: 'manual' | 'receita_medica';

  modo_agendamento: 'horarios_fixos' | 'intervalo';
  intervalo_horas: number | null;

  frequencia: string | null;
  horarios: string[] | null;
  dias_semana: number[] | null;

  horario_inicial: string | null;

  quantidade_por_dose: number;
  unidade_quantidade: string;

  tipo_duracao: 'temporario' | 'continuo';

  data_inicio: string;
  data_fim: string | null;
  data_reavaliacao: string | null;

  orientacoes: string | null;

  status: string;
}

export interface PrescricaoCreate {
  paciente_id: number;
  medicamento_id: number;

  origem_informacao: 'manual' | 'receita_medica';

  modo_agendamento: 'horarios_fixos' | 'intervalo';
  intervalo_horas?: number | null;

  frequencia?: string | null;
  horarios?: string[] | null;
  dias_semana?: number[] | null;

  horario_inicial?: string | null;

  quantidade_por_dose: number;
  unidade_quantidade: string;

  tipo_duracao: 'temporario' | 'continuo';

  data_inicio: string;
  data_fim?: string | null;
  data_reavaliacao?: string | null;

  orientacoes?: string | null;
}

@Injectable({
  providedIn: 'root',
})
export class PrescricaoService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = environment.apiUrl;

  listar(): Observable<Prescricao[]> {
    return this.http.get<Prescricao[]>(`${this.apiUrl}/prescricoes/`);
  }

  buscar(id: number): Observable<Prescricao> {
    return this.http.get<Prescricao>(`${this.apiUrl}/prescricoes/${id}`);
  }

  criar(dados: PrescricaoCreate): Observable<Prescricao> {
    return this.http.post<Prescricao>(`${this.apiUrl}/prescricoes/`, dados);
  }

  atualizar(id: number, dados: PrescricaoCreate): Observable<Prescricao> {
    return this.http.put<Prescricao>(`${this.apiUrl}/prescricoes/${id}`, dados);
  }

  excluir(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/prescricoes/${id}`);
  }
}
