import { Component, inject } from '@angular/core';
import type { OnDestroy } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { IonContent, IonIcon } from '@ionic/angular';
import { addIcons } from 'ionicons';
import {
  arrowBackOutline,
  arrowForwardOutline,
  cameraOutline,
  informationCircleOutline,
  trashOutline,
} from 'ionicons/icons';

@Component({
  selector: 'app-escanear-prescricao',
  templateUrl: './escanear-prescricao.page.html',
  styleUrls: ['./escanear-prescricao.page.scss'],
  imports: [IonContent, IonIcon, RouterLink],
})
export class EscanearPrescricaoPage implements OnDestroy {
  private readonly router = inject(Router);

  fotoUrl: string | null = null;
  mensagem = '';

  constructor() {
    addIcons({
      arrowBackOutline,
      cameraOutline,
      informationCircleOutline,
      trashOutline,
      arrowForwardOutline,
    });
  }

  selecionarFoto(event: Event): void {
    const campo = event.target as HTMLInputElement;
    const arquivo = campo.files?.[0];

    if (!arquivo) {
      return;
    }

    if (!arquivo.type.startsWith('image/')) {
      this.mensagem = 'Selecione uma imagem da sua prescrição.';
      campo.value = '';
      return;
    }

    this.limparFoto();

    this.fotoUrl = URL.createObjectURL(arquivo);
    this.mensagem = 'Imagem selecionada! Confira se a receita está legível.';
  }

  limparFoto(): void {
    if (this.fotoUrl) {
      URL.revokeObjectURL(this.fotoUrl);
    }

    this.fotoUrl = null;
    this.mensagem = '';
  }

  continuar(): void {
    if (!this.fotoUrl) {
      this.mensagem = 'Primeiro, fotografe ou escolha sua prescrição.';
      return;
    }

    this.router.navigate(['/tabs/remedios/novo/dados'], {
      queryParams: {
        origem: 'prescricao',
      },
    });
  }

  ngOnDestroy(): void {
    this.limparFoto();
  }
}
