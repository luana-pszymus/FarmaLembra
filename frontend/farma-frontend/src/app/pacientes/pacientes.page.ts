import { CommonModule } from '@angular/common';
import { Component, inject, ChangeDetectorRef } from '@angular/core';
import type { OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { IonContent, IonSpinner } from '@ionic/angular';

import type { CodigoVinculoDiscord, Paciente } from '../services/paciente.service';
import { PacienteService } from '../services/paciente.service';

@Component({
  selector: 'app-pacientes',
  templateUrl: './pacientes.page.html',
  styleUrls: ['./pacientes.page.scss'],
  imports: [CommonModule, IonContent, IonSpinner, FormsModule],
})
export class PacientesPage implements OnInit {
  private readonly pacienteService = inject(PacienteService);
  private readonly cdr = inject(ChangeDetectorRef);

  pacientes: Paciente[] = [];

  carregando = false;
  salvando = false;

  mensagemErro = '';
  mensagemFormulario = '';

  mostrarFormulario = false;
  editandoId: number | null = null;

  codigosDiscord: Record<number, CodigoVinculoDiscord> = {};
  gerandoCodigoId: number | null = null;
  mensagemDiscord: Record<number, string> = {};

  novoPaciente = {
    nome: '',
    telefone: '',
    data_nascimento: '',
  };

  ngOnInit(): void {
    this.carregarPacientes();
  }

  // Listar pacientes
  carregarPacientes(): void {
    this.carregando = true;
    this.mensagemErro = '';

    this.pacienteService.listar().subscribe({
      next: (dados: Paciente[]): void => {
        this.pacientes = dados;
        this.carregando = false;
        this.cdr.detectChanges();
      },
      error: (erro: unknown): void => {
        console.error('Erro ao carregar pacientes:', erro);

        this.mensagemErro = 'Não foi possível carregar os pacientes. Tente novamente.';

        this.carregando = false;
        this.cdr.detectChanges();
      },
    });
  }

  // Abrir formulário de cadastro
  abrirFormulario(): void {
    this.editandoId = null;
    this.mostrarFormulario = true;
    this.mensagemFormulario = '';

    this.novoPaciente = {
      nome: '',
      telefone: '',
      data_nascimento: '',
    };
  }

  // Abrir formulário de edição
  editarPaciente(paciente: Paciente): void {
    this.editandoId = paciente.id;
    this.mostrarFormulario = true;
    this.mensagemFormulario = '';

    this.novoPaciente = {
      nome: paciente.nome,
      telefone: paciente.telefone || '',
      data_nascimento: this.formatarDataBrasileira(paciente.data_nascimento),
    };
  }

  // Cancelar cadastro ou edição
  cancelarCadastro(): void {
    this.mostrarFormulario = false;
    this.mensagemFormulario = '';
    this.editandoId = null;

    this.novoPaciente = {
      nome: '',
      telefone: '',
      data_nascimento: '',
    };
  }

  // Formatar data enquanto o usuário digita
  formatarEntradaData(valor: string): void {
    let numeros = valor.replace(/\D/g, '').slice(0, 8);

    if (numeros.length > 4) {
      numeros = numeros.replace(/^(\d{2})(\d{2})(\d{0,4})$/, '$1/$2/$3');
    } else if (numeros.length > 2) {
      numeros = numeros.replace(/^(\d{2})(\d{0,2})$/, '$1/$2');
    }

    this.novoPaciente.data_nascimento = numeros;
  }

  // Converter AAAA-MM-DD para DD/MM/AAAA
  formatarDataBrasileira(data: string | null): string {
    if (!data) return '';

    const [ano, mes, dia] = data.split('-');

    return `${dia}/${mes}/${ano}`;
  }

  // Converter DD/MM/AAAA para AAAA-MM-DD
  converterDataISO(data: string): string | null {
    if (!data.trim()) return null;

    const partes = data.split('/');

    if (partes.length !== 3) return null;

    const [dia, mes, ano] = partes;

    if (!/^\d{2}$/.test(dia) || !/^\d{2}$/.test(mes) || !/^\d{4}$/.test(ano)) {
      return null;
    }

    const dataTeste = new Date(Number(ano), Number(mes) - 1, Number(dia));

    if (
      dataTeste.getFullYear() !== Number(ano) ||
      dataTeste.getMonth() !== Number(mes) - 1 ||
      dataTeste.getDate() !== Number(dia)
    ) {
      return null;
    }

    return `${ano}-${mes}-${dia}`;
  }

  // Validar e converter data antes de enviar à API
  validarData(): string | null | false {
    const dataDigitada = this.novoPaciente.data_nascimento.trim();

    if (!dataDigitada) return null;

    const dataISO = this.converterDataISO(dataDigitada);

    if (!dataISO) {
      this.mensagemFormulario = 'Informe uma data válida no formato DD/MM/AAAA.';
      return false;
    }

    return dataISO;
  }

  // Cadastrar paciente
  cadastrarPaciente(): void {
    if (!this.novoPaciente.nome.trim()) {
      this.mensagemFormulario = 'Informe o nome do paciente.';
      return;
    }

    this.mensagemFormulario = '';

    const dataISO = this.validarData();

    if (dataISO === false) return;

    this.salvando = true;

    const dados = {
      nome: this.novoPaciente.nome.trim(),
      telefone: this.novoPaciente.telefone.trim() || null,
      data_nascimento: dataISO,
    };

    this.pacienteService.criar(dados).subscribe({
      next: (paciente: Paciente) => {
        this.pacientes = [...this.pacientes, paciente];

        this.salvando = false;
        this.cancelarCadastro();

        this.cdr.detectChanges();
      },
      error: (erro: any) => {
        console.error('Erro ao cadastrar paciente:', erro);

        this.mensagemFormulario = erro.error?.detail || 'Não foi possível cadastrar o paciente.';

        this.salvando = false;
        this.cdr.detectChanges();
      },
    });
  }

  // Atualizar paciente
  atualizarPaciente(): void {
    if (!this.novoPaciente.nome.trim()) {
      this.mensagemFormulario = 'Informe o nome do paciente.';
      return;
    }

    if (this.editandoId === null) return;

    this.mensagemFormulario = '';

    const dataISO = this.validarData();

    if (dataISO === false) return;

    this.salvando = true;

    const dados = {
      nome: this.novoPaciente.nome.trim(),
      telefone: this.novoPaciente.telefone.trim() || null,
      data_nascimento: dataISO,
    };

    this.pacienteService.atualizar(this.editandoId, dados).subscribe({
      next: (paciente: Paciente) => {
        this.pacientes = this.pacientes.map((item) => (item.id === paciente.id ? paciente : item));

        this.salvando = false;
        this.cancelarCadastro();

        this.cdr.detectChanges();
      },
      error: (erro: any) => {
        console.error('Erro ao atualizar paciente:', erro);

        this.mensagemFormulario = erro.error?.detail || 'Não foi possível atualizar o paciente.';

        this.salvando = false;
        this.cdr.detectChanges();
      },
    });
  }

  // Excluir paciente
  excluirPaciente(paciente: Paciente): void {
    const confirmar = window.confirm(`Tem certeza que deseja excluir ${paciente.nome}?`);

    if (!confirmar) return;

    this.pacienteService.excluir(paciente.id).subscribe({
      next: () => {
        this.pacientes = this.pacientes.filter((item) => item.id !== paciente.id);
        delete this.codigosDiscord[paciente.id];
        delete this.mensagemDiscord[paciente.id];

        this.cdr.detectChanges();
      },
      error: (erro: any) => {
        console.error('Erro ao excluir paciente:', erro);

        this.mensagemErro = erro.error?.detail || 'Não foi possível excluir o paciente.';

        this.cdr.detectChanges();
      },
    });
  }

  // Gerar código de vinculação ao Discord
  gerarCodigoDiscord(paciente: Paciente): void {
    this.gerandoCodigoId = paciente.id;
    this.mensagemDiscord[paciente.id] = '';
    delete this.codigosDiscord[paciente.id];

    this.pacienteService.gerarCodigoDiscord(paciente.id).subscribe({
      next: (resposta: CodigoVinculoDiscord) => {
        this.codigosDiscord[paciente.id] = resposta;
        this.gerandoCodigoId = null;
        this.cdr.detectChanges();
      },
      error: (erro: any) => {
        console.error('Erro ao gerar código Discord:', erro);

        if (erro.status === 409) {
          this.mensagemDiscord[paciente.id] =
            'Este paciente já está vinculado ao Discord. Não é necessário gerar outro código.';
        } else if (erro.status === 404) {
          this.mensagemDiscord[paciente.id] = 'Paciente não encontrado ou sem acesso a este cadastro.';
        } else {
          this.mensagemDiscord[paciente.id] = erro.error?.detail || 'Não foi possível gerar o código. Tente novamente.';
        }

        this.gerandoCodigoId = null;
        this.cdr.detectChanges();
      },
    });
  }

  // Copiar código
  async copiarCodigo(codigo: string): Promise<void> {
    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(codigo);
      } else {
        const textarea = document.createElement('textarea');

        textarea.value = codigo;
        textarea.style.position = 'fixed';
        textarea.style.opacity = '0';

        document.body.appendChild(textarea);
        textarea.select();

        const copiado = document.execCommand('copy');

        document.body.removeChild(textarea);

        if (!copiado) {
          throw new Error('Falha ao copiar código.');
        }
      }

      alert('Código copiado! Agora use o comando /vincular no Discord.');
    } catch (erro) {
      console.error('Erro ao copiar código:', erro);
      alert('Não foi possível copiar automaticamente. Selecione e copie o código.');
    }
  }

  // Formatar validade do código
  formatarExpiracao(data: string): string {
    return new Date(data).toLocaleTimeString('pt-BR', {
      hour: '2-digit',
      minute: '2-digit',
    });
  }
}
