import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import * as d3 from 'd3';

const vectorMath = {
    add: (v1, v2) => ({ x: v1.x + v2.x, y: v1.y + v2.y, z: v1.z + v2.z }),
    dot: (v1, v2) => v1.x * v2.x + v1.y * v2.y + v1.z * v2.z,
    cross: (v1, v2) => ({
        x: v1.y * v2.z - v1.z * v2.y,
        y: v1.z * v2.x - v1.x * v2.z,
        z: v1.x * v2.y - v1.y * v2.x
    }),
    scalarTripleProduct: (v1, v2, v3) => {
        const crossResult = vectorMath.cross(v2, v3);
        return vectorMath.dot(v1, crossResult);
    },
    vectorTripleProduct: (v1, v2, v3) => {
        const crossResult = vectorMath.cross(v2, v3);
        return vectorMath.cross(v1, crossResult);
    }
};

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
        let sanitizedValue = originalValue;
        sanitizedValue = sanitizedValue.replace(/[^-0-9.]/g, '');
        sanitizedValue = sanitizedValue.replace(/(?!^)-/g, '');
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

calculateBtn.addEventListener('click', () => {
    const vecA = {
        x: parseFloat(document.getElementById('ax').value) || 0,
        y: parseFloat(document.getElementById('ay').value) || 0,
        z: parseFloat(document.getElementById('az').value) || 0
    };
    const vecB = {
        x: parseFloat(document.getElementById('bx').value) || 0,
        y: parseFloat(document.getElementById('by').value) || 0,
        z: parseFloat(document.getElementById('bz').value) || 0
    };
    const vecC = {
        x: parseFloat(document.getElementById('cx').value) || 0,
        y: parseFloat(document.getElementById('cy').value) || 0,
        z: parseFloat(document.getElementById('cz').value) || 0
    };

    const sumAB = vectorMath.add(vecA, vecB);
    const totalSum = vectorMath.add(sumAB, vecC);
    const dotAB = vectorMath.dot(vecA, vecB);
    const crossAB = vectorMath.cross(vecA, vecB);
    const scalarTriple = vectorMath.scalarTripleProduct(vecA, vecB, vecC);
    const vectorTriple = vectorMath.vectorTripleProduct(vecA, vecB, vecC);

    document.getElementById('sumResult').textContent = `(${totalSum.x.toFixed(2)}, ${totalSum.y.toFixed(2)}, ${totalSum.z.toFixed(2)})`;
    document.getElementById('dotABResult').textContent = dotAB.toFixed(2);
    document.getElementById('crossABResult').textContent = `(${crossAB.x.toFixed(2)}, ${crossAB.y.toFixed(2)}, ${crossAB.z.toFixed(2)})`;
    document.getElementById('scalarTripleResult').textContent = scalarTriple.toFixed(2);
    document.getElementById('vectorTripleResult').textContent = `(${vectorTriple.x.toFixed(2)}, ${vectorTriple.y.toFixed(2)}, ${vectorTriple.z.toFixed(2)})`;

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

    const selection = d3.selectAll(scene.children.filter(obj => obj.userData.isVectorArrow))
      .data(vectorData, function(d) { return d ? d.id : this.userData.id; });

    selection.join(
        enterSelection => enterSelection.each(function(d) {
            const dir = new THREE.Vector3(d.vec.x, d.vec.y, d.vec.z);
            const length = dir.length() || 0.001;
            dir.normalize();
            
            const arrow = new THREE.ArrowHelper(dir, origin, length, d.color, 0.5, 0.3);
            arrow.userData = { isVectorArrow: true, id: d.id }; 
            scene.add(arrow);
        }),
        updateSelection => updateSelection.each(function(d) {
            const dir = new THREE.Vector3(d.vec.x, d.vec.y, d.vec.z);
            const length = dir.length() || 0.001;
            dir.normalize();
            this.setDirection(dir);
            this.setLength(length, 0.5, 0.3);
            this.setColor(d.color);
        }),
        exitSelection => exitSelection.each(function() {
            scene.remove(this);
        })
    );
}

calculateBtn.click();
