import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { FBXLoader } from 'three/addons/loaders/FBXLoader.js';
import { OBJLoader } from 'three/addons/loaders/OBJLoader.js';
import { STLLoader } from 'three/addons/loaders/STLLoader.js';
import { PLYLoader } from 'three/addons/loaders/PLYLoader.js';
import { ColladaLoader } from 'three/addons/loaders/ColladaLoader.js';
import { TDSLoader } from 'three/addons/loaders/TDSLoader.js';

export class MeshLoader {
    constructor(scene) {
        this.scene = scene;
        this.currentModel = null;
        this.mixer = null;
        this.trackActions = [];
        this.skeletonHelper = null;
        this.modelData = {
            filename: '',
            topObjects: []
        };
        
        this.SUPPORTED_EXTS = ['.fbx', '.glb', '.gltf', '.obj', '.stl', '.ply', '.dae', '.3ds'];
    }

    async loadFromURL(rawUrl) {
        let url = rawUrl.trim();
        if (!url) return;

        url = url.replace('https://github.com/', 'https://raw.githubusercontent.com/').replace('/blob/', '/');
        
        const ext = this._getExt(url);
        const filename = url.split('/').pop().split('?')[0];

        if (!this.SUPPORTED_EXTS.includes('.' + ext)) {
            alert(`Format .${ext} nije podržan.`);
            return;
        }

        this._setLoadProgress(5, filename);
        this._dispatchLoad(ext, url, filename);
    }

    _dispatchLoad(ext, url, filename) {
        const onProgress = xhr => {
            if (xhr.lengthComputable) {
                this._setLoadProgress(Math.round(xhr.loaded / xhr.total * 100), filename);
            }
        };

        const onError = err => {
            console.error('Greška pri učitavanju:', err);
            this._setLoadProgress(0, filename);
        };

        let loader;
        switch (ext) {
            case 'glb':
            case 'gltf': loader = new GLTFLoader(); break;
            case 'fbx': loader = new FBXLoader(); break;
            case 'obj': loader = new OBJLoader(); break;
            case 'stl': loader = new STLLoader(); break;
            case 'ply': loader = new PLYLoader(); break;
            case 'dae': loader = new ColladaLoader(); break;
            case '3ds': loader = new TDSLoader(); break;
        }

        loader.load(url, (result) => {
            const obj = result.scene || result;
            obj.animations = result.animations || [];
            this.onModelLoaded(obj, filename);
        }, onProgress, onError);
    }

    onModelLoaded(obj, filename) {
        if (this.currentModel) this.scene.remove(this.currentModel);
        if (this.mixer) { this.mixer.stopAllAction(); this.mixer = null; }

        this._normalizeObject(obj);

        obj.traverse(child => {
            if (child.isMesh) {
                child.castShadow = true;
                child.receiveShadow = true;
                
                if (child.material) {
                    const mats = Array.isArray(child.material) ? child.material : [child.material];
                    mats.forEach(m => { 
                        if (m.map) m.map.colorSpace = THREE.SRGBColorSpace; 
                    });
                }

                if (window.isPhysicsMesh && window.isPhysicsMesh(child.name)) {
                    this._applyPhysics(child);
                }
            }
        });

        if (obj.animations && obj.animations.length > 0) {
            this.mixer = new THREE.AnimationMixer(obj);
            obj.animations.forEach(clip => {
                const action = this.mixer.clipAction(clip);
                action.setLoop(THREE.LoopRepeat);
                action.play();
                this.trackActions.push(action);
            });
        }

        this.scene.add(obj);
        this.currentModel = obj;

        this._buildTopObjects(obj, filename);
        
        this._setLoadProgress(100, filename);
    }

    _normalizeObject(obj) {
        const box = new THREE.Box3().setFromObject(obj);
        const size = new THREE.Vector3();
        box.getSize(size);
        const maxDim = Math.max(size.x, size.y, size.z);
        if (maxDim > 0) obj.scale.setScalar(4 / maxDim);

        const box2 = new THREE.Box3().setFromObject(obj);
        const center = new THREE.Vector3();
        box2.getCenter(center);
        obj.position.set(-center.x, -box2.min.y, -center.z);
    }

    _applyPhysics(child) {
        child.userData.isPhysics = true;
        child.userData.originalMaterial = child.material;
        const invisMat = new THREE.MeshBasicMaterial({ 
            transparent: true, opacity: 0, depthWrite: false, colorWrite: false 
        });
        child.material = Array.isArray(child.material) ? child.material.map(() => invisMat) : invisMat;
    }

    _buildTopObjects(obj, filename) {
        const topObjects = [];
        obj.children.forEach(child => {
            let childTris = 0;
            child.traverse(c => {
                if (c.isMesh && c.geometry && !c.userData.isPhysics) {
                    childTris += c.geometry.index ? c.geometry.index.count / 3 : (c.geometry.attributes.position?.count || 0) / 3;
                }
            });
            
            topObjects.push({
                name: child.name || `Object_${topObjects.length + 1}`,
                tris: Math.round(childTris),
                obj: child
            });
        });

        this.TopObjects = topObjects;

        console.log(this.TopObjects)

        this.modelData = { filename, topObjects };
        window[filename] = this.modelData; 
    }

    _getExt(url) {
        return url.split('?')[0].split('.').pop().toLowerCase();
    }

    _setLoadProgress(percent, filename) {
        if (!window.globalProgress) window.globalProgress = {};
        window.globalProgress[filename] = percent;
        if (window.setLoadProgress) window.setLoadProgress(percent, filename);
    }

    update(delta) {
        if (this.mixer) this.mixer.update(delta);
    }

    findDescendant(name) {
        // Provera da li je model uopšte učitan
        if (!this.currentModel) {
            console.warn("Model još uvek nije učitan. findDescendant ne može da pretražuje.");
            return null;
        }

        let foundObject = null;

        // Traverse prolazi kroz celu hijerarhiju (recursive search)
        this.currentModel.traverse((child) => {
            if (child.name === name) {
                foundObject = child;
            }
        });

        if (!foundObject) {
            console.warn(`Objekat sa imenom "${name}" nije pronađen u hijerarhiji modela.`);
        }

        return foundObject;
    }
}