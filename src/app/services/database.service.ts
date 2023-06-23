import { Injectable } from "@angular/core";
import Dexie, { Table } from "dexie";

export interface TodoList {
    id?: number;
    title: string;
}
export interface TodoItem {
    id?: number;
    todoListId: number;
    title: string;
    done?: boolean;
}

export interface Account {
    id?: number;
    username: string;
    password: string;
    server: string;
    primary: boolean;
}

@Injectable({
    providedIn: "root"
})
export class DatabaseService extends Dexie {
    private accounts!: Table<Account, number>;

    constructor() {
        super("Lembit");
        this.version(3).stores({
            accounts: "++id, username, password, server, primary",
        });
    }

    public async addAccount(account: Account) {
        await this.accounts.add(account);
    }

    public async listAccounts(): Promise<Account[]> {
        return await this.accounts.toArray();
    }

    public async getPrimaryAccount(): Promise<Account | undefined> {
        return await this.accounts.filter(account => account.primary).first();
    }
}