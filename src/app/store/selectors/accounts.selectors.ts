import { createSelector } from '@ngrx/store';
import { Account } from '@services/database.service';
import { AppState } from '@state/appstate.type';
// import { AppState } from '@state/appstate.type';

export const selectAccounts = (state: AppState) => state.accounts;

export const selectPrimaryAccount = createSelector(
    selectAccounts,
    (state: Account[]) => state.find(account => account.primary)
);