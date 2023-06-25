import { CommonModule } from '@angular/common';
import { Component, OnInit, EventEmitter, ViewChild, OnDestroy } from '@angular/core';
import { IonContent, IonicModule } from '@ionic/angular';
import { CommunityModeratorView, CommunityView, PostView } from 'lemmy-js-client';
import { register } from 'swiper/element/bundle';

import { DatabaseService } from '@services/database.service';
import { ApiService } from '@services/api.service';
import { calculateTimePassed } from '@utils';
import { Store } from '@ngrx/store';
import { AppState } from '@state/types/appstate.type';
import { Observable, takeUntil } from 'rxjs';
import { selectActivePost } from '@state/selectors/feed.selectors';
import { ClosePost } from '@state/actions/feed.actions';
import { PostFooterComponent } from '@components/post-footer/post-footer.component';

register();

@Component({
  selector: 'app-post',
  templateUrl: './post.component.html',
  styleUrls: ['./post.component.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, PostFooterComponent],
})
export class PostComponent implements OnInit, OnDestroy {

  @ViewChild('prepreviewContentview') previewContent!: IonContent;

  private onDestroy$: EventEmitter<void>;
  private activePost$: Observable<number | null>;

  public isLoading: boolean = true;
  public post!: PostView;
  public moderators: CommunityModeratorView[] = [];
  public community!: CommunityView;
  public crossPosts: PostView[] = [];

  constructor(
    private readonly store: Store<AppState>,
    private readonly apiService: ApiService,
    private readonly databaseService: DatabaseService,
  ) {
    this.onDestroy$ = new EventEmitter<void>();
    this.activePost$ = this.store.select(selectActivePost);
  }

  public async ngOnInit(): Promise<void> {
    await this.subscribeToActivePost();
  }

  public ngOnDestroy(): void {
    this.onDestroy$.next();
    this.onDestroy$.complete();
  }

  private subscribeToActivePost(): void {
    this.activePost$
      .pipe(takeUntil(this.onDestroy$))
      .subscribe(async (id) => {
        if (id) {
          await this.getPost(id);
        }
      });
  }

  public closePost(): void {
    this.store.dispatch(new ClosePost());
  }

  private async getPost(id: number): Promise<void> {
    this.isLoading = true;
    const [post, moderators, community_view, cross_posts] = await this.apiService.getPost(id);
    this.post = post;
    this.moderators = moderators;
    this.community = community_view;
    this.crossPosts = cross_posts;
    this.isLoading = false;
  }

  public calculateTimePassed(published_at: string): string {
    return calculateTimePassed(published_at);
  }

  public isModerator(user_id: number): boolean {
    return !!this.moderators.find((mod) => mod.moderator.id === user_id);
  }

  public get isSubscribedToCommunity(): boolean {
    return this.post.subscribed === "Subscribed"
  }

  public get link(): string | undefined {
    const url = this.post.post.url || "";
    if (!(/\.(gif|jpe?g|tiff?|png|webp|bmp)$/i).test(url)) {
      return url;
    }
    return undefined;
  }

  public get domain(): string {
    const { url } = this.post.post;
    if (url) {
      const { hostname } = new URL(url);
      return hostname.replace("wwww\.", "");
    }
    return "";
  }
}
