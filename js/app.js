import * as THREE from "three";
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
// import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import FontFaceObserver from 'fontfaceobserver';
import imagesLoaded from 'imagesloaded';
import fragment from "./shader/fragment.glsl";
import vertex from "./shader/vertex.glsl";
import * as dat from "dat.gui";
import gsap from "gsap";
import Scroll from "./lib/scroll";

export default class Sketch {
  constructor(options) {
    this.scene = new THREE.Scene();

    this.container = options.dom;
    this.width = this.container.offsetWidth;
    this.height = this.container.offsetHeight;
    this.renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true
    });
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    this.renderer.setSize(this.width, this.height);
    //this.renderer.setClearColor(0xeeeeee, 1);  

    this.container.appendChild(this.renderer.domElement);

    this.camera = new THREE.PerspectiveCamera(
      70,
      window.innerWidth / window.innerHeight,
      0.001,
      1000
    );

    this.images = [...document.querySelectorAll('img')];

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

    // var frustumSize = 10;
    // var aspect = window.innerWidth / window.innerHeight;
    // this.camera = new THREE.OrthographicCamera( frustumSize * aspect / - 2, frustumSize * aspect / 2, frustumSize / 2, frustumSize / - 2, -1000, 1000 );
    let dist = 600;
    this.camera.position.set(0, 0, dist);
    this.camera.fov = 2*Math.atan((window.innerHeight/2) / dist) * (180/Math.PI);
    this.controls = new OrbitControls(this.camera, this.renderer.domElement);
    this.time = 0;

    this.isPlaying = true;
    
    let allDone = [fontOpen,fontPlayfair,preloadImages];
    let currentScroll = 0;
    Promise.all(allDone).then(()=>{
      this.scroll = new Scroll();
      this.addImages();
      this.setPositions();
      //this.addObjects();
      
      this.resize();
      this.render();
      this.setupResize();
      // this.settings();
      window.addEventListener('scroll', () =>{
        this.setPositions();
      });
    });
  }

  settings() {
    let that = this;
    this.settings = {
      progress: 0,
    };
    this.gui = new dat.GUI();
    this.gui.add(this.settings, "progress", 0, 1, 0.01);
  }

  setupResize() {
    window.addEventListener("resize", this.resize.bind(this));
  }

  resize() {
    this.width = this.container.offsetWidth;
    this.height = this.container.offsetHeight;
    this.renderer.setSize(this.width, this.height);
    this.camera.aspect = this.width / this.height;
    this.camera.updateProjectionMatrix();
  }

  addImages(){
    this.imageStore = this.images.map(img =>{
        let bounds = img.getBoundingClientRect();
        console.log(bounds);

        let geometry = new THREE.PlaneBufferGeometry(bounds.width, bounds.height, 1, 1);
        let texture = new THREE.Texture(img);
        texture.needsUpdate = true;
        let material = new THREE.MeshBasicMaterial({
          //color: 0xff0000, 
          map: texture
        })

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
    //console.log(this.imageStore)
  }

  setPositions(){
    this.imageStore.forEach(o =>{
      o.mesh.position.y = this.currentScroll -o.top + this.height / 2 - o.height / 2;
      o.mesh.position.x = o.left - this.width / 2 + o.width/2;
    })
  }

  addObjects() {
    let that = this;
    this.material = new THREE.ShaderMaterial({
      extensions: {
        derivatives: "#extension GL_OES_standard_derivatives : enable"
      },
      side: THREE.DoubleSide,
      uniforms: {
        time: { value: 0 },
        resolution: { value: new THREE.Vector4() },
      },
      wireframe: true,
      transparent: true,
      vertexShader: vertex,
      fragmentShader: fragment
    });

    this.geometry = new THREE.PlaneGeometry(100, 100, 10, 10);

    this.plane = new THREE.Mesh(this.geometry, this.material);
    this.scene.add(this.plane);
  }

  stop() {
    this.isPlaying = false;
  }

  play() {
    if(!this.isPlaying){
      this.render()
      this.isPlaying = true;
    }
  }

  render() {
    if (!this.isPlaying) return;
    this.time += 0.05;
    this.scroll.render();
    this.currentScroll = this.scroll.scrollToRender;
    this.setPositions();
    //this.material.uniforms.time.value = this.time;
    requestAnimationFrame(this.render.bind(this));
    this.renderer.render(this.scene, this.camera);
  }
}

new Sketch({
  dom: document.getElementById("container")
});




