import { createSelector } from '@ngrx/store';
import { Account } from '@models/account.model';
import { AppState } from '@state/appstate.type';

export const selectAccounts = (state: AppState) => state.accounts;

export const selectPrimaryAccount = createSelector(
    selectAccounts,
    (state: Account[]) => state.find(account => account.primary)
);