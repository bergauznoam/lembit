import { CommonModule } from '@angular/common';
import { Component, OnInit, Output, EventEmitter, Input } from '@angular/core';
import { IonicModule } from '@ionic/angular';
import { PostView } from 'lemmy-js-client';

import { Account, DatabaseService } from '@services/database.service';
import { IOpenPost } from '@interfaces/open-post.interface';

@Component({
  selector: 'app-post',
  templateUrl: './post.component.html',
  styleUrls: ['./post.component.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule]
})
export class PostComponent implements OnInit {

  @Input() post!: PostView;
  @Output() setOpen: EventEmitter<IOpenPost> = new EventEmitter();

  private authToken!: string | undefined;
  private account!: Account | undefined;

  constructor(
    private readonly databaseService: DatabaseService
  ) {
    const authToken = localStorage.getItem("authToken");
    if (authToken) {
      this.authToken = authToken;
    }
  }

  public async ngOnInit(): Promise<void> {
    this.account = await this.databaseService.getPrimaryAccount();
    await this.getPost();
  }

  public closePost(): void {
    this.setOpen.next({ isOpen: false, post: null });
  }

  private async getPost(): Promise<void> {

  }

}
