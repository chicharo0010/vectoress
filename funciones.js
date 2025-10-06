import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

document.addEventListener('DOMContentLoaded', () => {
    const calculateBtn = document.getElementById('calculateBtn');
    const useVectorC = document.getElementById('useVectorC');
    const vectorCFieldset = document.getElementById('vectorC-fieldset');
    const operationSelect = document.getElementById('operationSelect');
    const opNameSpan = document.getElementById('operationName');
    const opResultSpan = document.getElementById('operationResult');

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
    
    const vectorArrows = {};

    function animate() {
        requestAnimationFrame(animate);
        controls.update();
        renderer.render(scene, camera);
    }
    animate();
    
    function clearScene() {
        for (const id in vectorArrows) {
            scene.remove(vectorArrows[id]);
            delete vectorArrows[id];
        }
    }
    
    function drawScene(vectorData) {
        clearScene();
        const origin = new THREE.Vector3(0, 0, 0);
        vectorData.forEach(data => {
            const { id, vec, color } = data;
            const length = vec.length();
            const dir = length > 0.001 ? vec.clone().normalize() : new THREE.Vector3(1, 0, 0);
            const arrow = new THREE.ArrowHelper(dir, origin, length, color, 0.5, 0.3);
            vectorArrows[id] = arrow;
            scene.add(arrow);
        });
    }

    useVectorC.addEventListener('change', () => {
        vectorCFieldset.disabled = !useVectorC.checked;
    });
    
    const formatVec = v => `(${v.x.toFixed(2)}, ${v.y.toFixed(2)}, ${v.z.toFixed(2)})`;

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
        
        let vectorsToDraw = [];
        const operation = operationSelect.value;
        
        switch (operation) {
            case 'sum': {
                const isCActive = useVectorC.checked;
                const result = vecA.clone().add(vecB);
                opNameSpan.textContent = isCActive ? 'A + B + C = ' : 'A + B = ';
                vectorsToDraw.push({ id: 'A', vec: vecA, color: 0xff0000 });
                vectorsToDraw.push({ id: 'B', vec: vecB, color: 0x0000ff });
                
                if (isCActive) {
                    const vecC = new THREE.Vector3(parseFloat(document.getElementById('cx').value) || 0, parseFloat(document.getElementById('cy').value) || 0, parseFloat(document.getElementById('cz').value) || 0);
                    result.add(vecC);
                    vectorsToDraw.push({ id: 'C', vec: vecC, color: 0xffff00 });
                }
                
                vectorsToDraw.push({ id: 'Resultado', vec: result, color: 0x00ff00 });
                opResultSpan.textContent = formatVec(result);
                drawScene(vectorsToDraw);
                break;
            }
            case 'sub': {
                const result = vecA.clone().sub(vecB);
                opNameSpan.textContent = 'A - B = ';
                opResultSpan.textContent = formatVec(result);
                vectorsToDraw = [
                    { id: 'A', vec: vecA, color: 0xff0000 },
                    { id: 'B', vec: vecB, color: 0x0000ff },
                    { id: 'Resultado', vec: result, color: 0x00ff00 }
                ];
                drawScene(vectorsToDraw);
                break;
            }
            case 'dot': {
                const result = vecA.dot(vecB);
                opNameSpan.textContent = 'A • B = ';
                opResultSpan.textContent = result.toFixed(4);
                clearScene();
                break;
            }
            case 'cross': {
                const result = new THREE.Vector3().crossVectors(vecA, vecB);
                opNameSpan.textContent = 'A x B = ';
                opResultSpan.textContent = formatVec(result);
                vectorsToDraw = [
                    { id: 'A', vec: vecA, color: 0xff0000 },
                    { id: 'B', vec: vecB, color: 0x0000ff },
                    { id: 'Resultado', vec: result, color: 0x800080 }
                ];
                drawScene(vectorsToDraw);
                break;
            }
            case 'scalarTriple':
            case 'vectorTriple': {
                if (!useVectorC.checked) {
                    opNameSpan.textContent = 'Error: ';
                    opResultSpan.textContent = 'Esta operación requiere el Vector C.';
                    clearScene();
                    return;
                }
                 const vecC = new THREE.Vector3(parseFloat(document.getElementById('cx').value) || 0, parseFloat(document.getElementById('cy').value) || 0, parseFloat(document.getElementById('cz').value) || 0);
                const crossBC = new THREE.Vector3().crossVectors(vecB, vecC);

                if (operation === 'scalarTriple') {
                    const result = vecA.dot(crossBC);
                    opNameSpan.textContent = 'A • (B x C) = ';
                    opResultSpan.textContent = result.toFixed(4);
                    clearScene();
                } else {
                    const result = new THREE.Vector3().crossVectors(vecA, crossBC);
                    opNameSpan.textContent = 'A x (B x C) = ';
                    opResultSpan.textContent = formatVec(result);
                    vectorsToDraw = [
                       { id: 'A', vec: vecA, color: 0xff0000 },
                       { id: 'B', vec: vecB, color: 0x0000ff },
                       { id: 'C', vec: vecC, color: 0xffff00 },
                       { id: 'Resultado', vec: result, color: 0x00ffff }
                    ];
                    drawScene(vectorsToDraw);
                }
                break;
            }
        }
    });

    useVectorC.dispatchEvent(new Event('change'));
});
