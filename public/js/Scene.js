class Scene {
  constructor() {
    this.scene = null;
  }

  setup() {
    this.scene = new THREE.Scene();

    // Add fog for atmosphere
    this.scene.fog = new THREE.Fog(0xbfdfff, 15, 80); // ← near/far 調整

    // Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    this.scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(10, 10, 5);
    this.scene.add(directionalLight);

    this.createGround();
    this.createGrass();
  }

  createGround() {
    // Load textures
    const textureLoader = new THREE.TextureLoader();

    const colorMap = textureLoader.load("/public/texture/ground_color.jpg");
    const normalMap = textureLoader.load("/public/texture/ground_normal.jpg");
    const roughnessMap = textureLoader.load(
      "/public/texture/ground_roughness.jpg"
    );

    // Set texture repeat
    const repeat = 200;
    [colorMap, normalMap, roughnessMap].forEach((texture) => {
      texture.wrapS = THREE.RepeatWrapping;
      texture.wrapT = THREE.RepeatWrapping;
      texture.repeat.set(repeat, repeat);
    });

    // Create ground geometry
    const groundGeometry = new THREE.PlaneGeometry(200, 200);

    // Create PBR material

    const groundMaterial = new THREE.MeshStandardMaterial({
      map: colorMap,
      normalMap: normalMap,
      roughnessMap: roughnessMap,
      roughness: 0.7,
      metalness: 0.1,
    });

    groundMaterial.normalScale.set(10, 10);

    const ground = new THREE.Mesh(groundGeometry, groundMaterial);
    ground.rotation.x = -Math.PI / 2;
    this.scene.add(ground);
  }

  createGrass() {
    // Create multiple grass layers with different textures and properties
    this.createGrassLayer("/public/texture/grass2", 4, 1, 0.2, 2.2, 1000, 0.5); // Tall grass
    this.createGrassLayer(
      "/public/texture/grass1",
      4,
      1,
      0.15,
      0.4,
      7000,
      0.15
    ); // Medium grass
    this.createGrassLayer("/public/texture/leaf1", 2, 3, 0.3, 0.8, 300, 0.3); // Small leaves
  }

  createGrassLayer(
    texturePath,
    gridX,
    gridY,
    planeWidth,
    planeHeight,
    count,
    translateY
  ) {
    // Load textures
    const textureLoader = new THREE.TextureLoader();

    const colorMap = textureLoader.load(`${texturePath}/color.jpg`);
    const normalMap = textureLoader.load(`${texturePath}/normal.jpg`);
    const roughnessMap = textureLoader.load(`${texturePath}/roughness.jpg`);
    const alphaMap = textureLoader.load(`${texturePath}/alpha.jpg`);

    // Configure texture grid
    [colorMap, normalMap, roughnessMap, alphaMap].forEach((texture) => {
      texture.wrapS = THREE.RepeatWrapping;
      texture.wrapT = THREE.RepeatWrapping;
      texture.repeat.set(1 / gridX, 1 / gridY);
    });

    // Create grass geometry
    const grassGeometry = new THREE.PlaneGeometry(planeWidth, planeHeight);
    grassGeometry.translate(0, planeHeight * translateY, 0);

    // Create PBR material
    const grassMaterial = new THREE.MeshStandardMaterial({
      map: colorMap,
      normalMap: normalMap,
      roughnessMap: roughnessMap,
      alphaMap: alphaMap,
      transparent: true,
      alphaTest: 0.5,
      side: THREE.DoubleSide,
      roughness: 0.8,
      metalness: 0.0,
    });

    // Create instanced mesh
    const instancedGrass = new THREE.InstancedMesh(
      grassGeometry,
      grassMaterial,
      count
    );

    const matrix = new THREE.Matrix4();
    const position = new THREE.Vector3();
    const rotation = new THREE.Euler();
    const scale = new THREE.Vector3();

    // Create instances with random positions, rotations, and texture variants
    for (let i = 0; i < count; i++) {
      // Random position in field
      position.set((Math.random() - 0.5) * 10, 0.1, (Math.random() - 0.5) * 10);

      // Random rotation with slight tilt
      rotation.set(
        (Math.random() - 0.5) * 0.2, // X軸のランダムな傾き（-0.1 から 0.1 ラジアン）
        Math.random() * Math.PI * 2, // Y軸の回転（0 から 2π ラジアン）
        (Math.random() - 0.5) * 0.2 // Z軸のランダムな傾き（-0.1 から 0.1 ラジアン）
      );

      // Random scale between 1.0 and 1.5
      const scaleValue = 1.0 + Math.random() * 0.5;
      scale.set(scaleValue, scaleValue, scaleValue);

      matrix.compose(
        position,
        new THREE.Quaternion().setFromEuler(rotation),
        scale
      );
      instancedGrass.setMatrixAt(i, matrix);

      // Set random texture variant for this instance
      const variantX = Math.floor(Math.random() * gridX);
      const variantY = Math.floor(Math.random() * gridY);
      const offsetX = variantX / gridX;
      const offsetY = variantY / gridY;

      // Create a unique material for this instance
      const instanceMaterial = grassMaterial.clone();
      instanceMaterial.map.offset.set(offsetX, offsetY);
      instanceMaterial.normalMap.offset.set(offsetX, offsetY);
      instanceMaterial.roughnessMap.offset.set(offsetX, offsetY);
      instanceMaterial.alphaMap.offset.set(offsetX, offsetY);

      // Add the instance with its material to the scene
      const instance = new THREE.Mesh(grassGeometry, instanceMaterial);
      instance.position.copy(position);
      instance.rotation.copy(rotation);
      instance.scale.copy(scale);
      this.scene.add(instance);
    }
  }
}
