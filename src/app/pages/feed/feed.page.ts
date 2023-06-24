import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { InfiniteScrollCustomEvent, IonModal, IonicModule } from '@ionic/angular';

import {
  GetPosts,
  GetPostsResponse,
  SortType,
  ListingType,
  PostView,
  CreatePostLike
} from "lemmy-js-client";

import { getClient } from "@lemmy";
import { Account, DatabaseService } from '@services/database.service';
import { PostPreviewComponent } from "@components/post-preview/post-preview.component";
import { IUpdatePostScore } from "@interfaces/update-post-score.interface";
import { IOpenPost } from "@interfaces/open-post.interface"
import { FormsModule } from '@angular/forms';
import { PostComponent } from "@components/post/post.component";

@Component({
  selector: 'app-feed',
  templateUrl: './feed.page.html',
  styleUrls: ['./feed.page.scss'],
  standalone: true,
  changeDetection: ChangeDetectionStrategy.Default,
  imports: [IonicModule, CommonModule, PostPreviewComponent, FormsModule, PostComponent]
})
export class FeedPage implements OnInit {
  private readonly authToken!: string | undefined;
  @ViewChild(IonModal) modal!: IonModal;
  private account!: Account | undefined;
  private page: number = 1;
  private limit: number = 20;
  private type: ListingType = 'Local';
  private sort: SortType = "Hot";

  public posts: PostView[] = [];
  public isModalOpen: boolean = false;
  public activePost!: PostView | null;


  constructor(
    private readonly databaseService: DatabaseService,
    private readonly changeDetectorRef: ChangeDetectorRef
  ) {
    const authToken = localStorage.getItem("authToken");
    if (authToken) {
      this.authToken = authToken;
    }
  }

  public async ngOnInit(): Promise<void> {
    this.account = await this.databaseService.getPrimaryAccount();
    await this.getPosts();
  }

  private async getPosts(): Promise<void> {
    const client = getClient(this.account?.server || "lemmy.world");
    const request: GetPosts = {
      auth: this.authToken,
      type_: this.type,
      sort: this.sort,
      limit: this.limit,
      page: this.page
    };
    const response: GetPostsResponse = await client.getPosts(request);
    this.posts = [...this.posts, ...response.posts];
    this.page += 1;
  }

  public async onIonInfinite(event: any): Promise<any> {
    await this.getPosts();
    setTimeout(() => {
      (event as InfiniteScrollCustomEvent).target.complete();
    }, 500);
  }

  public handleRefresh(event: any): void {
    setTimeout(async () => {
      this.page = 0;
      await this.getPosts()
      event.target.complete();
    }, 2000);
  }

  public async onUpdatePostScore({ id, score }: IUpdatePostScore): Promise<void> {
    if (!this.authToken) { return; }
    const client = getClient(this.account?.server as string);
    const request: CreatePostLike = {
      auth: this.authToken,
      post_id: id,
      score: score
    }
    const updated_post = await client.likePost(request);
    this.posts = this.posts.map(post => post.post.id === id ? updated_post.post_view : post)
  }

  public setOpen({ isOpen, post }: IOpenPost) {
    this.activePost = post;
    this.isModalOpen = isOpen;
  }

}
