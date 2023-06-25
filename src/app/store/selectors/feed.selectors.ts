import { createSelector } from '@ngrx/store';
import { AppState } from '@state/appstate.type';

export const selectFeed = (state: AppState) => state.feed;

export const selectPosts = createSelector(selectFeed, state => state.posts);
export const selectFeedSettings = createSelector(selectFeed, feed => feed.settings);
export const selectActivePost = createSelector(selectFeed, feed => feed.activePost);