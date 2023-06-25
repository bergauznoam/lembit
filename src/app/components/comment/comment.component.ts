import { CommonModule } from '@angular/common';
import { Component, Input, OnInit } from '@angular/core';
import { IonicModule } from '@ionic/angular';
import { ApiService } from '@services/api.service';
import { getScore, calculateTimePassed } from '@utils';
import { CommentSortType, CommentView } from 'lemmy-js-client';

@Component({
  selector: 'app-comment',
  templateUrl: './comment.component.html',
  styleUrls: ['./comment.component.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule]
})
export class CommentComponent implements OnInit {
  @Input() public comment!: CommentView;
  @Input() public sort!: CommentSortType;
  @Input() public limit!: number;
  public replies: CommentView[] = [];

  constructor(
    private readonly apiService: ApiService
  ) { }

  public async ngOnInit() {
    const { id } = this.comment.comment;
    setTimeout(async () => {
      this.replies = await this.apiService.getComments(id, this.sort, this.limit, 5);
    }, 1000);
  }

  public get didUpvote(): boolean {
    return this.comment.my_vote === 1;
  }

  public get didDownvote(): boolean {
    return this.comment.my_vote === -1;
  }

  public get content(): string {
    return this.comment.comment.content;
  }

  public get avatar(): string | undefined {
    return this.comment.creator.avatar;
  }

  public get username(): string | undefined {
    return this.comment.creator.name;
  }

  public get score(): number {
    return this.comment.counts.score;
  }

  public async onVote(type: 'up' | 'down'): Promise<void> {
    const score = getScore(type, this.comment.my_vote);
    const { id } = this.comment.comment;
    // await this.apiService.likePost(id, score);
  }

  public get time(): string {
    return calculateTimePassed(this.comment.comment.published);
  }

}
