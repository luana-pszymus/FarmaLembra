import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { environment } from '../../environments/environment';

interface UsuarioResponse {
  id: number;
  nome: string;
  email: string;
}

interface TokenResponse {
  access_token: string;
  token_type: string;
}

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  cadastrar(nome: string, email: string, senha: string) {
    return firstValueFrom(this.http.post<UsuarioResponse>(`${this.apiUrl}/usuarios/`, { nome, email, senha }));
  }

  async entrar(email: string, senha: string) {
    const dados = new URLSearchParams();

    dados.set('username', email);
    dados.set('password', senha);

    const resposta = await firstValueFrom(
      this.http.post<TokenResponse>(`${this.apiUrl}/auth/login`, dados.toString(), {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      }),
    );

    localStorage.setItem('access_token', resposta.access_token);

    return resposta;
  }

  sair() {
    localStorage.removeItem('access_token');
  }

  get token(): string | null {
    return localStorage.getItem('access_token');
  }

  get estaLogado(): boolean {
    return this.token !== null;
  }
}
