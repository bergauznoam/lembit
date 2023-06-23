import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';

import { getClient } from "@lemmy";
import { ListCommunities } from "lemmy-js-client";

@Component({
  selector: 'app-home',
  templateUrl: './home.page.html',
  styleUrls: ['./home.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule]
})
export class HomePage implements OnInit {

  constructor() { }

  public async ngOnInit() {
    const client = getClient("lemmy.world");
    console.log(await client.listCommunities({}))
  }

}
