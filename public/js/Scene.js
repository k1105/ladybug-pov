class Scene {
  constructor() {
    this.scene = null;
    this.grassInstances = []; // Store grass instances for animation
    this.windTime = 0; // Time counter for wind animation
  }

  setup() {
    this.scene = new THREE.Scene();

    // Load and set up sky environment map
    const rgbeLoader = new THREE.RGBELoader();
    rgbeLoader.setPath("/public/texture/");
    rgbeLoader.setDataType(THREE.FloatType); // 高精度なデータ型を使用
    rgbeLoader.load("sky.hdr", (texture) => {
      texture.mapping = THREE.EquirectangularReflectionMapping;

      // テクスチャのフィルタリング設定を改善
      texture.minFilter = THREE.LinearFilter;
      texture.magFilter = THREE.LinearFilter;
      texture.encoding = THREE.sRGBEncoding;
      texture.generateMipmaps = true;

      // トーンマッピングの設定を調整
      this.scene.toneMapping = THREE.CineonToneMapping; // より自然な色味のトーンマッピング
      this.scene.toneMappingExposure = 0.35; // 露出をさらに下げて彩度を抑制

      this.scene.environment = texture;
      this.scene.background = texture;
    });

    // Add fog for atmosphere
    this.scene.fog = new THREE.Fog(0xbfdfff, 15, 80); // ← near/far 調整

    // Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.35); // 環境光をさらに弱める
    this.scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.5); // 直射光も弱める
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
      roughness: 1.0, // 完全にマットな見た目に
      metalness: 0.0,
      envMapIntensity: 0.0, // 環境反射を完全に無効化
    });

    groundMaterial.normalScale.set(2, 2); // 法線マップの強度をさらに下げる

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
      roughness: 1.0, // 完全にマットな見た目に
      metalness: 0.0,
      envMapIntensity: 0.0, // 環境反射を完全に無効化
    });

    // 法線マップの強度を下げる
    grassMaterial.normalScale.set(2, 2);

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
      position.set((Math.random() - 0.5) * 10, 0, (Math.random() - 0.5) * 10);

      // Random rotation with slight tilt
      rotation.set(
        (Math.random() - 0.5) * 0.2,
        Math.random() * Math.PI * 2,
        (Math.random() - 0.5) * 0.2
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

      // Calculate wind parameters based on grass height and type
      const heightFactor = planeHeight / 2.2; // Normalize by tallest grass height
      const randomFactor = 0.5 + Math.random() * 0.5; // Random factor between 0.5 and 1.0

      // Store original rotation and wind parameters for animation
      instance.userData = {
        originalRotation: rotation.clone(),
        windOffset: Math.random() * Math.PI * 2,
        windStrength:
          (0.05 + Math.random() * 0.05) * heightFactor * randomFactor, // Base strength modified by height
        windSpeed: 1.5 + Math.random() * 0.5, // Random speed between 1.5 and 2.0
        windFrequency: 1.0 + Math.random() * 0.5, // Random frequency between 1.0 and 1.5
      };

      this.grassInstances.push(instance);
      this.scene.add(instance);
    }
  }

  // Add update method for wind animation
  update(deltaTime) {
    this.windTime += deltaTime;

    // Update each grass instance
    this.grassInstances.forEach((instance) => {
      const {
        originalRotation,
        windOffset,
        windStrength,
        windSpeed,
        windFrequency,
      } = instance.userData;

      // Calculate wind movement using sine wave with varying parameters
      const windMovement =
        Math.sin(this.windTime * windSpeed + windOffset) *
        windStrength *
        Math.sin(this.windTime * windFrequency);

      // Apply wind movement to rotation (only X and Z axes)
      instance.rotation.x = originalRotation.x + windMovement;
      instance.rotation.z = originalRotation.z + windMovement * 0.5;
    });
  }
}
