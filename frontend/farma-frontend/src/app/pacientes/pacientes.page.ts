import { CommonModule } from '@angular/common';
import { Component, inject, ChangeDetectorRef } from '@angular/core';
import type { OnInit } from '@angular/core';
import { IonContent, IonSpinner } from '@ionic/angular';
import { FormsModule } from '@angular/forms';

import type { Paciente } from '../services/paciente.service';
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
  mensagemErro = '';

  mostrarFormulario = false;
  salvando = false;

  novoPaciente = {
    nome: '',
    telefone: '',
    data_nascimento: '',
  };

  ngOnInit(): void {
    this.carregarPacientes();
  }

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

  abrirFormulario(): void {
    this.mostrarFormulario = true;
    this.mensagemErro = '';
  }

  cancelarCadastro(): void {
    this.mostrarFormulario = false;

    this.novoPaciente = {
      nome: '',
      telefone: '',
      data_nascimento: '',
    };
  }

  cadastrarPaciente(): void {
    if (!this.novoPaciente.nome.trim()) {
      this.mensagemErro = 'Informe o nome do paciente.';
      return;
    }

    this.salvando = true;
    this.mensagemErro = '';

    const dados = {
      nome: this.novoPaciente.nome.trim(),
      telefone: this.novoPaciente.telefone.trim() || null,
      data_nascimento: this.novoPaciente.data_nascimento || null,
    };

    this.pacienteService.criar(dados).subscribe({
      next: (paciente) => {
        this.pacientes = [...this.pacientes, paciente];

        this.salvando = false;
        this.mostrarFormulario = false;

        this.novoPaciente = {
          nome: '',
          telefone: '',
          data_nascimento: '',
        };

        this.cdr.detectChanges();
      },
      error: (erro) => {
        console.error('Erro ao cadastrar paciente:', erro);

        this.mensagemErro = erro.error?.detail || 'Não foi possível cadastrar o paciente.';

        this.salvando = false;
        this.cdr.detectChanges();
      },
    });
  }
}
