import { createSelector } from '@ngrx/store';
import { Feed } from '@models/feed.model';
import { AppState } from '@state/appstate.type';

export const selectFeed = (state: AppState) => state.feed;

export const selectPosts = createSelector(selectFeed, (state: Feed) => state.posts);
export const selectFeedSettings = createSelector(selectFeed, (state: Feed) => state.settings);