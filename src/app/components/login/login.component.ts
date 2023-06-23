import { CommonModule } from '@angular/common';
import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import {
  FormsModule,
  ReactiveFormsModule,
  FormBuilder,
  FormGroup,
  Validators,
  AbstractControl
} from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { Login, LoginResponse } from "lemmy-js-client";

import { DatabaseService } from '@services/database.service';
import { getClient } from "@lemmy";

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule, ReactiveFormsModule]
})
export class LoginComponent implements OnInit {

  @Output() onAccountCreated: EventEmitter<void> = new EventEmitter();

  public loginForm!: FormGroup;
  public isToastOpen: boolean = false;

  constructor(
    private readonly formBuilder: FormBuilder,
    private readonly databaseService: DatabaseService,

  ) { }

  public ngOnInit() {
    this.loginForm = this.formBuilder.group({
      server: ['', [Validators.required, Validators.minLength(2)]],
      email: [
        '',
        [
          Validators.required,
          Validators.pattern('[a-z0-9._%+-]+@[a-z0-9.-]+.[a-z]{2,3}$'),
        ],
      ],
      password: ['', [Validators.required, Validators.minLength(2)]],
    });
  }

  public setOpen(value: boolean): void {
    this.isToastOpen = value;
  }


  public get errorControl(): { [key: string]: AbstractControl<any, any> } {
    return this.loginForm.controls;
  }

  public get isServerPropertyHasError(): boolean {
    return this.loginForm.controls?.['server']?.touched && this.loginForm.controls?.['server']?.['invalid'];
  }

  public get isServerPropertyEmpty(): boolean {
    return this.loginForm.controls?.['server']?.errors?.['required'];
  }

  public get isEmailPropertyHasError(): boolean {
    return this.loginForm.controls?.['email'].touched && this.loginForm.controls?.['email']['invalid'];
  }

  public get isEmailPropertyEmpty(): boolean {
    return this.errorControl['email'].errors?.['required'];
  }

  public get isEmailPropertyInvalid(): boolean {
    return this.errorControl['email'].errors?.['pattern'];
  }

  public get isPasswordPropertyHasError(): boolean {
    return this.loginForm.controls?.['password']?.touched && this.loginForm.controls?.['password']?.['invalid'];
  }

  public get isPasswordPropertyEmpty(): boolean {
    return this.loginForm.controls?.['password']?.errors?.['required'];
  }

  public get isLoginButtonDisabled(): boolean {
    return this.isServerPropertyHasError ||
      this.isServerPropertyEmpty ||
      this.isEmailPropertyHasError ||
      this.isEmailPropertyEmpty ||
      this.isPasswordPropertyHasError ||
      this.isPasswordPropertyEmpty;
  }

  public async login(): Promise<void> {
    const baseUrl = this.loginForm.get('server')?.value;
    const username_or_email = this.loginForm.get("email")?.value;
    const password = this.loginForm.get("password")?.value;
    const loginForm: Login = { username_or_email, password }
    const client = getClient(baseUrl);
    try {
      const response: LoginResponse = await client.login(loginForm);
      if (!response.jwt) {
        throw new Error()
      }
      localStorage.setItem("authToken", response.jwt);
      await this.databaseService.addAccount({
        username: username_or_email,
        password,
        server: baseUrl,
        primary: !(await this.databaseService.listAccounts()).length
      });
      this.onAccountCreated.next();
    } catch (e) {
      this.isToastOpen = true;
    }
  }
}
