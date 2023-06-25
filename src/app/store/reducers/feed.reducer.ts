import { Action } from "@ngrx/store";
import { Feed } from "@models/feed.model";
import {
    LoadPost,
    ClosePost,
    LoadPosts,
    SetFeedPage,
    UpdatePost,
} from "@state/feed.actions";
import {
    LOAD_POST,
    CLOSE_POST,
    LOAD_POSTS,
    SET_FEED_PAGE,
    UPDATE_POST,
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
            return { ...state, posts: [...state.posts, ...posts] };
        }
        case SET_FEED_PAGE: {
            const { page } = action as SetFeedPage;
            return { ...state, settings: { ...state.settings, page } };
        }
        case UPDATE_POST: {
            const { id, post } = action as UpdatePost;
            return { ...state, posts: state.posts.map(p => p.post.id == id ? post : p) };
        }
        case LOAD_POST: {
            const { id } = action as LoadPost;
            return { ...state, activePost: id };
        }
        case CLOSE_POST: {
            return { ...state, activePost: null };
        }
        default:
            return state;
    }
}