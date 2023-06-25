import { ChangeDetectionStrategy, Component, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { InfiniteScrollCustomEvent, IonModal, IonicModule } from '@ionic/angular';

import {
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
import { FeedSettings } from '@models/feed.model';
import { selectPosts, selectFeedSettings } from '@state/selectors/feed.selectors';
import { LoadPosts, SetFeedPage, UpdatePost } from '@state/actions/feed.actions';


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
  public primaryAccount!: Account | undefined;
  public posts: PostView[] = [];
  public isModalOpen: boolean = false;
  public activePost!: PostView | null;

  private feedSettings!: FeedSettings;

  private posts$: Observable<PostView[]>;
  private feedSettings$: Observable<FeedSettings>;
  private primaryAccount$: Observable<Account | undefined>;


  constructor(
    private readonly store: Store<AppState>,
    private readonly databaseService: DatabaseService,
    private readonly apiService: ApiService
  ) {
    this.primaryAccount$ = this.store.select(selectPrimaryAccount);
    this.posts$ = this.store.select(selectPosts);
    this.feedSettings$ = this.store.select(selectFeedSettings);
  }

  public async ngOnInit(): Promise<void> {
    this.subscribeToPrimaryAccount();
    this.subsribeToFeedSettings();
    this.subscribeToPosts();
  }

  private subscribeToPrimaryAccount(): void {
    this.primaryAccount$
      .pipe(
        tap((account) => {
          if (account) {
            this.databaseService.loadStarredCommunities(account.id as number);
          }
        }),
      )
      .subscribe(async (account) => {
        this.primaryAccount = account;
      });
  }

  private subscribeToPosts(): void {
    this.posts$
      .subscribe(posts => {
        this.posts = posts;
      });
  }

  private subsribeToFeedSettings(): void {
    this.feedSettings$
      .subscribe(async (settings) => {
        this.feedSettings = settings;
        await this.getPosts();
      });
  }

  private async getPosts(): Promise<void> {
    const { type_, sort, limit, page } = this.feedSettings;
    const posts = await this.apiService.getPosts(type_, sort, limit, page);
    this.store.dispatch(new LoadPosts(posts));
  }

  public async onIonInfinite(event: any): Promise<any> {
    this.store.dispatch(new SetFeedPage(this.feedSettings.page + 1));
    setTimeout(() => {
      (event as InfiniteScrollCustomEvent).target.complete();
    }, 500);
  }

  public handleRefresh(event: any): void {
    setTimeout(async () => {
      this.store.dispatch(new SetFeedPage(0));
      event.target.complete();
    }, 2000);
  }

  public async onUpdatePostScore({ id, score }: IUpdatePostScore): Promise<void> {
    const updated_post = await this.apiService.likePost(id, score);
    if (updated_post) {
      this.store.dispatch(new UpdatePost(id, updated_post))
    }
  }

  public setOpen({ isOpen, post }: IOpenPost) {
    this.activePost = post;
    this.isModalOpen = isOpen;
  }
}
