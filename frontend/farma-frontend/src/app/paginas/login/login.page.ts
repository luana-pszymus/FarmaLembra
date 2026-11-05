import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AlertController, IonContent, IonButton, IonSpinner } from '@ionic/angular';
import { Router } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';

import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
  imports: [CommonModule, FormsModule, IonContent, IonButton, IonSpinner],
})
export class LoginPage {
  modoCadastro = false;
  mostrarSenha = false;
  carregando = false;

  nome = '';
  email = '';
  senha = '';
  confirmarSenha = '';

  mensagemErro = '';

  constructor(
    private authService: AuthService,
    private router: Router,
    private alertController: AlertController,
  ) {}

  alternarModo() {
    this.modoCadastro = !this.modoCadastro;
    this.mensagemErro = '';
    this.senha = '';
    this.confirmarSenha = '';
  }

  async entrar() {
    this.mensagemErro = '';

    if (!this.email.trim() || !this.senha) {
      this.mensagemErro = 'Preencha seu e-mail e sua senha.';
      return;
    }

    if (this.modoCadastro) {
      if (!this.nome.trim()) {
        this.mensagemErro = 'Informe seu nome.';
        return;
      }

      if (this.senha.length < 8) {
        this.mensagemErro = 'A senha precisa ter pelo menos 8 caracteres.';
        return;
      }

      if (this.senha !== this.confirmarSenha) {
        this.mensagemErro = 'As senhas não coincidem.';
        return;
      }
    }

    this.carregando = true;

    try {
      if (this.modoCadastro) {
        await this.authService.cadastrar(this.nome.trim(), this.email.trim(), this.senha);

        // Após cadastrar, realiza o login automaticamente.
        await this.authService.entrar(this.email.trim(), this.senha);
      } else {
        await this.authService.entrar(this.email.trim(), this.senha);
      }

      await this.router.navigateByUrl('/tabs/home', {
        replaceUrl: true,
      });
    } catch (erro: unknown) {
      console.error('Erro ao realizar login:', erro);

      if (erro instanceof HttpErrorResponse) {
        console.log('Status HTTP:', erro.status);
        console.log('Resposta do servidor:', erro.error);
        console.log('Mensagem:', erro.message);
      }
      this.mensagemErro = this.tratarErro(erro);
    } finally {
      this.carregando = false;
    }
  }

  async entrarComGoogle() {
    await this.mostrarAlerta('Indisponível no momento', 'O login com Google ainda não está integrado ao sistema.');
  }

  async recuperarSenha() {
    await this.mostrarAlerta('Recuperação de senha', 'A recuperação de senha ainda será implementada no backend.');
  }

  private async mostrarAlerta(titulo: string, mensagem: string) {
    const alerta = await this.alertController.create({
      header: titulo,
      message: mensagem,
      buttons: ['OK'],
    });

    await alerta.present();
  }

  private tratarErro(erro: unknown): string {
    if (erro instanceof HttpErrorResponse) {
      if (erro.status === 0) {
        return 'Não foi possível conectar ao servidor. Verifique se o backend está funcionando.';
      }

      if (erro.status === 401) {
        return 'E-mail ou senha incorretos.';
      }

      if (erro.status === 409) {
        return 'Esse e-mail já possui uma conta.';
      }

      if (erro.status === 422) {
        return 'Os dados informados são inválidos. Confira o e-mail e a senha.';
      }

      if (erro.status >= 500) {
        return 'Ocorreu um erro no servidor. Tente novamente mais tarde.';
      }
    }

    return 'Não foi possível realizar a operação. Tente novamente.';
  }
}
