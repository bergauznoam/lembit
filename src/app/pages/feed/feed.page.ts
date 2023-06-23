import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { InfiniteScrollCustomEvent, IonicModule } from '@ionic/angular';

import { GetPosts, GetPostsResponse, SortType, ListingType, PostView } from "lemmy-js-client";

import { getClient } from "@lemmy";
import { Account, DatabaseService } from '@services/database.service';
import { PostComponent } from "@components/post/post.component";

@Component({
  selector: 'app-feed',
  templateUrl: './feed.page.html',
  styleUrls: ['./feed.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, PostComponent]
})
export class FeedPage implements OnInit {
  private readonly authToken!: string | undefined;
  private account!: Account | undefined; 
  private page: number = 1;
  private limit: number = 20;
  private type: ListingType = 'Local';
  private sort: SortType = "Hot";
  
  public posts: PostView[] = [];

  constructor(
    private readonly databaseService: DatabaseService
  ) { 
    const authToken = localStorage.getItem("authToken");
    if (authToken) {
      this.authToken = authToken;
    }
  }

  public async ngOnInit(): Promise<void> {
    this.account = await this.databaseService.getPrimaryAccount()
    await this.getPosts()
  }

  private async getPosts(): Promise<void> {
    const client = getClient(this.account?.server as string);
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

}
