import { Injectable } from "@angular/core";
import {
    CommunityView,
    CreatePostLike,
    GetPersonDetails,
    GetPersonDetailsResponse,
    GetPost,
    GetPosts,
    LemmyHttp,
    ListCommunities,
    ListingType,
    Login,
    SavePost,
    SortType,
    PostResponse
} from "lemmy-js-client";

import { environment } from "@environment";
import { DatabaseService } from '@services/database.service';
import { Account } from "@models/account.model";
import { Store } from "@ngrx/store";
import { AppState } from "@state/types/appstate.type";
import { LoadPost, LoadPosts, UpdatePost } from "@state/actions/feed.actions";


@Injectable({
    providedIn: "root"
})
export class ApiService {
    private lemmyClient!: LemmyHttp;
    private authToken!: string | undefined;

    constructor(
        private readonly databaseService: DatabaseService,
        private readonly store: Store<AppState>
    ) {
        this.lemmyClient = new LemmyHttp(`${location.origin}/api/${environment.defaultServer}`);
        this.databaseService.getPrimaryAccount()
            .then((account: Account | undefined) => {
                if (account) {
                    this.authToken = account.token;
                    this.lemmyClient = new LemmyHttp(`${location.origin}/api/${account.server}`);
                }
            });
    }

    public async login(username_or_email: string, password: string, server: string): Promise<void> {
        const loginForm: Login = { username_or_email, password };
        const { jwt } = await this.lemmyClient.login(loginForm);
        if (jwt) {
            this.authToken = jwt;
        }
        const account = await this.databaseService.getAccount(undefined, username_or_email);
        if (!account) {
            await this.databaseService.addAccount({
                username: username_or_email,
                token: jwt,
                server: server,
            });
        } else {
            await this.databaseService.login(account.id as number, this.authToken as string);
        }
    }

    public async getPersonDetails(username: string, server: string): Promise<GetPersonDetailsResponse> {
        const personDetailsForm: GetPersonDetails = {
            auth: this.authToken,
            username: `${username}@${server}`
        }

        return await this.lemmyClient.getPersonDetails(personDetailsForm);
    }

    public async getPosts(
        type_: ListingType,
        sort: SortType,
        limit: number,
        page: number
    ): Promise<void> {
        const request: GetPosts = {
            auth: this.authToken,
            type_,
            sort,
            limit,
            page
        };

        const { posts } = await this.lemmyClient.getPosts(request);
        this.store.dispatch(new LoadPosts(posts));
    }

    public async getPost(id: number): Promise<void> {
        const request: GetPost = {
            auth: this.authToken,
            id
        }
        const post = await this.lemmyClient.getPost(request);
        this.store.dispatch(new LoadPost(post));
    }

    public async likePost(id: number, score: number): Promise<void> {
        if (!this.authToken) { return; }
        const request: CreatePostLike = {
            auth: this.authToken,
            post_id: id,
            score
        }
        const { post_view } = await this.lemmyClient.likePost(request);
        this.store.dispatch(new UpdatePost(id, post_view));
    }

    public async getCommunities(type_: ListingType, limit: number, page: number): Promise<CommunityView[]> {
        const request: ListCommunities = {
            auth: this.authToken,
            type_,
            limit,
            page
        }
        const { communities } = await this.lemmyClient.listCommunities(request);
        return communities;
    }

    public async savePost(id: number, save: boolean): Promise<void> {
        if (!this.authToken) { return; }
        const request: SavePost = {
            auth: this.authToken,
            post_id: id,
            save
        };
        const { post_view } = await this.lemmyClient.savePost(request);
        this.store.dispatch(new UpdatePost(id, post_view));
    }
}