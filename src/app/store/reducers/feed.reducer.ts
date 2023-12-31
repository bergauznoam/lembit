import { Action } from "@ngrx/store";
import { Feed } from "@models/feed.model";
import {
    LoadPost,
    LoadPosts,
    SetFeedPage,
    UpdatePost,
    SetListingType,
    SetSortingType,
} from "@state/feed.actions";
import {
    LOAD_POST,
    CLOSE_POST,
    LOAD_POSTS,
    SET_FEED_PAGE,
    UPDATE_POST,
    SET_LISTING_TYPE,
    SET_SORTING_TYPE,
} from '@state/feed.actions.types';

const initialState: Feed = {
    posts: [],
    activePost: null,
    settings: {
        page: 1,
        sort: "Hot",
        limit: 20,
        type_: "Local"
    }
};

export const feedReducer = (state: Feed = initialState, action: Action): Feed => {
    switch (action.type) {
        case LOAD_POSTS: {
            const { posts } = action as LoadPosts;
            if (state.settings.page === 1) {
                return { ...state, posts }
            }
            return { ...state, posts: [...state.posts, ...posts] };
        }
        case SET_FEED_PAGE: {
            const { page } = action as SetFeedPage;
            return { ...state, settings: { ...state.settings, page } };
        }
        case UPDATE_POST: {
            const { id, post } = action as UpdatePost;
            const updated_state = { ...state, posts: state.posts.map(p => p.post.id == id ? post : p) };
            if (state.activePost?.post_view.post.id === id) {
                return {
                    ...updated_state,
                    activePost: {
                        ...state.activePost,
                        post_view: post
                    }
                }
            }
            return updated_state;
        }
        case LOAD_POST: {
            const { post } = action as LoadPost;
            return { ...state, activePost: post };
        }
        case CLOSE_POST: {
            return { ...state, activePost: null };
        }
        case SET_LISTING_TYPE: {
            const { type_ } = action as SetListingType;
            return { ...state, settings: { ...state.settings, page: 1, type_ } };
        }
        case SET_SORTING_TYPE: {
            const { sort } = action as SetSortingType;
            return { ...state, settings: { ...state.settings, page: 1, sort } };
        }
        default:
            return state;
    }
}