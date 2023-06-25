import { Action } from "@ngrx/store";

import {
    LOAD_POSTS,
    SET_FEED_PAGE,
    UPDATE_POST,
} from "@state/feed.actions.types";
import { PostView } from "lemmy-js-client";

export class LoadPosts implements Action {
    readonly type = LOAD_POSTS;
    constructor(public readonly posts: PostView[]) { }
}

export class SetFeedPage implements Action {
    readonly type = SET_FEED_PAGE;
    constructor(public readonly page: number) { }
}

export class UpdatePost implements Action {
    readonly type = UPDATE_POST;
    constructor(
        public readonly id: number,
        public readonly post: PostView
    ) { }
}