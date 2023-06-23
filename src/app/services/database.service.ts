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

export interface StarredCommunity {
    id?: number;
    user_id: number;
    title: string;
    icon: string;
    url: string;
}

@Injectable({
    providedIn: "root"
})
export class DatabaseService extends Dexie {
    private accounts!: Table<Account, number>;
    private starred_community!: Table<StarredCommunity, number>;

    constructor() {
        super("Lembit");
        this.version(3).stores({
            accounts: "++id, username, password, server, primary",
            starred_community: "++id, user_id, title, icon, url"
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

    public async addCommunity(starred_community: StarredCommunity): Promise<StarredCommunity> {
        const id = await this.starred_community.add(starred_community);
        return await this.starred_community.get(id) as StarredCommunity;
    }

    public listCommunities(user_id: number): Promise<StarredCommunity[]> {
        return this.starred_community.filter(community => community.user_id === user_id).toArray();
    }

    public async deleteCommunity(id: number): Promise<void> {
        await this.starred_community.delete(id);
    }


}