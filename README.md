# merging-threejs-html


## Merge sizes of html & threejs 
![alt text](fov.png)


```js
this.camera.fov = 2*Math.atan((window.innerHeight/2) / dist) * (180/Math.PI);
```
2 => 2 times the half height to get the real browser height
atan => get the tangent value of window.innerheight/2 divided by the camera dist from the object
*(100/Math.PI) => convert gradient to degrees