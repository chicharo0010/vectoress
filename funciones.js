import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

const container = document.getElementById('canvas-container');
const scene = new THREE.Scene();
scene.background = new THREE.Color(0xf0f2f5);
const camera = new THREE.PerspectiveCamera(75, container.clientWidth / container.clientHeight, 0.1, 1000);
camera.position.set(6, 6, 6);

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(container.clientWidth, container.clientHeight);
container.appendChild(renderer.domElement);

const controls = new OrbitControls(camera, renderer.domElement);
const axesHelper = new THREE.AxesHelper(10);
scene.add(axesHelper);

const gridHelper = new THREE.GridHelper(20, 20);
scene.add(gridHelper);

const light = new THREE.AmbientLight(0xffffff, 1);
scene.add(light);

function animate() {
    requestAnimationFrame(animate);
    controls.update();
    renderer.render(scene, camera);
}
animate();

window.addEventListener('resize', () => {
    camera.aspect = container.clientWidth / container.clientHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(container.clientWidth, container.clientHeight);
});

const inputs = document.querySelectorAll('.vector-component');
inputs.forEach(input => {
    input.addEventListener('input', (event) => {
        const originalValue = event.target.value;
        let sanitizedValue = originalValue.replace(/[^-0-9.]/g, '').replace(/(?!^)-/g, '');
        const parts = sanitizedValue.split('.');
        if (parts.length > 2) {
            sanitizedValue = parts[0] + '.' + parts.slice(1).join('');
        }
        if (originalValue !== sanitizedValue) {
            event.target.value = sanitizedValue;
        }
    });
});

const calculateBtn = document.getElementById('calculateBtn');
const vectorArrows = {};

calculateBtn.addEventListener('click', () => {
    const vecA = new THREE.Vector3(
        parseFloat(document.getElementById('ax').value) || 0,
        parseFloat(document.getElementById('ay').value) || 0,
        parseFloat(document.getElementById('az').value) || 0
    );
    const vecB = new THREE.Vector3(
        parseFloat(document.getElementById('bx').value) || 0,
        parseFloat(document.getElementById('by').value) || 0,
        parseFloat(document.getElementById('bz').value) || 0
    );
    const vecC = new THREE.Vector3(
        parseFloat(document.getElementById('cx').value) || 0,
        parseFloat(document.getElementById('cy').value) || 0,
        parseFloat(document.getElementById('cz').value) || 0
    );

    const totalSum = vecA.clone().add(vecB).add(vecC);
    const dotAB = vecA.dot(vecB);
    const crossAB = new THREE.Vector3().crossVectors(vecA, vecB);
    const crossBC = new THREE.Vector3().crossVectors(vecB, vecC);
    const scalarTriple = vecA.dot(crossBC);
    const vectorTriple = new THREE.Vector3().crossVectors(vecA, crossBC);

    const formatVec = (v) => `(${v.x.toFixed(2)}, ${v.y.toFixed(2)}, ${v.z.toFixed(2)})`;
    
    document.getElementById('sumResult').textContent = formatVec(totalSum);
    document.getElementById('dotABResult').textContent = dotAB.toFixed(2);
    document.getElementById('crossABResult').textContent = formatVec(crossAB);
    document.getElementById('scalarTripleResult').textContent = scalarTriple.toFixed(2);
    document.getElementById('vectorTripleResult').textContent = formatVec(vectorTriple);

    const vectorsToDraw = [
        { id: 'A', vec: vecA, color: 0xff0000 },
        { id: 'B', vec: vecB, color: 0x0000ff },
        { id: 'C', vec: vecC, color: 0xffff00 },
        { id: 'Sum', vec: totalSum, color: 0x00ff00 },
        { id: 'CrossAB', vec: crossAB, color: 0x800080 },
        { id: 'VectorTriple', vec: vectorTriple, color: 0x00ffff }
    ];

    updateScene(vectorsToDraw);
});

function updateScene(vectorData) {
    const origin = new THREE.Vector3(0, 0, 0);

    vectorData.forEach(data => {
        const { id, vec, color } = data;
        const length = vec.length();
        const dir = length > 0.001 ? vec.clone().normalize() : new THREE.Vector3(1, 0, 0);

        if (vectorArrows[id]) {
            const arrow = vectorArrows[id];
            arrow.setDirection(dir);
            arrow.setLength(length, 0.5, 0.3);
            arrow.setColor(color);
        } else {
            const arrow = new THREE.ArrowHelper(dir, origin, length, color, 0.5, 0.3);
            vectorArrows[id] = arrow;
            scene.add(arrow);
        }
    });
}

calculateBtn.click();
