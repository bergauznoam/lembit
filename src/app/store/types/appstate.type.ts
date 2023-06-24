import { Account } from "@models/account.model";

export interface AppState {
    accounts: Account[];
    communities: any[];
}