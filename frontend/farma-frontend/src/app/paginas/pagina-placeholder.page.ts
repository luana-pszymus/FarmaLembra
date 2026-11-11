import { CommonModule } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { IonContent, IonIcon } from '@ionic/angular';
import { addIcons } from 'ionicons';

import {
  personOutline,
  notificationsOutline,
  accessibilityOutline,
  peopleOutline,
  shieldCheckmarkOutline,
  informationCircleOutline,
  logOutOutline,
  chevronForwardOutline,
} from 'ionicons/icons';

import { AuthService } from '../services/auth.service';
import { PacienteService } from '../services/paciente.service';
@Component({
  selector: 'app-pagina-placeholder',
  templateUrl: './pagina-placeholder.page.html',
  styleUrls: ['./pagina-placeholder.page.scss'],
  imports: [CommonModule, IonContent, IonIcon],
})
export class PaginaPlaceholderPage implements OnInit {
  private readonly authService = inject(AuthService);
  private readonly pacienteService = inject(PacienteService);
  private readonly router = inject(Router);

  nomeUsuario = 'Usuário';
  emailUsuario = '';
  quantidadePacientes = 0;
  carregandoPacientes = true;

  constructor() {
    addIcons({
      personOutline,
      notificationsOutline,
      accessibilityOutline,
      peopleOutline,
      shieldCheckmarkOutline,
      informationCircleOutline,
      logOutOutline,
      chevronForwardOutline,
    });
  }

  ngOnInit(): void {
    this.carregarPacientes();
  }

  carregarPacientes(): void {
    this.carregandoPacientes = true;

    this.pacienteService.listar().subscribe({
      next: (pacientes) => {
        this.quantidadePacientes = pacientes.length;
        this.carregandoPacientes = false;
      },
      error: (erro) => {
        console.error('Erro ao carregar pacientes no perfil:', erro);
        this.carregandoPacientes = false;
      },
    });
  }

  abrirPacientes(): void {
    void this.router.navigateByUrl('/tabs/pacientes');
  }

  sair(): void {
    this.authService.sair();

    void this.router.navigateByUrl('/login', {
      replaceUrl: true,
    });
  }
}
