import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface DoseProgramada {
  id: number;
  prescricao_id: number;
  agendado_para: string;
  status: string;
}

export interface RegistroTomadaCreate {
  resultado: 'tomada' | 'nao_tomada';
  observacao?: string | null;
}

export interface RegistroTomada {
  id: number;
  dose_programada_id: number;
  resultado: string;
  origem: 'manual' | 'automatica';
  confirmado_em: string;
  observacao: string | null;
}

export interface HistoricoDose {
  dose_id: number;
  prescricao_id: number;
  agendado_para: string;
  status: string;
  resultado: string;
  origem: 'manual' | 'automatica';
  confirmado_em: string;
  observacao: string | null;
}

@Injectable({
  providedIn: 'root',
})
export class DosesService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = environment.apiUrl;

  listarPorPaciente(pacienteId: number, dataInicio?: string, dataFim?: string): Observable<DoseProgramada[]> {
    let url = `${this.apiUrl}/doses/paciente/${pacienteId}`;

    const parametros: string[] = [];

    if (dataInicio) {
      parametros.push(`data_inicio=${encodeURIComponent(dataInicio)}`);
    }

    if (dataFim) {
      parametros.push(`data_fim=${encodeURIComponent(dataFim)}`);
    }

    if (parametros.length > 0) {
      url += `?${parametros.join('&')}`;
    }

    return this.http.get<DoseProgramada[]>(url);
  }

  confirmar(doseId: number, dados: RegistroTomadaCreate): Observable<RegistroTomada> {
    return this.http.post<RegistroTomada>(`${this.apiUrl}/doses/${doseId}/confirmar`, dados);
  }

  listarHistoricoPorPaciente(pacienteId: number): Observable<HistoricoDose[]> {
    return this.http.get<HistoricoDose[]>(`${this.apiUrl}/doses/paciente/${pacienteId}/historico`);
  }
}
