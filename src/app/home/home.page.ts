import { Component } from '@angular/core';
import { Camera, CameraOptions } from '@ionic-native/camera/ngx';
import { LoadingController, LoadingOptions  } from '@ionic/angular';
import { Observable } from 'rxjs';
import { OCR, OCRResult, OCRSourceType } from '@awesome-cordova-plugins/ocr/ngx';
import { createWorker } from 'tesseract.js';


@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
})
export class HomePage {

  clickedImage: string;
  // Firestore data
  result$: Observable<any>;
  image: string;
  // eslint-disable-next-line @typescript-eslint/ban-types
  loadinng:  LoadingOptions;


  options: CameraOptions = {
    quality: 50,
    destinationType: this.camera.DestinationType.DATA_URL,
    encodingType: this.camera.EncodingType.JPEG,
    mediaType: this.camera.MediaType.PICTURE,
    sourceType: this.camera.PictureSourceType.PHOTOLIBRARY,
  };

  constructor(private camera: Camera, private loadingCtrl: LoadingController, private ocr: OCR) {}

  startUpload(base64Image) {
    const worker = createWorker({
      logger: m => console.log(m)
    });
    (async () => {
      await worker.load();
      await worker.loadLanguage('eng');
      await worker.initialize('eng');
      const { data: { text } } = await worker.recognize(base64Image);
      console.log('texto extraido de la imagen: ' +text);
      await worker.terminate();
      console.log('finish');
    })();





    // Show loader
    // loadinng.present();

    // const timestamp = new Date().getTime().toString();
    // const docId = this.afs.createId();

    // const path = `${docId}.jpg`;

    // Make a reference to the future location of the firestore document
    // const photoRef = this.afs.collection('photos').doc(docId);

    // Firestore observable
    // this.result$ = photoRef.valueChanges().pipe(
    //   filter(data => !!data),
    //   tap(_ => this.loading.dismiss()),
    // )

    // The main task
    // this.image = 'data:image/jpg;base64,' + file;
    // this.task = this.storage.ref(path).putString(this.image, 'data_url');
  }

  captureImage() {
    this.camera.getPicture(this.options).then((imageData) => {
      // imageData is either a base64 encoded string or a file URI
      // If it's base64 (DATA_URL):
      const base64Image = 'data:image/jpeg;base64,' + imageData;
      this.clickedImage = base64Image;

    this.startUpload(base64Image);
    }, (err) => {
      console.log(err);
      // Handle error
    });
  }

  extractEmail(str: string) {
    // eslint-disable-next-line max-len
    const emailRegex = /(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))/;
    const {matches, cleanedText} = this.removeByRegex(str, emailRegex);
    return matches;
  };

  extractContact(str: string) {
    const contactRegex = /(?:(\+?\d{1,3}) )?(?:([\(]?\d+[\)]?)[ -])?(\d{1,5}[\- ]?\d{1,5})/;
    const {matches, cleanedText} = this.removeByRegex(str, contactRegex);
    return matches;
  }

  removeByRegex(str, regex) {
    const matches = [];
    const cleanedText = str.split('\n').filter(line => {
      const hits = line.match(regex);
      if (hits != null) {
        matches.push(hits[0]);
        return false;
      }
      return true;
    }).join('\n');
    return {matches, cleanedText};
  };
}
