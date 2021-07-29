import * as THREE from "https://cdn.skypack.dev/pin/three@v0.128.0-SXSuUzgcVxHzCfF3m6eh/mode=imports,min/optimized/three.js";

let loader = new THREE.TextureLoader();

export class Track {
  constructor(objectDetails) {
    this.z = 0;
    this.color = 0x000000;

    this.start = 0;
    this.checkpoints = 800;

    this.turnRadius = 40;
    this.trackWidth = 1080;
    this.trackHeight = 480;

    this.objectLength = objectDetails.objectLength;
    this.objectWidth = objectDetails.objectWidth;
    this.objectDepth = objectDetails.objectDepth;

    this.textureWidth = this.objectWidth * 2;

    this.UP = new THREE.Vector3(0, 0, -1);

    this.O = new THREE.Vector3(0, 0, 0);
    this.X = new THREE.Vector3(1, 0, 0);
    this.Y = new THREE.Vector3(0, 1, 0);
    this.Z = new THREE.Vector3(0, 0, 1);

    this.setRectCoordinates(
      "eP",
      "eQ",
      "eR",
      "eS",
      this.trackWidth / 2,
      this.trackHeight / 2
    );
    this.setRectCoordinates(
      "rP",
      "rQ",
      "rR",
      "rS",
      this.textureWidth / 2,
      this.textureWidth / 2
    );

    {
      this.A = this.eS.clone().add(new THREE.Vector3(this.turnRadius, 0, 0)); // Bottom Left
      this.B = this.eP.clone().add(new THREE.Vector3(-this.turnRadius, 0, 0)); // Bottom Left
      this.C = this.eP.clone().add(new THREE.Vector3(0, this.turnRadius, 0)); // Right Bottom
      this.D = this.eQ.clone().add(new THREE.Vector3(0, -this.turnRadius, 0)); // Right Top
      this.E = this.eQ.clone().add(new THREE.Vector3(-this.turnRadius, 0, 0)); // Top Left
      this.F = this.eR.clone().add(new THREE.Vector3(this.turnRadius, 0, 0)); // Top Right
      this.G = this.eR.clone().add(new THREE.Vector3(0, -this.turnRadius, 0)); // Left Top
      this.H = this.eS.clone().add(new THREE.Vector3(0, this.turnRadius, 0)); // Left Bottom
    }

    {
      this.dP = this.eP.clone().add(this.rP.clone().multiplyScalar(1));
      this.dQ = this.eQ.clone().add(this.rQ.clone().multiplyScalar(1));
      this.dR = this.eR.clone().add(this.rR.clone().multiplyScalar(1));
      this.dS = this.eS.clone().add(this.rS.clone().multiplyScalar(1));
      this.oP = this.eP.clone().add(this.rP.clone().multiplyScalar(2));
      this.oQ = this.eQ.clone().add(this.rQ.clone().multiplyScalar(2));
      this.oR = this.eR.clone().add(this.rR.clone().multiplyScalar(2));
      this.oS = this.eS.clone().add(this.rS.clone().multiplyScalar(2));
      this.pP = this.eP.clone().add(this.rP.clone().multiplyScalar(3));
      this.pQ = this.eQ.clone().add(this.rQ.clone().multiplyScalar(3));
      this.pR = this.eR.clone().add(this.rR.clone().multiplyScalar(3));
      this.pS = this.eS.clone().add(this.rS.clone().multiplyScalar(3));

      this.sceneWidth = this.pQ.distanceTo(this.pR);
      this.sceneHeight = this.pQ.distanceTo(this.pP);
    }

    {
      this.mP = this.eP.clone().add(this.dP).divideScalar(2); // Bottom Left Street Light
      this.mQ = this.eQ.clone().add(this.dQ).divideScalar(2); // Top Left Street Light
      this.mR = this.eR.clone().add(this.dR).divideScalar(2); // Top Right Street Light
      this.mS = this.eS.clone().add(this.dS).divideScalar(2); // Bottom Right Street Light
    }

    {
      this.mPQ = this.mP.clone().add(this.mQ).divideScalar(2); // Right Center Street Light
      this.mQR = this.mQ.clone().add(this.mR).divideScalar(2); // Top Center Street Light
      this.mRS = this.mR.clone().add(this.mS).divideScalar(2); // Left Center Street Light
      this.mSP = this.mS.clone().add(this.mP).divideScalar(2); // Bottom Center Street Light
    }

    {
      this.cK = this.mSP.clone().add(this.mQR).divideScalar(2); // Lawn Center
      this.cJ = this.cK.clone().add(this.mRS).divideScalar(2); // Left Lawn Light
      this.cL = this.cK.clone().add(this.mPQ).divideScalar(2); // Right Lawn Light
    }
  }

  mod(n, m) {
    return ((n % m) + m) % m;
  }

  loadTexture(filename, repeatsX, repeatsY) {
    let texture = loader.load(filename);
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    texture.magFilter = THREE.NearestFilter;
    texture.repeat.set(repeatsX, repeatsY);

    return texture;
  }

  rectangle(pt1, pt2, color) {
    let rect = new THREE.Shape();

    rect.moveTo(pt1.x, pt1.y);
    rect.lineTo(pt2.x, pt1.y);
    rect.lineTo(pt2.x, pt2.y);
    rect.lineTo(pt1.x, pt2.y);

    const geometry = new THREE.ShapeGeometry(rect);
    const material = new THREE.MeshPhongMaterial({
      color: color,
    });

    let rectMesh = new THREE.Mesh(geometry, material);

    return rectMesh;
  }

  setPathTexture(pt1, pt2, filename) {
    let distance = pt1.distanceTo(pt2);
    let num = Math.ceil(distance / 150);

    let block = new THREE.PlaneGeometry(1, 1);
    let roadMat = new THREE.MeshPhongMaterial({
      map: this.loadTexture(filename, num, 1),
    });

    let p = pt1.clone().add(pt2).divideScalar(2);

    var roadmesh = new THREE.Mesh(block, roadMat);

    roadmesh.position.x = p.x;
    roadmesh.position.y = p.y;
    roadmesh.position.z = p.z;

    roadmesh.scale.x = distance;
    roadmesh.scale.y = this.objectWidth * 2;

    let angleZ = this.getTangentAngle(pt1, pt2);
    roadmesh.rotateZ(angleZ);

    return roadmesh;
  }

  setTrackTexture(filename, rectColor, p, q) {
    let meshes = [];

    meshes.push(this.setPathTexture(p.pt4, p.pt1, filename));
    meshes.push(this.setPathTexture(p.pt1, p.pt2, filename));
    meshes.push(this.setPathTexture(p.pt2, p.pt3, filename));
    meshes.push(this.setPathTexture(p.pt3, p.pt4, filename));
    meshes.push(this.rectangle(p.pt1, q.pt1, rectColor));
    meshes.push(this.rectangle(p.pt2, q.pt2, rectColor));
    meshes.push(this.rectangle(p.pt3, q.pt3, rectColor));
    meshes.push(this.rectangle(p.pt4, q.pt4, rectColor));

    return meshes;
  }

  setBlockTexture(blocks) {
    let block = new THREE.PlaneGeometry(1, 1);
    let potholeMat = new THREE.MeshPhongMaterial({
      map: this.loadTexture("/textures/pothole.png", 1, 1),
      transparent: true,
    });

    for (let i = 0; i < blocks.length; i++) {
      let c = this.travelP.routeP[this.blockL[i]];
      let q = this.travelP.routeQ[this.blockL[i]];
      let a = this.travelP.routeA[this.blockL[i]];

      let potholemesh = new THREE.Mesh(block, potholeMat.clone());
      potholemesh.scale.x = this.textureWidth;
      potholemesh.scale.y = this.textureWidth;
      potholemesh.scale.z = 50;
      potholemesh.position.set(c.x, c.y, this.z);

      potholemesh.quaternion.setFromAxisAngle(this.UP, q);
      potholemesh.rotation.z += a - Math.PI / 2;

      this.texture.add(potholemesh);
    }
  }

  model() {
    this.path.moveTo(this.A.x, this.A.y);
    this.path.lineTo(this.B.x, this.B.y);
    this.path.bezierCurveTo(this.B.x, this.B.y, this.eP.x, this.eP.y, this.C.x, this.C.y);
    this.path.lineTo(this.D.x, this.D.y);
    this.path.bezierCurveTo(this.D.x, this.D.y, this.eQ.x, this.eQ.y, this.E.x, this.E.y);
    this.path.lineTo(this.F.x, this.F.y);
    this.path.bezierCurveTo(this.F.x, this.F.y, this.eR.x, this.eR.y, this.G.x, this.G.y);
    this.path.lineTo(this.H.x, this.H.y);
    this.path.bezierCurveTo(this.H.x, this.H.y, this.eS.x, this.eS.y, this.A.x, this.A.y);

    let routeT = Array.from(
      { length: this.checkpoints + 1 },
      (_, i) => this.start + (i / this.checkpoints) * 1
    );
    this.travelP = this.computeSpatialCoordinates(this.path, routeT, null);

    const points = this.path.getPoints();
    const geometry = new THREE.BufferGeometry().setFromPoints(points);
    const material = new THREE.LineBasicMaterial({ color: this.color });

    const model = new THREE.Line(geometry, material);
    return model;
  }

  getTangentAngle(p, q) {
    return Math.atan2(q.y - p.y, q.x - p.x);
  }

  getNormalAngle(path, position) {
    let tangent = path.getTangent(position).normalize();
    let angle = -Math.PI / 2 + Math.atan2(tangent.x, tangent.y);
    return angle;
  }

  setRectCoordinates(pt1, pt2, pt3, pt4, length, breadth) {
    this[pt1] = new THREE.Vector3(length, -breadth, this.z);
    this[pt2] = new THREE.Vector3(length, breadth, this.z);
    this[pt3] = new THREE.Vector3(-length, breadth, this.z);
    this[pt4] = new THREE.Vector3(-length, -breadth, this.z);
  }
}
