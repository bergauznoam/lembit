import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { IonicModule } from '@ionic/angular';

import { DatabaseService, StarredCommunity } from '@services/database.service';
import { ICommunityItem } from "@interfaces/community-item.interface";
import { ApiService } from '@services/api.service';
import { Account } from '@models/account.model';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss'],
  standalone: true,
  imports: [IonicModule, RouterLink, RouterLinkActive, CommonModule],
})
export class AppComponent implements OnInit {
  public account!: Account;

  constructor(
    private readonly databaseService: DatabaseService,
    private readonly apiService: ApiService
  ) { }

  public communities: ICommunityItem[] = [];
  public starredCommunities: StarredCommunity[] = [];

  public labels = ['Family', 'Friends', 'Notes', 'Work', 'Travel', 'Reminders'];

  public async ngOnInit(): Promise<void> {
    await this.databaseService.load();
    const account = await this.databaseService.getPrimaryAccount();
    if (account) {
      this.account = account;
      this.getStarredCommunites(account.id as number);
    }
    await this.getCommunities();
  }

  private async getStarredCommunites(user_id: number): Promise<void> {
    this.starredCommunities = await this.databaseService.listCommunities(user_id);
  }

  private async getCommunities(): Promise<void> {
    this.communities = (await this.apiService.getCommunities("Subscribed", 50, 1))
      .filter(community =>
        !community.blocked &&
        !community.community.deleted &&
        !community.community.hidden &&
        !community.community.removed)
      .map(community => ({
        title: community.community.name,
        url: `/community/${community.community.id}`,
        icon: community.community.icon
      }));
  }

  public isStarredCommunity(community: ICommunityItem): boolean {
    return !!this.starredCommunities.find(comm => comm.url === community.url);
  }

  public async starCommunity($event: MouseEvent, community: ICommunityItem): Promise<void> {
    if (!this.account) { return };
    if (this.isStarredCommunity(community)) { return; }
    $event.stopPropagation();
    const starred_community = await this.databaseService.addCommunity({
      title: community.title,
      icon: community.icon || "",
      url: community.url,
      user_id: this.account.id as number
    });
    this.starredCommunities = [...this.starredCommunities, starred_community];
  }

  public async deleteStarredCommunity($event: MouseEvent, id?: number): Promise<void> {
    $event.stopPropagation();
    if (!id) { return; }
    await this.databaseService.deleteCommunity(id);
    this.starredCommunities = this.starredCommunities.filter(community => community.id !== id);
  }
}
