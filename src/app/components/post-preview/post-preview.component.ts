import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { IonicModule } from '@ionic/angular';
import { Store } from '@ngrx/store';

import { PostView } from 'lemmy-js-client';

import { calculateTimePassed } from "@utils";
import { AppState } from '@state/types/appstate.type';
import { LoadPost } from '@state/actions/feed.actions';
import { PostFooterComponent } from '@components/post-footer/post-footer.component';
import { ApiService } from '@services/api.service';

@Component({
  selector: 'app-post-preview',
  templateUrl: './post-preview.component.html',
  styleUrls: ['./post-preview.component.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, PostFooterComponent],
})
export class PostPreviewComponent {
  @Input() public post!: PostView;

  constructor(
    private readonly store: Store<AppState>,
    private readonly apiService: ApiService,
  ) { }

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

  public async openPost(): Promise<void> {
    await this.apiService.getPost(this.post.post.id);
  }

  public openLink($event: MouseEvent, url: string): void {
    $event.stopPropagation();
    document.open(url, "_blank");
  }
}
