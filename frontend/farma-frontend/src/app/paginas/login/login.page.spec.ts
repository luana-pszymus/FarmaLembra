import type { ComponentFixture } from '@angular/core/testing';
import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { AlertController } from '@ionic/angular';
import { describe, it, expect, vi, beforeEach } from 'vitest';

import { AuthService } from '../../services/auth.service';

import { LoginPage } from './login.page';

describe('LoginPage', () => {
  let component: LoginPage;
  let fixture: ComponentFixture<LoginPage>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LoginPage],
      providers: [
        {
          provide: AuthService,
          useValue: {
            cadastrar: vi.fn(),
            entrar: vi.fn(),
            entrarComGoogle: vi.fn(),
            recuperarSenha: vi.fn(),
          },
        },
        {
          provide: Router,
          useValue: {
            navigateByUrl: vi.fn(),
          },
        },
        {
          provide: AlertController,
          useValue: {
            create: vi.fn(),
          },
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(LoginPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('deve criar a página de login', () => {
    expect(component).toBeTruthy();
  });

  it('deve iniciar no modo de login', () => {
    expect(component.modoCadastro).toBe(false);
  });

  it('deve alternar para o modo de cadastro', () => {
    component.alternarModo();

    expect(component.modoCadastro).toBe(true);
  });
});
