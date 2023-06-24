import { ChangeDetectionStrategy, Component, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { InfiniteScrollCustomEvent, IonModal, IonicModule } from '@ionic/angular';

import {
  SortType,
  ListingType,
  PostView,
} from "lemmy-js-client";

import { DatabaseService } from '@services/database.service';
import { PostPreviewComponent } from "@components/post-preview/post-preview.component";
import { IUpdatePostScore } from "@interfaces/update-post-score.interface";
import { IOpenPost } from "@interfaces/open-post.interface"
import { FormsModule } from '@angular/forms';
import { PostComponent } from "@components/post/post.component";
import { ApiService } from '@services/api.service';
import { Account } from '@models/account.model';
import { AppState } from '@state/types/appstate.type';
import { Store } from '@ngrx/store';
import { Observable, tap } from 'rxjs';
import { selectPrimaryAccount } from '@state/selectors/accounts.selectors';


@Component({
  selector: 'app-feed',
  templateUrl: './feed.page.html',
  styleUrls: ['./feed.page.scss'],
  standalone: true,
  changeDetection: ChangeDetectionStrategy.Default,
  imports: [IonicModule, CommonModule, PostPreviewComponent, FormsModule, PostComponent]
})
export class FeedPage implements OnInit {
  @ViewChild(IonModal) modal!: IonModal;
  private page: number = 1;
  private limit: number = 20;
  private type: ListingType = 'Local';
  private sort: SortType = "Hot";

  public isModalOpen: boolean = false;
  public activePost!: PostView | null;

  private primaryAccount$: Observable<Account | undefined>;
  public primaryAccount!: Account | undefined;
  public posts: PostView[] = [];


  constructor(
    private readonly store: Store<AppState>,
    private readonly databaseService: DatabaseService,
    private readonly apiService: ApiService
  ) {
    this.primaryAccount$ = this.store.select(selectPrimaryAccount);
  }

  public async ngOnInit(): Promise<void> {
    this.subscribeToPrimaryAccount();
  }

  private subscribeToPrimaryAccount(): void {
    this.primaryAccount$
      .pipe(
        tap((account) => {
          if (account) {
            this.databaseService.loadStarredCommunities(account.id as number);
          }
        })
      )
      .subscribe(async (account) => {
        this.primaryAccount = account;
        this.page = 0;
        this.posts = [];
        await this.getPosts();
      });
  }

  private async getPosts(): Promise<void> {
    const posts = await this.apiService.getPosts(this.type, this.sort, this.limit, this.page);
    this.posts = [...this.posts, ...posts];
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
    this.posts = this.posts
      .map(post =>
        post.post.id === id ?
          {
            ...post,
            my_vote: score,
            counts: {
              ...post.counts,
              score: post.counts.score + score
            }
          }
          : post
      );
    const updated_post = await this.apiService.likePost(id, score);
    if (updated_post) {
      this.posts = this.posts.map(post => post.post.id === id ? updated_post : post);
    }
  }

  public setOpen({ isOpen, post }: IOpenPost) {
    this.activePost = post;
    this.isModalOpen = isOpen;
  }

}
