import { Injectable } from "@angular/core";
import {
    CommunityModeratorView,
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
    PostView,
    SortType
} from "lemmy-js-client";

import { environment } from "@environment";
import { DatabaseService } from '@services/database.service';
import { Account } from "@models/account.model";


@Injectable({
    providedIn: "root"
})
export class ApiService {
    private lemmyClient!: LemmyHttp;
    private authToken!: string | undefined;

    constructor(
        private readonly databaseService: DatabaseService
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
            await this.databaseService.updateAccountToken(account.id as number, this.authToken as string);
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
    ): Promise<PostView[]> {
        const request: GetPosts = {
            auth: this.authToken,
            type_,
            sort,
            limit,
            page
        };

        const { posts } = await this.lemmyClient.getPosts(request);
        return posts;
    }

    public async getPost(id: number): Promise<[PostView, CommunityModeratorView[]]> {
        const request: GetPost = {
            auth: this.authToken,
            id
        }
        const { post_view, moderators } = await this.lemmyClient.getPost(request);
        return [post_view, moderators];
    }

    public async likePost(id: number, score: number): Promise<PostView | undefined> {
        if (!this.authToken) { return; }
        const request: CreatePostLike = {
            auth: this.authToken,
            post_id: id,
            score
        }
        const { post_view } = await this.lemmyClient.likePost(request);
        return post_view;
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
}