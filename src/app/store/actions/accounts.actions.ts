import { Action } from "@ngrx/store";
import { Account } from "@models/account.model";

import {
    LOAD_ACCOUNTS,
} from "@state/accounts.actions.types";

export class LoadAccounts implements Action {
    readonly type = LOAD_ACCOUNTS;

    constructor(public readonly accounts: Account[]) { }
}
