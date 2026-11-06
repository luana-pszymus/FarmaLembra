import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import type { Observable } from 'rxjs';

import { environment } from '../../environments/environment';

export interface Paciente {
  id: number;
  usuario_id: number;
  nome: string;
  telefone: string | null;
  data_nascimento: string | null;
}

export interface PacienteCreate {
  nome: string;
  telefone: string | null;
  data_nascimento: string | null;
}

@Injectable({
  providedIn: 'root',
})
export class PacienteService {
  private apiUrl = environment.apiUrl;

  private http = inject(HttpClient);

  listar(): Observable<Paciente[]> {
    return this.http.get<Paciente[]>(`${this.apiUrl}/pacientes/`);
  }

  criar(dados: PacienteCreate): Observable<Paciente> {
    return this.http.post<Paciente>(`${this.apiUrl}/pacientes/`, dados);
  }

  atualizar(id: number, dados: PacienteCreate): Observable<Paciente> {
    return this.http.put<Paciente>(`${this.apiUrl}/pacientes/${id}`, dados);
  }

  excluir(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/pacientes/${id}`);
  }
}
