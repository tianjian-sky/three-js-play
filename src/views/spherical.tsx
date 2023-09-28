import { Vue, Prop, Component, Watch } from 'vue-property-decorator'
import { Scene, ArrowHelper, BufferGeometry, Spherical, Line, LineBasicMaterial, PerspectiveCamera, MeshBasicMaterial, MeshPhongMaterial, OrthographicCamera, TextureLoader, WebGLRenderer, AmbientLight, HemisphereLight, Vector3, Color, Matrix4, RawShaderMaterial, GLSL1, InstancedBufferGeometry } from '../../public/three/src/Three'
import styles from './Test.module.scss'
import { OrbitControls } from '../../public/three/examples/jsm/controls/OrbitControls.js'

@Component
export default class SphericalDemo extends Vue {
    @Prop({ default: 'three的球坐标系' }) readonly title!: string
    scene?: THREE.Scene
    camera?: THREE.Camera
    renderer?: THREE.WebGLRenderer
    ambientLight?: THREE.AmbientLight
    control?: OrbitControls
    camPos = {x: 20, y: 20, z: 20}
    params = {
        radius: 10,
        phi: 0,
        theta: 0
    }
    camParams = {l:-500, r: 500, t: 500, b: -500, n: 0, f: 2000}
    spherical = null
    lineObj = null

    initCanvas() {
        const el: HTMLDivElement = this.$refs['modelContainer'] as HTMLDivElement
        this.scene = new Scene()
        this.camera = new PerspectiveCamera( 75, el.clientWidth / el.clientHeight, 0.1, 1000 )
        this.renderer = new WebGLRenderer()
        const light = new AmbientLight(0x404040, 110); // soft white light
        const hemisphereLight = new HemisphereLight(0xffffbb, 0x080820, 110);
        this.scene.add(light)
        this.scene.add(hemisphereLight)
        const dpr = 3 // window.devicePixelRatio
        this.renderer.setPixelRatio(dpr)
        this.renderer.setSize(el.clientWidth, el.clientHeight)
        el.appendChild(this.renderer.domElement)

        const ratio = el.clientWidth / el.clientHeight
        this.camParams.t = 1000 / ratio / 2
        this.camParams.b = - this.camParams.t
        this.camera.position.set(this.camPos.x, this.camPos.y, this.camPos.z)
        this.camera.lookAt(new Vector3(0, 0, 0))
        this.scene.add(this.camera)

        this.control = new OrbitControls(this.camera, this.renderer.domElement)
        const axesHelper = new ArrowHelper()
        this.scene.add(axesHelper)
        const a1 = new ArrowHelper( new Vector3(1, 0, 0), new Vector3(), 10, 0xff0000 )
        const a2 = new ArrowHelper( new Vector3(0, 1, 0), new Vector3(), 10, 0x00ff00 )
        const a3 = new ArrowHelper( new Vector3(0, 0, 1), new Vector3(), 10, 0x0000ff )
        this.scene.add(a1, a2, a3)
        this.spherical = new Spherical(this.params.radius, this.params.phi, this.params.theta)
        const lineGeometry = new BufferGeometry()
        const material = new LineBasicMaterial({
            color: 0xffff00,
            linewidth: 1
        })
        lineGeometry.setFromPoints([
            new Vector3(0, 0, 0),
            new Vector3().setFromSpherical(this.spherical),
        ])
        this.lineObj = new Line(lineGeometry, material)
        this.scene.add(this.lineObj)
        const animate = () => {
            requestAnimationFrame(animate)
            this.spherical.set(this.params.radius, this.params.phi, this.params.theta)
            const lineGeometry = new BufferGeometry()
            lineGeometry.setFromPoints([
                new Vector3(0, 0, 0),
                new Vector3().setFromSpherical(this.spherical),
            ])
            this.lineObj.geometry = lineGeometry
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
                <p>球坐标参数 {this.params}
                    r:<input type="number" value={this.params.radius} onInput={v => this.params.radius = Number((v.target as HTMLInputElement).value)}></input><br/>
                    phi: <input type="number" value={this.params.phi} onInput={v => this.params.phi = Number((v.target as HTMLInputElement).value)}></input><br/>
                    theta: <input type="number" value={this.params.theta} onInput={v => this.params.theta = Number((v.target as HTMLInputElement).value)}></input><br/>
                </p>
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
