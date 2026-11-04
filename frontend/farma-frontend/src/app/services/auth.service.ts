
import { Injectable } from '@angular/core';
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  sendPasswordResetEmail,
  updatePassword,
  signOut,
  onAuthStateChanged,
  User,
  getAuth,
} from 'firebase/auth';
import { initializeApp } from 'firebase/app';
import { BehaviorSubject } from 'rxjs';

import { environment } from '../../environments/environment';

// Inicializa a conexão com o Firebase
const firebaseApp = initializeApp(environment.firebase);
const firebaseAuth = getAuth(firebaseApp);

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  // Guarda o usuário atualmente conectado
  private usuarioSubject = new BehaviorSubject<User | null>(null);

  // Permite que outras telas acompanhem o usuário
  usuario$ = this.usuarioSubject.asObservable();

  constructor() {
    // Observa mudanças no estado de autenticação
    onAuthStateChanged(firebaseAuth, (usuario) => {
      this.usuarioSubject.next(usuario);
    });
  }

  // Cadastro com e-mail e senha
  cadastrar(email: string, senha: string) {
    return createUserWithEmailAndPassword(
      firebaseAuth,
      email,
      senha,
    );
  }

  // Login com e-mail e senha
  entrar(email: string, senha: string) {
    return signInWithEmailAndPassword(
      firebaseAuth,
      email,
      senha,
    );
  }

  // Login com conta Google
  entrarComGoogle() {
    const provedor = new GoogleAuthProvider();

    return signInWithPopup(firebaseAuth, provedor);
  }

  // Envia e-mail para recuperação de senha
  recuperarSenha(email: string) {
    return sendPasswordResetEmail(firebaseAuth, email);
  }

  // Altera a senha do usuário conectado
  alterarSenha(novaSenha: string) {
    const usuario = firebaseAuth.currentUser;

    if (!usuario) {
      throw new Error('Nenhum usuário está conectado.');
    }

    return updatePassword(usuario, novaSenha);
  }

  // Encerra a sessão
  sair() {
    return signOut(firebaseAuth);
  }

  // Retorna o usuário conectado
  get usuarioAtual(): User | null {
    return firebaseAuth.currentUser;
  }

  // Informa se existe usuário conectado
  get estaLogado(): boolean {
    return firebaseAuth.currentUser !== null;
  }
}
