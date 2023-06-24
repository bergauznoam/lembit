import { Injectable } from "@angular/core";
import { Account } from "@models/account.model";
import { StarredCommunity } from "@models/starredCommunity.model";
import { Store } from "@ngrx/store";
import { LoadAccounts } from "@state/actions/accounts.actions";
import { LoadCommunities } from "@state/actions/communities.actions";
import { AppState } from "@state/types/appstate.type";
import Dexie, { Table } from "dexie";


@Injectable({
    providedIn: "root"
})
export class DatabaseService extends Dexie {
    private accounts!: Table<Account, number>;
    private starred_community!: Table<StarredCommunity, number>;

    constructor(
        private readonly store: Store<AppState>
    ) {
        super("Lembit");
        this.version(3).stores({
            accounts: "++id, username, token, server, primary",
            starred_community: "++id, user_id, title, icon, url"
        });
    }

    public async load(): Promise<void> {
        await this.loadAccounts();
    }

    public async loadAccounts(): Promise<void> {
        const accounts = await this.accounts.toArray();
        this.store.dispatch(new LoadAccounts(accounts));
    }

    public async loadStarredCommunities(user_id: number): Promise<void> {
        const communities = await this.starred_community.filter(community => community.user_id === user_id).toArray();
        this.store.dispatch(new LoadCommunities(communities));
    }

    public async getAccount(id?: number, username?: string): Promise<Account | undefined> {
        if (id) {
            return await this.accounts.filter(account => account.id === id).first();
        }
        if (username) {
            return await this.accounts.filter(account => account.username === username).first();
        }
        return;
    }

    public async addAccount(account: Partial<Account>): Promise<void> {
        const isPrimary = (await this.listAccounts()).length === 0;
        await this.accounts.add({ ...account, primary: isPrimary } as Account);
        await this.loadAccounts();
    }

    public async updateAccountToken(id: number, authToken: string): Promise<Account> {
        await this.accounts.update(id, { token: authToken });
        return await this.getAccount(id) as Account;
    }

    public async listAccounts(): Promise<Account[]> {
        return await this.accounts.toArray();
    }

    public async getPrimaryAccount(): Promise<Account | undefined> {
        return await this.accounts.filter(account => account.primary).first();
    }

    public async addCommunity(user_id: number, starred_community: StarredCommunity): Promise<void> {
        const id = await this.starred_community.add(starred_community);
        await this.starred_community.get(id) as StarredCommunity;
        await this.loadStarredCommunities(user_id);
    }

    public listCommunities(user_id: number): Promise<StarredCommunity[]> {
        return this.starred_community.filter(community => community.user_id === user_id).toArray();
    }

    public async deleteCommunity(user_id: number, id: number): Promise<void> {
        await this.starred_community.delete(id);
        await this.loadStarredCommunities(user_id);
    }


}