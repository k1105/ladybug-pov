class LadybugPerspective {
  constructor() {
    this.clock = new THREE.Clock();
    this.renderer = new Renderer();
    this.camera = new Camera();
    this.scene = new Scene();
    this.joystick = new Joystick();
    this.isDragging = false;
    this.lastMouseX = 0;
    this.lastMouseY = 0;
    this.dragSensitivity = 0.005;

    this.init();
  }

  init() {
    this.setupRenderer();
    this.setupCamera();
    this.setupScene();
    this.setupJoystick();
    this.setupEventListeners();
    this.animate();

    // Hide loading
    document.getElementById("loading").style.display = "none";
  }

  setupRenderer() {
    this.renderer.setup();
  }

  setupCamera() {
    this.camera.setup();
  }

  setupScene() {
    this.scene.setup();
  }

  setupJoystick() {
    this.joystick.setup((x, y, isEasing) => {
      // Reset camera orientation when joystick is used
      if (!isEasing && (x !== 0 || y !== 0)) {
        this.camera.resetOrientation();
      }
      this.camera.setMovement(
        x * this.camera.maxYawSpeed,
        -y * this.camera.maxMoveSpeed,
        isEasing
      );
    });
  }

  setupEventListeners() {
    window.addEventListener("resize", () => this.onWindowResize());

    // Add mouse/touch event listeners for camera orientation
    const canvas = this.renderer.renderer.domElement;

    // Mouse events
    canvas.addEventListener("mousedown", (e) => this.onDragStart(e));
    canvas.addEventListener("mousemove", (e) => this.onDragMove(e));
    canvas.addEventListener("mouseup", () => this.onDragEnd());
    canvas.addEventListener("mouseleave", () => this.onDragEnd());

    // Touch events
    canvas.addEventListener("touchstart", (e) => this.onDragStart(e), {
      passive: false,
    });
    canvas.addEventListener("touchmove", (e) => this.onDragMove(e), {
      passive: false,
    });
    canvas.addEventListener("touchend", () => this.onDragEnd());
  }

  onDragStart(event) {
    // Check if the event is within the joystick area
    const joystickBase = document.getElementById("joystick-base");
    const rect = joystickBase.getBoundingClientRect();
    const clientX = event.touches ? event.touches[0].clientX : event.clientX;
    const clientY = event.touches ? event.touches[0].clientY : event.clientY;

    if (
      clientX >= rect.left &&
      clientX <= rect.right &&
      clientY >= rect.top &&
      clientY <= rect.bottom
    ) {
      return;
    }

    event.preventDefault();
    this.isDragging = true;
    this.lastMouseX = clientX;
    this.lastMouseY = clientY;
  }

  onDragMove(event) {
    if (!this.isDragging) return;

    event.preventDefault();
    const clientX = event.touches ? event.touches[0].clientX : event.clientX;
    const clientY = event.touches ? event.touches[0].clientY : event.clientY;

    const deltaX = clientX - this.lastMouseX;
    const deltaY = clientY - this.lastMouseY;

    // Update camera orientation (reversed direction)
    this.camera.yaw += deltaX * this.dragSensitivity;
    this.camera.pitch = Math.max(
      -this.camera.maxPitch,
      Math.min(
        this.camera.maxPitch,
        this.camera.pitch + deltaY * this.dragSensitivity
      )
    );

    this.lastMouseX = clientX;
    this.lastMouseY = clientY;
  }

  onDragEnd() {
    this.isDragging = false;
  }

  animate() {
    requestAnimationFrame(() => this.animate());

    const deltaTime = this.clock.getDelta();
    this.camera.update(deltaTime);
    this.scene.update(deltaTime);
    this.renderer.render(this.scene.scene, this.camera.camera);
  }

  onWindowResize() {
    this.renderer.onWindowResize(this.camera.camera);
  }
}
