import { Component, OnInit } from "@angular/core";
import { CommonModule } from "@angular/common";
import {
  FormsModule,
  ReactiveFormsModule,
} from "@angular/forms";
import { IonicModule } from "@ionic/angular";
import { Store } from '@ngrx/store';
import { Observable, filter, tap } from "rxjs";

import { DatabaseService } from "@services/database.service";
import { LoginComponent } from "@components/login/login.component";
import { ApiService } from "@services/api.service";
import { GetPersonDetailsResponse } from "lemmy-js-client";
import { AppState } from "@state/appstate.type";
import {
  selectAccounts,
  selectPrimaryAccount
} from "@state/selectors/accounts.selectors";
import { Account } from "@models/account.model";

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
  public hasAccount: boolean = false;
  public isLoading: boolean = false;
  public accounts$: Observable<Account[]>;
  public primaryAccount$: Observable<Account | undefined>;
  public primaryAccount!: Account | undefined;
  public accountDetails!: GetPersonDetailsResponse;

  constructor(
    private readonly store: Store<AppState>,
    private readonly databaseService: DatabaseService,
    private readonly apiService: ApiService
  ) {
    this.accounts$ = this.store.select(selectAccounts);
    this.primaryAccount$ = this.store.select(selectPrimaryAccount);
  }

  public async ngOnInit(): Promise<void> {
    this.subscribeToPrimaryAccount();
  }

  public subscribeToPrimaryAccount() {
    this.primaryAccount$
      .pipe(
        tap(account => this.hasAccount = !!account),
        filter(account => !!account)
      )
      .subscribe(async (account) => {
        this.primaryAccount = account;
        await this.getAccountInfo();
      });
  }

  public async getAccountInfo() {
    this.isLoading = true;
    const { username, server } = this.primaryAccount as Account;
    this.accountDetails = await this.apiService.getPersonDetails(username, server);
    this.isLoading = false;
  }

  public async logout(): Promise<void> {
    await this.databaseService.logout(this.primaryAccount?.id as number);
  }
}