import { Account } from "@models/account.model";
import { StarredCommunity } from "@models/starredCommunity.model";

export interface AppState {
    accounts: Account[];
    communities: StarredCommunity[];
}