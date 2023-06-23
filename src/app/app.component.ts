import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { IonicModule } from '@ionic/angular';

import { getClient } from "@lemmy";
import { LemmyHttp, ListCommunities, ListCommunitiesResponse } from "lemmy-js-client";
import { Account, DatabaseService } from '@services/database.service';
import { ICommunityItem } from "@interfaces/community-item.interface";

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss'],
  standalone: true,
  imports: [IonicModule, RouterLink, RouterLinkActive, CommonModule],
})
export class AppComponent implements OnInit {
  private authToken!: string | null;
  private lemmyClient!: LemmyHttp;
  public account!: Account;

  constructor(
    private readonly databaseService: DatabaseService
  ) {}

  public communities: ICommunityItem[] = [
    { title: 'Inbox', url: '/folder/inbox', icon: 'mail' },
    { title: 'Outbox', url: '/folder/outbox', icon: 'paper-plane' },
    { title: 'Favorites', url: '/folder/favorites', icon: 'heart' },
    { title: 'Archived', url: '/folder/archived', icon: 'archive' },
    { title: 'Trash', url: '/folder/trash', icon: 'trash' },
    { title: 'Spam', url: '/folder/spam', icon: 'warning' },
  ];
  public labels = ['Family', 'Friends', 'Notes', 'Work', 'Travel', 'Reminders'];
  public async ngOnInit(): Promise<void> {
    this.authToken = localStorage.getItem("authToken");
    const account = await this.databaseService.getPrimaryAccount();
    if (account) {
      this.account = account;
    }
    this.lemmyClient = getClient(this.account?.server || "lemmy.world");
    const request: ListCommunities = {
      auth: this.authToken || undefined,
      type_: this.authToken ? "Subscribed" : "Local",
      limit: 50
    }
    const response: ListCommunitiesResponse = await this.lemmyClient.listCommunities(request)
    this.communities = response.communities
      .filter(community => 
          !community.blocked && 
          !community.community.deleted && 
          !community.community.hidden && 
          !community.community.removed)
      .map(community => ({
        title: community.community.name,
        url: `/community/${community.community.id}`,
        icon: community.community.icon
      }))
  }
}
