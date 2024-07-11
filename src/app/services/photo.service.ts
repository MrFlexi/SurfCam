import { Injectable } from '@angular/core';
import { Camera, CameraResultType, CameraSource, Photo } from '@capacitor/camera';
import { Filesystem, Directory } from '@capacitor/filesystem';
import { Preferences } from '@capacitor/preferences';
import { Platform } from '@ionic/angular';
import { Capacitor } from '@capacitor/core';
import * as tf from '@tensorflow/tfjs';
import * as cocoSsd from '@tensorflow-models/coco-ssd';
import '@tensorflow/tfjs-backend-webgl';
import '@tensorflow/tfjs-backend-cpu';

@Injectable({
  providedIn: 'root'
})
export class PhotoService {

  public photos: UserPhoto[] = [];
  model: cocoSsd.ObjectDetection;

  public predictions;

  private PHOTO_STORAGE: string = 'photos';
  private platform: Platform;

  constructor(platform: Platform) {
    this.platform = platform;
    this.loadModel();
  }

  async loadModel() {    
    console.log('Start loading model ');
    this.model = await cocoSsd.load();
    console.log('done ... ');
    
  }

  private async readAsBase64(photo: Photo) {
    // "hybrid" will detect Cordova or Capacitor
    if (this.platform.is('hybrid')) {
      // Read the file into base64 format
      const file = await Filesystem.readFile({
        path: photo.path!
      });
  
      return file.data;
    }
    else {
      // Fetch the photo, read as a blob, then convert to base64 format
      const response = await fetch(photo.webPath!);
      const blob = await response.blob();
  
      return await this.convertBlobToBase64(blob) as string;
    }
  }
  
  private convertBlobToBase64 = (blob: Blob) => new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = reject;
    reader.onload = () => {
        resolve(reader.result);
    };
    reader.readAsDataURL(blob);
  });

  // Save picture to file on device
private async savePicture(photo: Photo) {
  // Convert photo to base64 format, required by Filesystem API to save
  const base64Data = await this.readAsBase64(photo);

  // Write the file to the data directory
  const fileName = Date.now() + '.jpeg';
  const savedFile = await Filesystem.writeFile({
    path: fileName,
    data: base64Data,
    directory: Directory.Data
  });

  const img = new Image();
    img.src = photo.webPath;
    //img.src = "assets/hund.jpg"
    img.onload = () => {
        this.predictions = this.detectPersons(img);
        console.log('on load ready');
      } 


  if (this.platform.is('hybrid')) {
    console.log('Platform: hybrid ');
    // Display the new image by rewriting the 'file://' path to HTTP
    // Details: https://ionicframework.com/docs/building/webview#file-protocol
    return {
      filepath: savedFile.uri,
      webviewPath: Capacitor.convertFileSrc(savedFile.uri),
      predictions: this.predictions
    };
  }
  else {
    // Use webPath to display the new image instead of base64 since it's
    // already loaded into memory
    console.log('Platform:  ');
    return {
      filepath: fileName,
      webviewPath: photo.webPath,
      predictions: this.predictions
    };
  };


 
}

  public async addNewToGallery() {
    // Take a photo
    const capturedPhoto = await Camera.getPhoto({
      resultType: CameraResultType.Uri,
      source: CameraSource.Camera,
      quality: 100
    });

    const savedImageFile = await this.savePicture(capturedPhoto);  

    this.photos.unshift(savedImageFile); 
  }
  

  async detectPersons(img: HTMLImageElement) {
    this.predictions = await this.model.detect(img);
    console.log('Predictions: ');
    console.log(this.predictions);

    const personCount = this.predictions.filter(prediction => prediction.class === 'person').length;
    console.log(`Number of persons detected: ${personCount}`);
    return(this.predictions);
  }
}

export interface UserPhoto {
  filepath: string;
  webviewPath?: string;
  predictions?: any;
}
