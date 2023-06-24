import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { IonicModule } from '@ionic/angular';

import { DatabaseService } from '@services/database.service';
import { ICommunityItem } from "@interfaces/community-item.interface";
import { ApiService } from '@services/api.service';
import { Account } from '@models/account.model';
import { StarredCommunity } from '@models/starredCommunity.model';
import { Observable, filter, tap } from 'rxjs';
import { AppState } from '@state/types/appstate.type';
import { Store } from '@ngrx/store';
import { selectPrimaryAccount } from '@state/selectors/accounts.selectors';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss'],
  standalone: true,
  imports: [IonicModule, RouterLink, RouterLinkActive, CommonModule],
})
export class AppComponent implements OnInit {
  private primaryAccount$: Observable<Account | undefined>;
  private starredCommunities$: Observable<StarredCommunity[]>;
  public primaryAccount!: Account | undefined;
  public communities: ICommunityItem[] = [];
  public starredCommunities: StarredCommunity[] = [];

  constructor(
    private readonly store: Store<AppState>,
    private readonly databaseService: DatabaseService,
    private readonly apiService: ApiService
  ) {
    this.primaryAccount$ = this.store.select(selectPrimaryAccount);
    this.starredCommunities$ = this.store.select((state) => state.communities);
  }

  public async ngOnInit(): Promise<void> {
    this.subscribeToPrimaryAccount();
    this.subscribeToCommunities();
    await this.databaseService.load();
  }

  private subscribeToPrimaryAccount(): void {
    this.primaryAccount$
      .pipe(
        tap((account) => {
          if (account) {
            this.databaseService.loadStarredCommunities(account.id as number);
          }
        })
      )
      .subscribe(async (account) => {
        this.primaryAccount = account;
        await this.getCommunities();
      });
  }

  private subscribeToCommunities(): void {
    this.starredCommunities$
      .subscribe(communities => this.starredCommunities = communities);
  }

  private async getCommunities(): Promise<void> {
    const type = this.primaryAccount ? "Subscribed" : "Local";
    this.communities = (await this.apiService.getCommunities(type, 50, 1))
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
    if (!this.primaryAccount?.id) { return };
    if (this.isStarredCommunity(community)) { return; }
    $event.stopPropagation();
    const comm = {
      title: community.title,
      icon: community.icon || "",
      url: community.url,
      user_id: this.primaryAccount.id as number
    };
    await this.databaseService.addCommunity(this.primaryAccount?.id, comm);
  }

  public async deleteStarredCommunity($event: MouseEvent, id?: number): Promise<void> {
    $event.stopPropagation();
    if (!id || !this.primaryAccount?.id) { return; }
    await this.databaseService.deleteCommunity(this.primaryAccount?.id, id);
    this.starredCommunities = this.starredCommunities.filter(community => community.id !== id);
  }
}
