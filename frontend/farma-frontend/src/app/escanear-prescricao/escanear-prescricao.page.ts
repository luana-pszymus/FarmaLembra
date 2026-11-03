
// ===== IMPORTAÇÕES =====
import { Component, OnDestroy } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { IonContent, IonIcon } from '@ionic/angular';
import { addIcons } from 'ionicons';

// ===== ÍCONES DA PRESCRIÇÃO =====
import {
  arrowBackOutline,
  cameraOutline,
  informationCircleOutline,
  trashOutline,
  arrowForwardOutline,
} from 'ionicons/icons';

// ===== COMPONENTE DA PRESCRIÇÃO =====
@Component({
  selector: 'app-escanear-prescricao',
  templateUrl: './escanear-prescricao.page.html',
  styleUrls: ['./escanear-prescricao.page.scss'],
  imports: [IonContent, IonIcon, RouterLink],
})
export class EscanearPrescricaoPage implements OnDestroy {

  // ===== FOTO DA RECEITA =====
  fotoUrl: string | null = null;
  mensagem = '';

  constructor(private router: Router) {
    // ===== REGISTRO DOS ÍCONES =====
    addIcons({
      arrowBackOutline,
      cameraOutline,
      informationCircleOutline,
      trashOutline,
      arrowForwardOutline,
    });
  }

  // ===== SELEÇÃO DA FOTO =====
  selecionarFoto(event: Event) {
    const campo = event.target as HTMLInputElement;
    const arquivo = campo.files?.[0];

    if (!arquivo) {
      return;
    }

    // ===== VERIFICA O TIPO DO ARQUIVO =====
    if (!arquivo.type.startsWith('image/')) {
      this.mensagem = 'Selecione uma imagem da sua prescrição.';
      campo.value = '';
      return;
    }

    // ===== REMOVE A FOTO ANTERIOR =====
    this.limparFoto();

    // ===== MOSTRA A NOVA FOTO =====
    this.fotoUrl = URL.createObjectURL(arquivo);
    this.mensagem = 'Imagem selecionada! Confira se a receita está legível.';
  }

  // ===== REMOVE A FOTO =====
  limparFoto() {
    if (this.fotoUrl) {
      URL.revokeObjectURL(this.fotoUrl);
    }

    this.fotoUrl = null;
    this.mensagem = '';
  }

  // ===== AVANÇA PARA O CADASTRO =====
  continuar() {
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

  // ===== LIBERA A FOTO AO SAIR =====
  ngOnDestroy() {
    this.limparFoto();
  }
}
