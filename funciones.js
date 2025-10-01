import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import * as d3 from 'd3';

// =======================================================
// 1. LÓGICA DE CÁLCULO DE VECTORES
// =======================================================
const vectorMath = {
    add: (v1, v2) => ({ x: v1.x + v2.x, y: v1.y + v2.y, z: v1.z + v2.z }),
    subtract: (v1, v2) => ({ x: v1.x - v2.x, y: v1.y - v2.y, z: v1.z - v2.z }),
    dot: (v1, v2) => v1.x * v2.x + v1.y * v2.y + v1.z * v2.z,
    cross: (v1, v2) => ({
        x: v1.y * v2.z - v1.z * v2.y,
        y: v1.z * v2.x - v1.x * v2.z,
        z: v1.x * v2.y - v1.y * v2.x
    })
};

// =======================================================
// 2. CONFIGURACIÓN DE LA ESCENA 3D
// =======================================================
const container = document.getElementById('canvas-container');
const scene = new THREE.Scene();
scene.background = new THREE.Color(0xf0f2f5);
const camera = new THREE.PerspectiveCamera(75, container.clientWidth / container.clientHeight, 0.1, 1000);
camera.position.set(5, 5, 5);

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


// =======================================================
// 3. SECCIÓN DE VALIDACIÓN DE ENTRADAS
// =======================================================
const inputs = document.querySelectorAll('.vector-component');

inputs.forEach(input => {
    input.addEventListener('input', (event) => {
        const originalValue = event.target.value;
        let sanitizedValue = originalValue;

        // 1. Quitar todos los caracteres que no sean un dígito, un punto o un guión
        sanitizedValue = sanitizedValue.replace(/[^-0-9.]/g, '');

        // 2. Asegurarse de que el guión (-) solo esté al principio
        sanitizedValue = sanitizedValue.replace(/(?!^)-/g, '');

        // 3. Asegurarse de que solo haya un punto decimal
        const parts = sanitizedValue.split('.');
        if (parts.length > 2) {
            sanitizedValue = parts[0] + '.' + parts.slice(1).join('');
        }
        
        // Si el valor fue modificado, se actualiza el campo
        if (originalValue !== sanitizedValue) {
            event.target.value = sanitizedValue;
        }
    });
});


// =======================================================
// 4. LÓGICA DE LA APLICACIÓN (UI + CÁLCULOS + GRÁFICAS)
// =======================================================
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

    const sum = vectorMath.add(vecA, vecB);
    const sub = vectorMath.subtract(vecA, vecB);
    const dot = vectorMath.dot(vecA, vecB);
    const cross = vectorMath.cross(vecA, vecB);

    document.getElementById('sumResult').textContent = `(${sum.x.toFixed(2)}, ${sum.y.toFixed(2)}, ${sum.z.toFixed(2)})`;
    document.getElementById('subResult').textContent = `(${sub.x.toFixed(2)}, ${sub.y.toFixed(2)}, ${sub.z.toFixed(2)})`;
    document.getElementById('dotResult').textContent = dot.toFixed(2);
    document.getElementById('crossResult').textContent = `(${cross.x.toFixed(2)}, ${cross.y.toFixed(2)}, ${cross.z.toFixed(2)})`;

    const vectorsToDraw = [
        { id: 'A', vec: vecA, color: 0xff0000 },
        { id: 'B', vec: vecB, color: 0x0000ff },
        { id: 'Sum', vec: sum, color: 0x00ff00 },
        { id: 'Sub', vec: sub, color: 0xffa500 },
        { id: 'Cross', vec: cross, color: 0x800080 }
    ];

    updateScene(vectorsToDraw);
});

function updateScene(vectorData) {
    const origin = new THREE.Vector3(0, 0, 0);

    const selection = d3.select(scene)
        .selectAll('.ArrowHelper') // Usamos una clase para la selección
        .data(vectorData, d => d.id);

    selection.join(
        enter => {
            const dir = new THREE.Vector3(enter.datum().vec.x, enter.datum().vec.y, enter.datum().vec.z);
            const length = dir.length() || 0.001; // Evitar longitud cero
            dir.normalize();

            const arrow = new THREE.ArrowHelper(dir, origin, length, enter.datum().color, 0.5, 0.3);
            arrow.userData.class = 'ArrowHelper'; // Asignamos una "clase"
            return arrow;
        },
        update => {
            const dir = new THREE.Vector3(update.datum().vec.x, update.datum().vec.y, update.datum().vec.z);
            const length = dir.length() || 0.001;
            dir.normalize();

            update.call(arrow => {
                arrow.setDirection(dir);
                arrow.setLength(length);
                arrow.setColor(update.datum().color);
            });
            return update;
        },
        exit => exit.remove()
    );
}

// Ejecutar una vez al cargar para mostrar los valores iniciales
calculateBtn.click();