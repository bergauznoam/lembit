import { Account } from "@services/database.service";

export interface AppState {
    accounts: Account[];
}