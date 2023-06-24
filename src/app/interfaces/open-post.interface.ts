import { PostView } from "lemmy-js-client";

export interface IOpenPost {
    isOpen: boolean;
    post: PostView | null;
}