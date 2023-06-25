import { GetPostResponse, ListingType, PostView, SortType } from "lemmy-js-client";

export interface FeedSettings {
    page: number;
    sort: SortType;
    limit: number;
    type_: ListingType;
}

export interface Feed {
    posts: PostView[];
    settings: FeedSettings;
    activePost: GetPostResponse | null;
}