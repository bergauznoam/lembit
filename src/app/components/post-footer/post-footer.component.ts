import { CommonModule } from '@angular/common';
import { Component, Input, OnInit } from '@angular/core';
import { IonicModule } from '@ionic/angular';
import { Store } from '@ngrx/store';
import { ApiService } from '@services/api.service';
import { UpdatePost } from '@state/actions/feed.actions';
import { AppState } from '@state/types/appstate.type';
import { PostView } from 'lemmy-js-client';

@Component({
  selector: 'app-post-footer',
  templateUrl: './post-footer.component.html',
  styleUrls: ['./post-footer.component.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule]
})
export class PostFooterComponent {

  @Input() public post!: PostView;
  @Input() public preview: boolean = true;

  constructor(
    private readonly store: Store<AppState>,
    private readonly apiService: ApiService
  ) { }

  public get commentsCount(): number {
    return this.post.counts.comments;
  }

  public get didUpvote(): boolean {
    return this.post.my_vote === 1;
  }

  public get didDownvote(): boolean {
    return this.post.my_vote === -1;
  }

  public get myVote(): number | undefined {
    return this.post.my_vote;
  }

  public get score(): number {
    return this.post.counts.score;
  }

  public get buttonSize(): string {
    return this.preview ? "small" : "large";
  }

  public async onVote(type: 'up' | 'down'): Promise<void> {
    let score = 0;
    switch (type) {
      case 'up':
        score = (this.myVote === 1) ? 0 : (this.myVote ? 1 : 1);
        break;
      case 'down':
        score = (this.myVote === -1) ? 0 : (this.myVote ? -1 : -1);
        break;
    }
    const { id } = this.post.post;
    const updated_post = await this.apiService.likePost(id, score);
    if (updated_post) {
      this.store.dispatch(new UpdatePost(id, updated_post))
    }
  }

  public async onShare(): Promise<void> {
    const shareData: ShareData = {
      url: this.post.post.ap_id,
      title: this.post.post.name,
      text: this.post.post.body,
    }
    if (navigator.canShare && navigator.canShare(shareData)) {
      await navigator.share(shareData);
    }
  }

}
