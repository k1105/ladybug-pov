class Joystick {
  constructor() {
    this.active = false;
    this.centerX = 0;
    this.centerY = 0;
    this.x = 0;
    this.y = 0;
    this.maxDistance = 35;
    this.onMoveCallback = null;
    this.easing = 0.2;
    this.animationFrame = null;
    this.stopThreshold = 0.05; // Threshold for complete stop
    this.isEasing = false;
  }

  setup(onMoveCallback) {
    this.onMoveCallback = onMoveCallback;
    const base = document.getElementById("joystick-base");
    const knob = document.getElementById("joystick-knob");

    const rect = base.getBoundingClientRect();
    this.centerX = rect.left + rect.width / 2;
    this.centerY = rect.top + rect.height / 2;

    // Touch events
    knob.addEventListener("touchstart", (e) => this.onStart(e), {
      passive: false,
    });
    document.addEventListener("touchmove", (e) => this.onMove(e), {
      passive: false,
    });
    document.addEventListener("touchend", (e) => this.onEnd(e));

    // Mouse events (for desktop testing)
    knob.addEventListener("mousedown", (e) => this.onStart(e));
    document.addEventListener("mousemove", (e) => this.onMove(e));
    document.addEventListener("mouseup", (e) => this.onEnd(e));

    // Start animation loop
    this.animate();
  }

  animate() {
    if (!this.active) {
      // Ease towards center position
      this.x += (0 - this.x) * this.easing;
      this.y += (0 - this.y) * this.easing;

      // Check if we're close enough to center to stop completely
      const distance = Math.sqrt(this.x * this.x + this.y * this.y);
      if (distance < this.stopThreshold) {
        this.x = 0;
        this.y = 0;
        this.isEasing = false;
      } else {
        this.isEasing = true;
      }

      // Update knob position
      const knob = document.getElementById("joystick-knob");
      knob.style.transform = `translate(calc(-50% + ${this.x}px), calc(-50% + ${this.y}px))`;

      // Call the callback with normalized values and easing state
      if (this.onMoveCallback) {
        const normalizedX = this.x / this.maxDistance;
        const normalizedY = this.y / this.maxDistance;
        this.onMoveCallback(normalizedX, normalizedY, this.isEasing);
      }
    }

    this.animationFrame = requestAnimationFrame(() => this.animate());
  }

  onStart(event) {
    event.preventDefault();
    this.active = true;
    this.isEasing = false;

    // Update center position in case of orientation change
    const base = document.getElementById("joystick-base");
    const rect = base.getBoundingClientRect();
    this.centerX = rect.left + rect.width / 2;
    this.centerY = rect.top + rect.height / 2;
  }

  onMove(event) {
    if (!this.active) return;

    event.preventDefault();

    const clientX = event.touches ? event.touches[0].clientX : event.clientX;
    const clientY = event.touches ? event.touches[0].clientY : event.clientY;

    const deltaX = clientX - this.centerX;
    const deltaY = clientY - this.centerY;
    const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);

    if (distance <= this.maxDistance) {
      this.x = deltaX;
      this.y = deltaY;
    } else {
      this.x = (deltaX / distance) * this.maxDistance;
      this.y = (deltaY / distance) * this.maxDistance;
    }

    // Update knob position
    const knob = document.getElementById("joystick-knob");
    knob.style.transform = `translate(calc(-50% + ${this.x}px), calc(-50% + ${this.y}px))`;

    // Call the callback with normalized values and easing state
    if (this.onMoveCallback) {
      const normalizedX = this.x / this.maxDistance;
      const normalizedY = this.y / this.maxDistance;
      this.onMoveCallback(normalizedX, normalizedY, false);
    }
  }

  onEnd(event) {
    this.active = false;
    this.isEasing = true;
  }
}
