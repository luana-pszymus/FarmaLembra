import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import type { OnInit } from '@angular/core';
import { IonContent, IonSpinner } from '@ionic/angular';

import type { Paciente } from '../services/paciente.service';
import { PacienteService } from '../services/paciente.service';

@Component({
  selector: 'app-pacientes',
  templateUrl: './pacientes.page.html',
  styleUrls: ['./pacientes.page.scss'],
  imports: [CommonModule, IonContent, IonSpinner],
})
export class PacientesPage implements OnInit {
  private readonly pacienteService = inject(PacienteService);

  pacientes: Paciente[] = [];
  carregando = false;
  mensagemErro = '';

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
      },
      error: (erro: unknown): void => {
        console.error('Erro ao carregar pacientes:', erro);
        this.mensagemErro = 'Não foi possível carregar os pacientes. Tente novamente.';
        this.carregando = false;
      },
    });
  }
}
