import { Component, OnInit, OnDestroy } from '@angular/core';
import { ApiService } from '../services/api.service';
import { NgIfContext } from '@angular/common';

@Component({
  selector: 'app-tab1',
  templateUrl: 'tab1.page.html',
  styleUrls: ['tab1.page.scss']
})
export class Tab1Page implements OnInit, OnDestroy{

  constructor(public myAPI: ApiService) {
    myAPI.showToast("Hello World")
  }
 
  ngOnInit() { 
    this.myAPI.getLocation();

  }

  ngOnDestroy() {

   }

}
