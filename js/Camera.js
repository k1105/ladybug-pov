class Camera {
  constructor() {
    this.camera = null;
    this.moveSpeed = 0;
    this.maxMoveSpeed = 2;
    this.yawSpeed = 0;
    this.maxYawSpeed = 1.5;
    this.yaw = 0;
    this.pitch = -0.1; // Slightly looking down
    this.maxPitch = Math.PI / 6; // 30 degrees up/down

    // Add oscillation parameters
    this.oscillationTime = 0;
    this.oscillationSpeed = 50; // Speed of oscillation
    this.baseOscillationAmplitude = 0.005; // Base amplitude of oscillation
    this.baseHeight = 0.05; // Base height of the camera
    this.isEasing = false;

    // Add orientation reset parameters
    this.targetYaw = 0;
    this.targetPitch = -0.1;
    this.orientationEasing = 0.3; // Higher value = faster easing
    this.isResettingOrientation = false;
    this.baseYaw = 0; // Store the base yaw for joystick movement
  }

  setup() {
    this.camera = new THREE.PerspectiveCamera(
      50, // Narrow field of view
      window.innerWidth / window.innerHeight,
      0.01, // Very close near plane for ladybug scale
      100
    );

    // Position camera very low to ground (ladybug height)
    this.camera.position.set(0, 0.05, 0);
  }

  update(deltaTime) {
    // Update yaw (left/right rotation) first
    this.yaw -= this.yawSpeed * deltaTime;
    this.baseYaw = this.yaw; // Update base yaw with current yaw

    // Handle orientation reset animation
    if (this.isResettingOrientation) {
      const pitchDiff = this.targetPitch - this.pitch;

      // Check if we're close enough to target to stop
      if (Math.abs(pitchDiff) < 0.001) {
        this.pitch = this.targetPitch;
        this.isResettingOrientation = false;
      } else {
        // Apply easing only to pitch
        this.pitch += pitchDiff * this.orientationEasing;
      }
    }

    // Create rotation quaternion with yaw and pitch, but NO roll
    const yawQuaternion = new THREE.Quaternion().setFromAxisAngle(
      new THREE.Vector3(0, 1, 0),
      this.yaw
    );
    const pitchQuaternion = new THREE.Quaternion().setFromAxisAngle(
      new THREE.Vector3(1, 0, 0),
      this.pitch
    );

    // Combine rotations (yaw first, then pitch)
    const finalQuaternion = new THREE.Quaternion().multiplyQuaternions(
      yawQuaternion,
      pitchQuaternion
    );
    this.camera.quaternion.copy(finalQuaternion);

    // Move forward along camera's forward direction
    if (this.moveSpeed !== 0) {
      const forward = new THREE.Vector3(0, 0, -1);
      forward.applyQuaternion(this.camera.quaternion);
      forward.multiplyScalar(this.moveSpeed * deltaTime);
      this.camera.position.add(forward);

      // Only apply oscillation if not in easing state
      if (!this.isEasing) {
        // Update oscillation time
        this.oscillationTime += deltaTime * this.oscillationSpeed;

        // Calculate oscillation amplitude based on movement speed
        const speedRatio = Math.abs(this.moveSpeed) / this.maxMoveSpeed;
        const currentAmplitude = this.baseOscillationAmplitude * speedRatio;

        // Apply oscillation to camera height
        const oscillation = Math.sin(this.oscillationTime) * currentAmplitude;
        this.camera.position.y = this.baseHeight + oscillation;
      } else {
        this.camera.position.y = this.baseHeight;
      }
    } else {
      // Reset oscillation when not moving
      this.oscillationTime = 0;
      this.camera.position.y = this.baseHeight;
    }
  }

  setMovement(yawSpeed, moveSpeed, isEasing = false) {
    this.yawSpeed = yawSpeed;
    this.moveSpeed = moveSpeed;
    this.isEasing = isEasing;
  }

  resetOrientation() {
    this.targetPitch = -0.1;
    this.isResettingOrientation = true;
    // Don't reset yaw immediately, let it ease to the current base yaw
    this.targetYaw = this.baseYaw;
  }
}
