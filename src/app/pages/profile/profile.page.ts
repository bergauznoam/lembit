import { Component, OnInit } from "@angular/core";
import { CommonModule } from "@angular/common";
import {
  FormsModule,
  ReactiveFormsModule,
} from "@angular/forms";
import { IonicModule } from "@ionic/angular";

import { DatabaseService, Account } from "@services/database.service";
import { LoginComponent } from "@components/login/login.component";
import { getClient } from "@lemmy";
import { calculateTimePassed } from "@utils";
import { ApiService } from "@services/api.service";
import { GetPersonDetailsResponse } from "lemmy-js-client";

@Component({
  selector: "app-profile",
  templateUrl: "./profile.page.html",
  styleUrls: ["./profile.page.scss"],
  standalone: true,
  imports: [
    IonicModule,
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    LoginComponent
  ]
})
export class ProfilePage implements OnInit {
  public accounts: Account[] = [];
  public primaryAccount!: Account | undefined;
  public accountDetails!: GetPersonDetailsResponse;
  public isLoading: boolean = true;

  constructor(
    private readonly databaseService: DatabaseService,
    private readonly apiService: ApiService
  ) { }

  async ngOnInit() {
    this.accounts = await this.databaseService.listAccounts();
    await this.getPrimaryAccount();
  }

  public get hasAccount(): boolean {
    return this.accounts.length > 0;
  }

  public async getPrimaryAccount(): Promise<void> {
    this.accounts = await this.databaseService.listAccounts();
    this.primaryAccount = await this.databaseService.getPrimaryAccount();
    if (this.primaryAccount) {
      await this.getAccountInfo();
    }
  }

  public async getAccountInfo() {
    this.isLoading = true;
    const { username, server } = this.primaryAccount as Account;
    this.accountDetails = await this.apiService.getPersonDetails(username, server);
    this.isLoading = false;
  }

  public async setPrimaryAccount(id: number): Promise<void> {

  }

  public getAccountAge(): string {
    const { published } = this.accountDetails.person_view.person;
    return calculateTimePassed(published);
  }
}