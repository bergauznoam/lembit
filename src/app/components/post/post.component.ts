import { CommonModule } from '@angular/common';
import { Component, OnInit, ViewChild, Input } from '@angular/core';
import { IonContent, IonicModule } from '@ionic/angular';
import {
  CommentSortType,
  CommentView,
  CommunityModeratorView,
  CommunityView,
  GetPostResponse,
  PostView
} from 'lemmy-js-client';

import { calculateTimePassed } from '@utils';
import { Store } from '@ngrx/store';
import { AppState } from '@state/types/appstate.type';
import { ClosePost } from '@state/actions/feed.actions';
import { PostFooterComponent } from '@components/post-footer/post-footer.component';
import { CommentComponent } from '@components/comment/comment.component';
import { ApiService } from '@services/api.service';


@Component({
  selector: 'app-post',
  templateUrl: './post.component.html',
  styleUrls: ['./post.component.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, PostFooterComponent, CommentComponent],
})
export class PostComponent implements OnInit {

  @ViewChild('prepreviewContentview') previewContent!: IonContent;
  @Input() public set activePost(post: GetPostResponse) {
    const { post_view, moderators, community_view, cross_posts } = post;
    this.post = post_view;
    this.moderators = moderators;
    this.community = community_view;
    this.crossPosts = cross_posts;
  }

  public post!: PostView;
  public moderators: CommunityModeratorView[] = [];
  public community!: CommunityView;
  public crossPosts: PostView[] = [];
  public comments: CommentView[] = [];
  public commentsSortTypes: CommentSortType[] = ["Hot", "Top", "New", "Old"];
  public sort!: CommentSortType;
  public limit: number = 50;
  public isLoadingComments: boolean = false;

  constructor(
    private readonly store: Store<AppState>,
    private readonly apiService: ApiService
  ) {
    this.sort = this.commentsSortTypes[0];
  }

  public async ngOnInit(): Promise<void> {
    const { id } = this.post.post;
    this.isLoadingComments = true;
    this.comments = await this.apiService.getComments(id, this.sort, this.limit, 5);
    this.isLoadingComments = false;
  }

  public closePost(): void {
    this.store.dispatch(new ClosePost());
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

  public get thumbnail(): string | undefined {
    const image = this.post.post.thumbnail_url || this.post.post.url || "";
    if ((/\.(gif|jpe?g|tiff?|png|webp|bmp)$/i).test(image)) {
      return image;
    }
    return undefined;
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
