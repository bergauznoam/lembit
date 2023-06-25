import { Account } from "@models/account.model";
import { Feed } from "@models/feed.model";
import { StarredCommunity } from "@models/starredCommunity.model";

export interface AppState {
    accounts: Account[];
    communities: StarredCommunity[];
    feed: Feed;
}