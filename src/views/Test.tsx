import { Vue, Prop, Component, Watch } from 'vue-property-decorator'
import {Scene, PerspectiveCamera, WebGLRenderer, BoxGeometry, MeshBasicMaterial, Mesh, AmbientLight} from 'three'
import styles from './Test.module.scss'
import { GLTF, GLTFLoader } from '../../public/three/examples/jsm/loaders/GLTFLoader.js'
import { OrbitControls } from '../../public/three/examples/jsm/controls/OrbitControls.js'

@Component
export default class TestComponent extends Vue {
    @Prop({ default: 'Hello World' }) readonly title!: string
    scene?: THREE.Scene
    camera?: THREE.Camera
    renderer?: THREE.Renderer
    ambientLight?: THREE.AmbientLight
    control?: OrbitControls

    

    initCanvas () {
        const el: HTMLDivElement = this.$refs['modelContainer'] as HTMLDivElement
        const scene = this.scene = new Scene()
        const camera = this.camera = new PerspectiveCamera( 75, el.clientWidth / el.clientHeight, 0.1, 1000 )
        const renderer = this.renderer = new WebGLRenderer()
        const control = this.control = new OrbitControls(camera, renderer.domElement)
        const light = new AmbientLight( 0x404040, 200); // soft white light
        scene.add(light)
        camera.position.set( - 1.8, 0.6, 1121)
        renderer.setSize( el.clientWidth, el.clientHeight )
        window.addEventListener('resize', () => {
            renderer.setSize( el.clientWidth, el.clientHeight )
        })
        el.appendChild( renderer.domElement )

        const geometry = new BoxGeometry()
        const material = new MeshBasicMaterial( { color: 0x00ff00 } )
        const cube = new Mesh( geometry, material )
        scene.add( cube )

        camera.position.z = 5

        control.addEventListener('start', (e) => {
            console.log('[Orbitcontrol]startEvent', e)
            const root = this.scene
            root?.traverse(obj => {
                if (obj.children.length) return
                const show = Math.random() > 0.5
                if (!show) {
                    obj.visible = false
                }
            })
        })

        control.addEventListener('end', (e) => {
            console.log('[Orbitcontrol]endEvent', e)
            const root = this.scene
            root?.traverse(obj => {
                const show = Math.random() > 0.5
                if (!obj.visible) {
                    obj.visible = true
                }
            })
        })

        const animate = function () {
            requestAnimationFrame( animate )
            cube.rotation.x += 0.01
            cube.rotation.y += 0.01
            renderer.render( scene, camera )
        }
        animate();
    }

    loadModel (url: string): Promise<any>  {
        const p = new Promise((resolve, reject) => {
            const loader: GLTFLoader = new GLTFLoader()
            loader.load(url, ( gltf: GLTF ) => {
                console.log('[gltf load] complete:', gltf)
                resolve(gltf)
            }, ( e ) => {
                console.log('[gltf load] progress:', e)
            }, ( e ) => {
                console.log('[gltf load] error:', e)
                reject(e)
            })
        })
        return p
    }

    addModelToScene (gltf: GLTF): void {
        const mesh = gltf.scene
        // mesh.rotation.x = (rotation && rotation.x) || 0
        // mesh.rotation.y = (rotation && rotation.y) || 0
        // mesh.rotation.z = (rotation && rotation.z) || 0
        // mesh.position.set(position.x, position.y, position.z)
        // scale && mesh.scale.set(scale, scale, scale)
        this.scene && this.scene.add(mesh)
    }

    mounted () {
        this.initCanvas()
        this.loadModel('/models/gltf/DamagedHelmet/glTF/DamagedHelmet.gltf').then(this.addModelToScene)
        this.loadModel('/models/gltf/pub/scene.gltf').then(this.addModelToScene)
    }
 
    render () {
        return (
            <div class={styles.wrap}>
                <p class={styles.title}>{this.title}</p>
                <div ref="modelContainer" class={styles.model}></div>
            </div>
        )
    }
}
