import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
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

  constructor(private http: HttpClient) {}

  listar(): Observable<Paciente[]> {
    return this.http.get<Paciente[]>(`${this.apiUrl}/pacientes/`);
  }

  criar(dados: PacienteCreate): Observable<Paciente> {
    return this.http.post<Paciente>(`${this.apiUrl}/pacientes/`, dados);
  }
}
