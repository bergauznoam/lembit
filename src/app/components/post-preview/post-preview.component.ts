import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { IonicModule } from '@ionic/angular';
import { PostView } from 'lemmy-js-client';

import { calculateTimePassed } from "@utils";
import { getClient } from "@lemmy";

@Component({
  selector: 'app-post-preview',
  templateUrl: './post-preview.component.html',
  styleUrls: ['./post-preview.component.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule]
})
export class PostPreviewComponent {
  @Input() public post!: PostView

  public get thumbnail(): string | undefined {
    return this.post.post.thumbnail_url;
  }

  public get communityIcon(): string {
    return this.post.community.icon || "";
  }

  public get communityName(): string {
    return this.post.community.name;
  }

  public get title(): string {
    const {embed_title, name} = this.post.post;
    return embed_title || name;
  }

  public get published(): string {
    return calculateTimePassed(this.post.post.published);
  }

  public get body(): string {
    const { body } = this.post.post;
    return body ? body.length > 100 ? `${body.slice(0, 97)}...` : body : "";
  }

  public get commentsCount(): number {
    return this.post.counts.comments;
  }

  public get score(): number {
    return this.post.counts.score;
  }

  public async onShare(): Promise<void> {
    const shareData: ShareData = {
      url: this.post.post.ap_id,
      title: this.title,
      text: this.body,
    }
    await navigator.share(shareData);
  }

  public async onUpvote(): Promise<void> {
  }

  public async onDownVote(): Promise<void> {

  }
}
