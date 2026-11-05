import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonContent, IonSpinner } from '@ionic/angular';

import { Paciente, PacienteService } from '../services/paciente.service';

@Component({
  selector: 'app-pacientes',
  templateUrl: './pacientes.page.html',
  styleUrls: ['./pacientes.page.scss'],
  imports: [CommonModule, IonContent, IonSpinner],
})
export class PacientesPage implements OnInit {
  pacientes: Paciente[] = [];
  carregando = false;
  mensagemErro = '';

  constructor(private pacienteService: PacienteService) {}

  ngOnInit() {
    this.carregarPacientes();
  }

  carregarPacientes() {
    this.carregando = true;
    this.mensagemErro = '';

    this.pacienteService.listar().subscribe({
      next: (dados) => {
        this.pacientes = dados;
        this.carregando = false;
      },
      error: (erro) => {
        console.error('Erro ao carregar pacientes:', erro);
        this.mensagemErro = 'Não foi possível carregar os pacientes. Tente novamente.';
        this.carregando = false;
      },
    });
  }
}
