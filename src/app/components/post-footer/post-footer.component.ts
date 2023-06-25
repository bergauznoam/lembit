import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { IonicModule } from '@ionic/angular';
import { Store } from '@ngrx/store';
import { ApiService } from '@services/api.service';
import { AppState } from '@state/types/appstate.type';
import { getScore } from '@utils';
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

  public get isSaved(): boolean {
    return this.post.saved;
  }

  public async onVote(type: 'up' | 'down'): Promise<void> {
    const score = getScore(type, this.myVote);
    const { id } = this.post.post;
    await this.apiService.likePost(id, score);
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

  public async onSave(): Promise<void> {
    const { id } = this.post.post;
    await this.apiService.savePost(id, !this.isSaved);
  }

}
