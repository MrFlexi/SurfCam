import { Injectable } from '@angular/core';
import { Geolocation, Position } from '@capacitor/geolocation';
import { ToastController } from '@ionic/angular';
import { Platform } from '@ionic/angular';



@Injectable({
  providedIn: 'root'
})

export class ApiService {

  public geoLocation :Position;

  constructor(private toastCtrl: ToastController) {
    this.getLocation();
  }
   
   async showToast(msg: string) {
    const toast = await this.toastCtrl.create({
      message: msg,
      position: 'top',
      duration: 2000
    });
    toast.present();
  }

   public async getLocation() {
    this.geoLocation = await Geolocation.getCurrentPosition();
  }

}
