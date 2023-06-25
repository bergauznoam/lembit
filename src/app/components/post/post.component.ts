import { CommonModule } from '@angular/common';
import { Component, OnInit, Output, EventEmitter, Input, ViewChild } from '@angular/core';
import { IonContent, IonicModule } from '@ionic/angular';
import { CommunityModeratorView, PostView } from 'lemmy-js-client';
import { register } from 'swiper/element/bundle';

import { DatabaseService } from '@services/database.service';
import { IOpenPost } from '@interfaces/open-post.interface';
import { ApiService } from '@services/api.service';
import { calculateTimePassed } from '@utils';

register();

@Component({
  selector: 'app-post',
  templateUrl: './post.component.html',
  styleUrls: ['./post.component.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule],
})
export class PostComponent implements OnInit {

  @Input() post_id!: number;
  @Output() setOpen: EventEmitter<IOpenPost> = new EventEmitter();
  @ViewChild('prepreviewContentview') previewContent!: IonContent;

  public isLoading: boolean = true;
  public post!: PostView;
  public moderators: CommunityModeratorView[] = [];

  constructor(
    private readonly apiService: ApiService,
    private readonly databaseService: DatabaseService,
  ) { }

  public async ngOnInit(): Promise<void> {
    await this.getPost();
  }

  public closePost(): void {
    this.setOpen.next({ isOpen: false, post: null });
  }

  private async getPost(): Promise<void> {
    this.isLoading = true;
    const [post, moderators] = await this.apiService.getPost(this.post_id);
    this.post = post;
    this.moderators = moderators;
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
