class Renderer {
  constructor() {
    this.renderer = null;
  }

  setup() {
    this.renderer = new THREE.WebGLRenderer({
      antialias: false, // Disable for better mobile performance
      powerPreference: "high-performance",
    });
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.setClearColor(0x87ceeb);
    this.renderer.fog = true;

    document
      .getElementById("canvas-container")
      .appendChild(this.renderer.domElement);
  }

  render(scene, camera) {
    this.renderer.render(scene, camera);
  }

  onWindowResize(camera) {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    this.renderer.setSize(window.innerWidth, window.innerHeight);
  }
}
