import { Account } from "@models/account.model";
import { Action } from "@ngrx/store";

import {
    LOAD_ACCOUNTS,
} from "@state/accounts.actions.types";

export class LoadAccounts implements Action {
    readonly type = LOAD_ACCOUNTS;

    constructor(public readonly accounts: Account[]) { }
}
