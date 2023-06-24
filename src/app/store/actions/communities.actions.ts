import { Account } from "@models/account.model";
import { StarredCommunity } from "@models/starredCommunity.model";
import { Action } from "@ngrx/store";

import {
    LOAD_COMMUNITIES
} from "@state/communities.actions.type";

export class LoadCommunities implements Action {
    readonly type = LOAD_COMMUNITIES;

    constructor(public readonly communities: StarredCommunity[]) { }
}
