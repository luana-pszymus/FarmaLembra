import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AlertController, IonButton, IonContent, IonSpinner } from '@ionic/angular';
import { updateProfile } from 'firebase/auth';

import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
  imports: [FormsModule, IonContent, IonButton, IonSpinner],
})
export class LoginPage {
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);
  private readonly alertController = inject(AlertController);

  modoCadastro = false;
  mostrarSenha = false;
  carregando = false;

  nome = '';
  email = '';
  senha = '';
  confirmarSenha = '';

  mensagemErro = '';

  alternarModo(): void {
    this.modoCadastro = !this.modoCadastro;
    this.mensagemErro = '';
    this.senha = '';
    this.confirmarSenha = '';
  }

  async entrar(): Promise<void> {
    this.mensagemErro = '';

    if (!this.email || !this.senha) {
      this.mensagemErro = 'Preencha seu e-mail e sua senha.';
      return;
    }

    if (this.modoCadastro) {
      if (!this.nome.trim()) {
        this.mensagemErro = 'Informe seu nome.';
        return;
      }

      if (this.senha.length < 6) {
        this.mensagemErro = 'A senha precisa ter pelo menos 6 caracteres.';
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
        const resultado = await this.authService.cadastrar(this.email.trim(), this.senha);

        await updateProfile(resultado.user, {
          displayName: this.nome.trim(),
        });
      } else {
        await this.authService.entrar(this.email.trim(), this.senha);
      }

      await this.router.navigateByUrl('/tabs/home', {
        replaceUrl: true,
      });
    } catch (erro: unknown) {
      this.mensagemErro = this.tratarErro(erro);
    } finally {
      this.carregando = false;
    }
  }

  async entrarComGoogle(): Promise<void> {
    this.mensagemErro = '';
    this.carregando = true;

    try {
      await this.authService.entrarComGoogle();

      await this.router.navigateByUrl('/tabs/home', {
        replaceUrl: true,
      });
    } catch (erro: unknown) {
      this.mensagemErro = this.tratarErro(erro);
    } finally {
      this.carregando = false;
    }
  }

  async recuperarSenha(): Promise<void> {
    const alerta = await this.alertController.create({
      header: 'Recuperar senha',
      message: 'Informe seu e-mail para receber o link de recuperação.',
      inputs: [
        {
          name: 'email',
          type: 'email',
          placeholder: 'Seu e-mail',
          value: this.email,
        },
      ],
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel',
        },
        {
          text: 'Enviar',
          handler: async (dados) => {
            if (!dados.email?.trim()) {
              return false;
            }

            try {
              await this.authService.recuperarSenha(dados.email.trim());

              await this.mostrarAlerta(
                'E-mail enviado',
                'Se o endereço estiver cadastrado, você receberá as instruções para redefinir sua senha.',
              );
            } catch (erro: unknown) {
              await this.mostrarAlerta('Não foi possível enviar', this.tratarErro(erro));
            }

            return true;
          },
        },
      ],
    });

    await alerta.present();
  }

  private async mostrarAlerta(titulo: string, mensagem: string): Promise<void> {
    const alerta = await this.alertController.create({
      header: titulo,
      message: mensagem,
      buttons: ['OK'],
    });

    await alerta.present();
  }

  private tratarErro(erro: unknown): string {
    const codigo = typeof erro === 'object' && erro !== null && 'code' in erro ? String(erro.code) : '';

    const mensagens: Record<string, string> = {
      'auth/invalid-email': 'O e-mail informado é inválido.',
      'auth/user-not-found': 'Não encontramos uma conta com esse e-mail.',
      'auth/wrong-password': 'A senha está incorreta.',
      'auth/invalid-credential': 'E-mail ou senha incorretos.',
      'auth/email-already-in-use': 'Esse e-mail já possui uma conta.',
      'auth/weak-password': 'Escolha uma senha mais forte.',
      'auth/popup-closed-by-user': 'A janela do Google foi fechada.',
      'auth/popup-blocked': 'O navegador bloqueou a janela de login.',
      'auth/unauthorized-domain': 'Este domínio não está autorizado no Firebase.',
      'auth/too-many-requests': 'Muitas tentativas. Tente novamente mais tarde.',
      'auth/network-request-failed': 'Verifique sua conexão com a internet.',
    };

    return mensagens[codigo] || 'Não foi possível realizar a operação. Tente novamente.';
  }
}
