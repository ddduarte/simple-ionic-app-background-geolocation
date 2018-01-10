import { Component } from '@angular/core';
import { 
  GoogleMap, 
  GoogleMaps, 
  GoogleMapsEvent, 
  LatLng, 
  Marker, 
  GoogleMapsAnimation, 
  GoogleMapsMapTypeId } from '@ionic-native/google-maps';
import { Geolocation } from '@ionic-native/geolocation';
import { Platform } from 'ionic-angular';
import { BackgroundMode } from '@ionic-native/background-mode';
import { Subscription } from 'rxjs/Rx';

@Component({
  selector: 'page-home',
  templateUrl: 'home.html'
})
export class HomePage {

  private _map: GoogleMap;
  private _watcher: Subscription;

  constructor(
    private _platform: Platform, 
    private _geolocation: Geolocation,
    private _backgroundMode: BackgroundMode) {

    this._backgroundMode.on('deactivate')
    .subscribe(() => {
      // your code here
    });
    
  }

  private async initBackGround(){
    // This is very important
    if(!this._backgroundMode.isEnabled()){
      this._backgroundMode.enable();
      this._backgroundMode.setDefaults({silent: true});
    }

    // This is very important
    this._platform.registerBackButtonAction(() => {
      this._backgroundMode.moveToBackground();
    });

    this._backgroundMode.on('activate')
      .subscribe(() => {
        // This is very important
        this._backgroundMode.disableWebViewOptimizations();

        /***
         * Just to kake sure that its works
         *****/

         this._watcher.unsubscribe();
         this.watch();
        
        // your code here

      });
  }

  ngAfterViewInit(){
    if(this._map){
      this._map.remove();// Restart map if necessary
    }
    let element: HTMLElement = document.getElementById('map');
    this._map = GoogleMaps.create(element);
    this._map.setMapTypeId(GoogleMapsMapTypeId.ROADMAP);
    this._map.one(GoogleMapsEvent.MAP_READY)
      .then(() => 
        this._geolocation.getCurrentPosition({ enableHighAccuracy: true, timeout: 60000})
      ).then((resp) => {

      this._map.addMarker({
        title: 'You are here!',
        animation: GoogleMapsAnimation.DROP,
        position: new LatLng(resp.coords.latitude,resp.coords.longitude)
      })
      .then((marker: Marker) => {
        console.log('Created marker', marker);
      })
      this.watch();
    }).catch((error) => console.log('Error on get position', error));
    this.initBackGround();
  }

  private watch(){
    this._watcher = this._geolocation.watchPosition({ enableHighAccuracy : true })
    .subscribe((position) => {
      if(this._backgroundMode.isActive()) {
        console.log('Watching in background', position);
      } else {
        console.log('Watching in foreground', position);
      } 
    },
    (err) => console.log(err));
  }

}
