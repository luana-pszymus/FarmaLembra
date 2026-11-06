import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import type { Observable } from 'rxjs';

import { environment } from '../../environments/environment';

export interface Medicamento {
  id: number;
  nome: string;
  dosagem: string;
  forma_farmaceutica: string;
  descricao: string | null;
}

export interface MedicamentoCreate {
  nome: string;
  dosagem: string;
  forma_farmaceutica: string;
  descricao?: string | null;
}

@Injectable({
  providedIn: 'root',
})
export class MedicamentoService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = environment.apiUrl;

  listar(): Observable<Medicamento[]> {
    return this.http.get<Medicamento[]>(`${this.apiUrl}/medicamentos/`);
  }

  buscar(id: number): Observable<Medicamento> {
    return this.http.get<Medicamento>(`${this.apiUrl}/medicamentos/${id}`);
  }

  criar(dados: MedicamentoCreate): Observable<Medicamento> {
    return this.http.post<Medicamento>(`${this.apiUrl}/medicamentos/`, dados);
  }

  atualizar(id: number, dados: MedicamentoCreate): Observable<Medicamento> {
    return this.http.put<Medicamento>(`${this.apiUrl}/medicamentos/${id}`, dados);
  }

  excluir(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/medicamentos/${id}`);
  }
}
