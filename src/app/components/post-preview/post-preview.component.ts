import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { IonicModule } from '@ionic/angular';
import { PostView } from 'lemmy-js-client';

import { calculateTimePassed } from "@utils";
import { IUpdatePostScore } from '@interfaces/update-post-score.interface';
import { IOpenPost } from '@interfaces/open-post.interface';

@Component({
  selector: 'app-post-preview',
  templateUrl: './post-preview.component.html',
  styleUrls: ['./post-preview.component.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule],
})
export class PostPreviewComponent {
  @Input() public post!: PostView;
  @Output() public onUpdatePostScore: EventEmitter<IUpdatePostScore> = new EventEmitter()
  @Output() setOpen: EventEmitter<IOpenPost> = new EventEmitter();

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

  public get communityIcon(): string {
    return this.post.community.icon || "";
  }

  public get communityName(): string {
    return this.post.community.name;
  }

  public get title(): string {
    const { embed_title, name } = this.post.post;
    return embed_title || name;
  }

  public get published(): string {
    return calculateTimePassed(this.post.post.published);
  }

  public get body(): string {
    const { body } = this.post.post;
    return body ? body.length > 150 ? `${body.slice(0, 147)}...` : body : "";
  }

  public get commentsCount(): number {
    return this.post.counts.comments;
  }

  public get score(): number {
    return this.post.counts.score;
  }

  public get myVote(): number | undefined {
    return this.post.my_vote;
  }

  public async onShare(): Promise<void> {
    const shareData: ShareData = {
      url: this.post.post.ap_id,
      title: this.title,
      text: this.body,
    }
    if (navigator.canShare && navigator.canShare(shareData)) {
      await navigator.share(shareData);
    }
  }

  public get didUpvote(): boolean {
    return this.post.my_vote === 1;
  }

  public get didDownvote(): boolean {
    return this.post.my_vote === -1;
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

    this.onUpdatePostScore.next({
      id: this.post.post.id,
      score
    });
  }

  public async onUpvote(): Promise<void> {
    this.onUpdatePostScore.next({
      id: this.post.post.id,
      score: !this.myVote ? 1 : this.myVote * -1
    });
  }

  public async onDownvote(): Promise<void> {
    this.onUpdatePostScore.next({
      id: this.post.post.id,
      score: !this.myVote ? -1 : this.myVote * -1
    });
  }

  public openPost(): void {
    this.setOpen.next({ isOpen: true, post: this.post });
  }

  public openLink($event: MouseEvent, url: string): void {
    $event.stopPropagation();
    document.open(url, "_blank");
  }
}
