# merging-threejs-html


## Merge sizes of html & threejs 
![alt text](fov.png)


```js
this.camera.fov = 2*Math.atan((window.innerHeight/2) / dist) * (180/Math.PI);
```
2 => 2 times the half height to get the real browser height
atan => get the tangent value of window.innerheight/2 divided by the camera dist from the object
*(100/Math.PI) => convert gradient to degrees

## Merge position & texture
first get the images & the information about position
```js
export default class Sketch {
    ...
    this.images = [...document.querySelectorAll('img')];
    ...
}


  addImages(){
    this.imageStore = this.images.map(img =>{
        let bounds = img.getBoundingClientRect();
        console.log(bounds);

        return {
          img: img,
          top: bounds.top,
          left: bounds.left,
          width: bounds.width,
          height: bounds.height
        }
    })
  }
```

This gives for each images

```
DOMRect {x: 712.5, y: 555.296875, width: 600, height: 400, top: 555.296875, …}
bottom: 955.296875
height: 400
left: 712.5
right: 1312.5
top: 555.296875
width: 600
x: 712.5
y: 555.296875
``` 

With those data, we create the actual 3D object
```js
  addImages(){
    this.imageStore = this.images.map(img =>{
        let bounds = img.getBoundingClientRect();
        console.log(bounds);

        let geometry = new THREE.PlaneBufferGeometry(bounds.width, bounds.height, 1, 1);
        let material = new THREE.MeshBasicMaterial({color: 0xff0000})

        let mesh = new THREE.Mesh(geometry, material);

        this.scene.add(mesh);

        return {
          img: img,
          mesh,
          top: bounds.top,
          left: bounds.left,
          width: bounds.width,
          height: bounds.height
        }
    })
  }
  ```

  Coordonate system of the html browser is from the top left to the bottom right when the threejs begins at the center of the image in all direction, so we will need to convert the threejs position to stick to the html pos.

  ```js
  setPositions(){
    this.imageStore.forEach(o =>{
      o.mesh.position.y = -o.top + this.height / 2 - o.height / 2;
      o.mesh.position.x = o.left - this.width / 2 + o.width/2;
    })
  }
  ```

  We will use 2 lib to wait for the images to load and the fontface. 

```js
import FontFaceObserver from 'fontfaceobserver';
import imagesLoaded from 'imagesloaded';


...

export default class Sketch{
    ...
    const fontOpen = new Promise(resolve => {
        new FontFaceObserver("Open Sans").load().then(() => {
        resolve();
        });
    });

    const fontPlayfair = new Promise(resolve => {
        new FontFaceObserver("Playfair Display").load().then(() => {
        resolve();
        });
    });

    // Preload images
    const preloadImages = new Promise((resolve, reject) => {
        imagesLoaded(document.querySelectorAll("img"), { background: true }, resolve);
    });
    
    let allDone = [fontOpen,fontPlayfair,preloadImages]
    Promise.all(allDone).then(()=>{
        this.addImages();
        this.setPositions();
        this.addObjects();
        
        this.resize();
        this.render();
        this.setupResize();
        // this.settings();
    });
} 
```

Next we had the texture 
```js
addImages(){
    ...
    let texture = new THREE.Texture(img);
        texture.needsUpdate = true;
        let material = new THREE.MeshBasicMaterial({
          //color: 0xff0000, 
          map: texture
        })
    ...
}
```

## Last part : merge scroll

Use library such as locomotive to trigger the scroll & mock it. 

```
...
let currentScroll = 0;
Promise.all(allDone).then(()=>{
    ...
        this.scroll = new Scroll();
        window.addEventListener('scroll', () =>{
        this.setPositions();
        });
    ...
});
...
setPositions(){
this.imageStore.forEach(o =>{
    o.mesh.position.y = this.currentScroll -o.top + this.height / 2 - o.height / 2;
    o.mesh.position.x = o.left - this.width / 2 + o.width/2;
})
}
...
render(){
    ...
    this.scroll.render();
    this.currentScroll = this.scroll.scrollToRender;
    this.setPositions();
    ...
}
...
```