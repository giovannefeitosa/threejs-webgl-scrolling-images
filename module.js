import fragment from "./shader/fragment.glsl";
import vertex from "./shader/vertex.glsl";
import * as dat from "dat.gui";
import { TimelineMax } from "gsap";
let OrbitControls = require("three-orbit-controls")(THREE);

export default class Sketch {
  constructor(options) {
    this.scene = new THREE.Scene();
    this.container = options.dom;
    this.width = this.container.offsetWidth;
    this.height = this.container.offsetHeight;
    this.renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
    });
    this.renderer.setPixelRatio(window.devicePixelRatio);
    this.renderer.setSize(this.width, this.height);
    this.renderer.physicallyCorrectLights = true;
    this.renderer.outputEncoding = THREE.sRGBEncoding;

    this.container.appendChild(this.renderer.domElement);

    this.camera = new THREE.PerspectiveCamera(
      70,
      window.innerWidth / window.innerHeight,
      0.001,
      1000
    );

    this.camera.position.set(0, 0, 2);
    this.controls = new OrbitControls(this.camera, this.renderer.domElement);
    this.time = 0;
    this.isPlaying = true;

    this.addObjects();
    this.resize();
    this.render();
    this.setupResize();
    // this.settings();
    this.groups = [];
    this.materials = [];
    this.meshes = [];
    this.handleImages();
  }

  handleImages() {
    let images = [...document.querySelectorAll("img")];

    images.forEach((im, i) => {
      let mat = this.material.clone();
      this.materials.push(mat);
      let group = new THREE.Group();
      // mat.wireframe = true;
      mat.uniforms.texture1.value = new THREE.Texture(im);
      mat.uniforms.texture1.value.needsUpdate = true;

      let geo = new THREE.PlaneBufferGeometry(1.5, 1, 20, 20);
      let mesh = new THREE.Mesh(geo, mat);
      group.add(mesh);
      this.groups.push(group);
      this.scene.add(group);
      this.meshes.push(mesh);
      mesh.position.y = i * 1.2;

      group.rotation.y = -0.5;
      group.rotation.x = -0.3;
      group.rotation.z = -0.1;
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

    this.imageAspect = 853 / 1280;
    let a1;
    let a2;
    if (this.height / this.width > this.imageAspect) {
      a1 = (this.width / this.height) * this.imageAspect;
      a2 = 1;
    } else {
      a1 = 1;
      a2 = this.height / this.width / this.imageAspect;
    }

    this.material.uniforms.resolution.value.x = this.width;
    this.material.uniforms.resolution.value.y = this.height;
    this.material.uniforms.resolution.value.z = a1;
    this.material.uniforms.resolution.value.w = a2;

    this.camera.updateProjectionMatrix();
  }

  addObjects() {
    let that = this;
    this.material = new THREE.ShaderMaterial({
      extensions: {
        derivatives: "#extension GL_OES_standard_derivatives : enable",
      },
      side: THREE.DoubleSide,
      uniforms: {
        time: { type: "f", value: 0 },
        distanceFromCenter: { type: "f", value: 0 },
        texture1: { type: "t", value: null },
        resolution: { type: "v4", value: new THREE.Vector4() },
        uvRate1: { value: new THREE.Vector2(1, 1) },
      },
      // wireframe: true,
      transparent: true,
      vertexShader: vertex,
      fragmentShader: fragment,
    });

    // this.geometry = new THREE.PlaneGeometry(1, 1, 1, 1);
    // this.plane = new THREE.Mesh(this.geometry, this.material);
    // this.scene.add(this.plane);
  }

  stop() {
    this.isPlaying = false;
  }

  play() {
    if (!this.isPlaying) {
      this.render();
      this.isPlaying = true;
    }
  }

  render() {
    if (!this.isPlaying) return;
    this.time += 0.05;
    if (this.materials) {
      this.materials.forEach((m) => {
        m.uniforms.time.value = this.time;
      });
    }
    // this.material.uniforms.time.value = this.time;
    requestAnimationFrame(this.render.bind(this));
    this.renderer.render(this.scene, this.camera);
  }
}
