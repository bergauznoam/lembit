import { Action } from "@ngrx/store";
import { Account } from "@services/database.service";
import {
    LoadAccounts,
} from "@state/accounts.actions";
import {
    LOAD_ACCOUNTS,
} from '@state/accounts.actions.types';

const initialState: Account[] = [];

export const accountsReducer = (state: Account[] = initialState, action: Action): Account[] => {
    switch (action.type) {
        case LOAD_ACCOUNTS:
            const { accounts } = action as LoadAccounts;
            return [...accounts];
        default:
            return state;
    }
}