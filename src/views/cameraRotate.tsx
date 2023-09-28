import { Vue, Prop, Component } from 'vue-property-decorator'
import { Scene, MeshBasicMaterial, OrthographicCamera, TextureLoader, WebGLRenderer, BoxGeometry, Mesh, AmbientLight, HemisphereLight, Vector3 } from 'three'
import styles from './Test.module.scss'
import { OrbitControls } from '../../public/three/examples/jsm/controls/OrbitControls.js'

@Component
export default class TestComponent extends Vue {
    @Prop({ default: 'Hello World' }) readonly title!: string
    scene?: THREE.Scene
    camera?: THREE.Camera
    renderer?: THREE.WebGLRenderer
    ambientLight?: THREE.AmbientLight
    control?: OrbitControls



    initCanvas() {
        const el: HTMLDivElement = this.$refs['modelContainer'] as HTMLDivElement
        this.scene = new Scene()
        this.camera = new OrthographicCamera(-500, 500, 500, -500, 1, 1000)
        this.camera.position.set(0, 0, 1)
        this.camera.lookAt(new Vector3(0, 0, 0))
        // this.camera = new PerspectiveCamera( 75, el.clientWidth / el.clientHeight, 0.1, 1000 )
        this.scene.add(this.camera)
        this.renderer = new WebGLRenderer()
        this.control = new OrbitControls(this.camera, this.renderer.domElement)
        const light = new AmbientLight(0x404040, 110); // soft white light
        const hemisphereLight = new HemisphereLight(0xffffbb, 0x080820, 110);
        this.scene.add(light)
        this.scene.add(hemisphereLight)
        this.renderer.setPixelRatio(window.devicePixelRatio)
        this.renderer.setSize(el.clientWidth, el.clientHeight)
        el.appendChild(this.renderer.domElement)
        // this.camera.position.z = 100
        // this.scene.add(haert)

        const loader = new TextureLoader()
        loader.load('https://gimg2.baidu.com/image_search/src=http%3A%2F%2Fimg.lanrentuku.com%2Fimg%2Fallimg%2F1502%2F46-1502121526450-L.jpg&refer=http%3A%2F%2Fimg.lanrentuku.com&app=2002&size=f9999,10000&q=a80&n=0&g=0n&fmt=jpeg?sec=1629547043&t=026796058c3867bf972e7dae9212c621', (texture) => {
            const material = new MeshBasicMaterial({
                map: texture,
                color: '#ccc'
            })
            const geometry = new BoxGeometry(500, 100, -0.1)
            const cube = new Mesh(geometry, material)
            cube.rotateX(Math.PI / 2)
            cube.name = 'image'
            this?.scene?.add(cube)
        })

        const animate = () => {
            requestAnimationFrame(animate)
            if (this.renderer && this.scene && this.camera) {
                this.renderer.render(this.scene, this.camera)
            }
        }
        animate();
    }

    mounted() {
        this.initCanvas()
    }

    render() {
        return (
            <div class={styles.wrap}>
                <p class={styles.title}>{this.title}</p>
                <div ref="modelContainer" class={styles.model}></div>
            </div>
        )
    }

    beforeDestroy() {
        this.renderer && this.renderer.dispose()
        this.control && this.control.dispose()
        this.scene = undefined
        this.camera = undefined
        this.renderer = undefined
        this.ambientLight = undefined
        this.control = undefined
    }
}
