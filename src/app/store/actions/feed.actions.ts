import { Action } from "@ngrx/store";

import {
    CLOSE_POST,
    LOAD_POST,
    LOAD_POSTS,
    SET_FEED_PAGE,
    SET_LISTING_TYPE,
    UPDATE_POST,
} from "@state/feed.actions.types";
import { ListingType, PostView } from "lemmy-js-client";

export class LoadPosts implements Action {
    readonly type = LOAD_POSTS;
    constructor(public readonly posts: PostView[]) { }
}

export class ClosePost implements Action {
    readonly type = CLOSE_POST;
}

export class LoadPost implements Action {
    readonly type = LOAD_POST;
    constructor(public readonly id: number) { }
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

export class SetListingType implements Action {
    readonly type = SET_LISTING_TYPE;
    constructor(public readonly type_: ListingType) { }
}