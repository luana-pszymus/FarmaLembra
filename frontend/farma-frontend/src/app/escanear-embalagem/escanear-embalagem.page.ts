// ===== IMPORTAÇÕES =====
import { Component, OnDestroy } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { IonContent, IonIcon } from '@ionic/angular';
import { addIcons } from 'ionicons';

// ===== ÍCONES DA CÂMERA =====
import {
  arrowBackOutline,
  cameraOutline,
  imageOutline,
  informationCircleOutline,
  trashOutline,
  arrowForwardOutline,
} from 'ionicons/icons';

// ===== COMPONENTE DA LEITURA DA EMBALAGEM =====
@Component({
  selector: 'app-escanear-embalagem',
  templateUrl: './escanear-embalagem.page.html',
  styleUrls: ['./escanear-embalagem.page.scss'],
  imports: [IonContent, IonIcon, RouterLink],
})
export class EscanearEmbalagemPage implements OnDestroy {

  // ===== FOTO SELECIONADA =====
  fotoUrl: string | null = null;
  mensagem = '';

  constructor(private router: Router) {
    // ===== REGISTRO DOS ÍCONES =====
    addIcons({
      arrowBackOutline,
      cameraOutline,
      imageOutline,
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
      this.mensagem = 'Selecione um arquivo de imagem.';
      campo.value = '';
      return;
    }

    // ===== LIMPA A FOTO ANTERIOR =====
    this.limparFoto();

    // ===== MOSTRA A NOVA FOTO =====
    this.fotoUrl = URL.createObjectURL(arquivo);
    this.mensagem = 'Foto selecionada! Confira se a embalagem está legível.';
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
      this.mensagem = 'Primeiro, tire uma foto ou escolha uma imagem.';
      return;
    }

    this.router.navigate(['/tabs/remedios/novo/dados'], {
      queryParams: {
        origem: 'embalagem',
      },
    });
  }

  // ===== LIBERA A FOTO AO SAIR DA TELA =====
  ngOnDestroy() {
    this.limparFoto();
  }
}