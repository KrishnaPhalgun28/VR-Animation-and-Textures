// Reference
//
// 1. https://youtu.be/JhgBwJn1bQw
// 2. https://codepen.io/HunorMarton/pen/qBqzQOJ

import * as THREE from "https://cdn.skypack.dev/pin/three@v0.128.0-SXSuUzgcVxHzCfF3m6eh/mode=imports,min/optimized/three.js";

export class Car {
    constructor(bodyColor) {
        this.bodyColor = bodyColor;
        this.cabinColor = 0x1d3c45;

        this.model = this.model();
    }

    wheel() {
        const wheelGeometry = new THREE.BoxBufferGeometry(12, 33, 12);
        const wheelMaterial = new THREE.MeshLambertMaterial({
            color: 0x333333
        });

        const wheel = new THREE.Mesh(wheelGeometry, wheelMaterial);
        wheel.position.z = 6;
        wheel.castShadow = false;
        wheel.receiveShadow = false;

        return wheel;
    }

    getCarFrontTexture(framecolor) {
        const canvas = document.createElement("canvas");
        canvas.width = 64;
        canvas.height = 32;
        const context = canvas.getContext("2d");

        context.fillStyle = framecolor;
        context.fillRect(0, 0, 64, 32);

        context.fillStyle = "#666666";
        context.fillRect(8, 8, 48, 24);

        return new THREE.CanvasTexture(canvas);
    }

    getCarSideTexture(framecolor) {
        const canvas = document.createElement("canvas");
        canvas.width = 128;
        canvas.height = 32;
        const context = canvas.getContext("2d");

        context.fillStyle = framecolor;
        context.fillRect(0, 0, 128, 32);

        context.fillStyle = "#666666";
        context.fillRect(10, 8, 38, 24);
        context.fillRect(58, 8, 60, 24);

        return new THREE.CanvasTexture(canvas);
    }

    getHeadLightTexture(shift) {
        let bulb = new THREE.Mesh(
            new THREE.BoxBufferGeometry(),
            new THREE.MeshBasicMaterial({
                color: 0xffffff
            })
        );
        bulb.scale.y = 5;
        bulb.scale.z = 5;
        bulb.position.set(30.5, shift, 12);

        var spotLight = new THREE.SpotLight(0xffffff, 3, 140);
        spotLight.target.position.set(140, 0, 0);

        bulb.add(spotLight);
        bulb.add(spotLight.target);

        return bulb;
    }

    model() {
        const car = new THREE.Group();

        const main = new THREE.Mesh(
            new THREE.BoxBufferGeometry(60, 30, 15),
            new THREE.MeshLambertMaterial({
                color: this.bodyColor
            })
        );
        main.position.z = 12;
        main.castShadow = true;
        main.receiveShadow = true;
        car.add(main);

        const carFrontTexture = this.getCarFrontTexture("#ffffff");
        carFrontTexture.center = new THREE.Vector2(0.5, 0.5);
        carFrontTexture.rotation = Math.PI / 2;

        const carBackTexture = this.getCarFrontTexture("#333333");
        carBackTexture.center = new THREE.Vector2(0.5, 0.5);
        carBackTexture.rotation = -Math.PI / 2;

        const carLeftSideTexture = this.getCarSideTexture("#ffffff");
        carLeftSideTexture.flipY = false;

        const carRightSideTexture = this.getCarSideTexture("#ffffff");

        const cabin = new THREE.Mesh(new THREE.BoxBufferGeometry(33, 24, 12), [
            new THREE.MeshLambertMaterial({
                map: carFrontTexture
            }),
            new THREE.MeshLambertMaterial({
                map: carBackTexture
            }),
            new THREE.MeshLambertMaterial({
                map: carLeftSideTexture
            }),
            new THREE.MeshLambertMaterial({
                map: carRightSideTexture
            }),
            new THREE.MeshLambertMaterial({
                color: this.cabinColor
            }),
            new THREE.MeshLambertMaterial({
                color: this.cabinColor
            }),
        ]);
        cabin.position.x = -6;
        cabin.position.z = 25.5;
        cabin.castShadow = true;
        cabin.receiveShadow = true;
        car.add(cabin);

        const backWheel = this.wheel();
        backWheel.position.x = -18;
        car.add(backWheel);

        const frontWheel = this.wheel();
        frontWheel.position.x = 18;
        car.add(frontWheel);

        let bbox = new THREE.Box3().setFromObject(car);
        this.objectLength = bbox.max.x - bbox.min.x;
        this.objectWidth = bbox.max.y - bbox.min.y;
        this.objectDepth = bbox.max.z - bbox.min.z;

        const leftLight = this.getHeadLightTexture(-8.5);
        car.add(leftLight);

        const rightLight = this.getHeadLightTexture(8.5);
        car.add(rightLight);

        return car;
    }
}