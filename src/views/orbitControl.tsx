import { Vue, Prop, Component, Watch } from 'vue-property-decorator'
import { Scene, ArrowHelper, BufferGeometry, Spherical, Line, BoxGeometry, Mesh, MeshBasicMaterial, LineBasicMaterial, PerspectiveCamera, Box3, WebGLRenderer, AmbientLight, HemisphereLight, Vector3, Color, Matrix4, RawShaderMaterial, GLSL1, InstancedBufferGeometry } from '../../public/three/src/Three'
import { lerpVectors } from '../utils/math'
import styles from './Test.module.scss'
import { OrbitControls } from '../../public/three/examples/jsm/controls/OrbitControls.js'

@Component
export default class OrbitControl extends Vue {
    @Prop({ default: 'orbitControl死锁问题' }) readonly title!: string
    scene?: THREE.Scene
    camera?: THREE.Camera
    renderer?: THREE.WebGLRenderer
    ambientLight?: THREE.AmbientLight
    control?: OrbitControls
    camPos = {x: 20, y: 20, z: 20}
    lookAt = {x: 0, y: 0, z: 0}
    cameraRotate = {x: 0, y: 0, z: 0}
    up = {x: 0, y: 1, z: 0}
    params = {
        radius: 10,
        phi: 45,
        theta: 45
    }
    camParams = {l:-500, r: 500, t: 500, b: -500, n: 0, f: 2000}
    spherical = null
    lineObj = null

    initCanvas() {
        const el: HTMLDivElement = this.$refs['modelContainer'] as HTMLDivElement
        this.scene = new Scene()
        this.camera = new PerspectiveCamera( 75, el.clientWidth / el.clientHeight, 0.1, 1000 )
        this.scene.add(this.camera)
        console.error('init camera', this.camera.uuid)
        this.initCamera()
        this.renderer = new WebGLRenderer()
        const light = new AmbientLight(0x404040, 110); // soft white light
        const hemisphereLight = new HemisphereLight(0xffffbb, 0x080820, 110);
        this.scene.add(light)
        this.scene.add(hemisphereLight)
        const dpr = 3 // window.devicePixelRatio
        this.renderer.setPixelRatio(dpr)
        this.renderer.setSize(el.clientWidth, el.clientHeight)
        el.appendChild(this.renderer.domElement)
        
        this.control = new OrbitControls(this.camera, this.renderer.domElement)
        const axesHelper = new ArrowHelper()
        this.scene.add(axesHelper)
        const a1 = new ArrowHelper( new Vector3(1, 0, 0), new Vector3(), 10, 0xff0000 )
        const a2 = new ArrowHelper( new Vector3(0, 1, 0), new Vector3(), 10, 0x00ff00 )
        const a3 = new ArrowHelper( new Vector3(0, 0, 1), new Vector3(), 10, 0x0000ff )
        this.scene.add(a1, a2, a3)
        this.spherical = new Spherical(this.params.radius, this.params.phi * Math.PI / 180, this.params.theta * Math.PI / 180)
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

        const cubeg = new BoxGeometry( 5, 5, 5 ) 
        const cubem = new MeshBasicMaterial( {color: 0x00ff00} )
        const cube = new Mesh( cubeg, cubem )
        this.scene.add( cube )
        const animate = () => {
            // this.initCamera()
            this.spherical.set(this.params.radius, this.params.phi * Math.PI / 180, this.params.theta * Math.PI / 180)
            this.camera.rotateX(this.cameraRotate.x * Math.PI / 180)
            this.camera.rotateY(this.cameraRotate.y * Math.PI / 180)
            this.camera.rotateZ(this.cameraRotate.z * Math.PI / 180)
            this.camera.updateMatrixWorld()
            const lineGeometry = new BufferGeometry()
            lineGeometry.setFromPoints([
                new Vector3(0, 0, 0),
                new Vector3().setFromSpherical(this.spherical),
            ])
            this.lineObj.geometry = lineGeometry
            if (this.renderer && this.scene && this.camera) {
                this.renderer.render(this.scene, this.camera)
            }
            requestAnimationFrame(animate)
        }
        animate();
    }
    initCamera() {
        const el: HTMLDivElement = this.$refs['modelContainer'] as HTMLDivElement
        const ratio = el.clientWidth / el.clientHeight
        this.camParams.t = 1000 / ratio / 2
        this.camParams.b = - this.camParams.t
        this.camera.position.set(this.camPos.x, this.camPos.y, this.camPos.z)
        this.camera.up = new Vector3(this.up.x, this.up.y, this.up.z)
        this.camera.lookAt(new Vector3(this.lookAt.x, this.lookAt.y, this.lookAt.z))
        this.camera.updateMatrixWorld()
    }
    changeView (viewName) {
        const box = new Box3().setFromObject(this.scene)
        const center = box.getCenter(new Vector3())
        const fov = 75 * (Math.PI / 180)
        const position = new Vector3()
        const lookAt = new Vector3()
        let up = new Vector3(0, 1, 0)
        if (viewName.match(/左|left/)) {
            position.x = -2 * (box.max.x - box.min.x) / 2 / Math.tan(fov / 2)
        } else if (viewName.match(/右|right/)) {
            position.x = 2 * (box.max.x - box.min.x) / 2 / Math.tan(fov / 2)
        } else if (viewName.match(/前|front/)) {
            position.z = 2 * (box.max.z - box.min.z) / 2 / Math.tan(fov / 2)
        } else if (viewName.match(/后|rear/)) {
            position.z = -2 * (box.max.z - box.min.z) / 2 / Math.tan(fov / 2)
        } else if (viewName.match(/顶|top/)) {
            position.y = 2 * (box.max.y - box.min.y) / 2 / Math.tan(fov / 2)
            up = new Vector3(0, 0, 1)
        } else if (viewName.match(/底|bottom/)) {
            position.y = -2 * (box.max.y - box.min.y) / 2 / Math.tan(fov / 2)
            up = new Vector3(0, 0, -1)
        }
        const currentPosition = this.camera.position.clone()
        lerpVectors(currentPosition, position, 1000, 100, (vector) => {
            this.setCameraPosition(vector, lookAt, up)
        }, null)
    }
    setCameraPosition(position, lookAt, up) {
        this.camPos.x = position.x
        this.camPos.y = position.y
        this.camPos.z = position.z
        if (up) {
            this.up.x = up.x
            this.up.y = up.y
            this.up.z = up.z
        }
        if (lookAt) {
            this.lookAt.x = lookAt.x
            this.lookAt.y = lookAt.y
            this.lookAt.z = lookAt.z
            this.updateControls({
                target: lookAt
            })
        }
        this.initCamera()
    }
    updateControls (params) {
        if (this.control instanceof OrbitControls) {
            this.control.target = params.target
        }
    }
    mounted() {
        this.initCanvas()
    }

    render() {
        return (
            <div class={styles.wrap}>
                <p>相机参数: 
                    <br/>
                    lookAt: {JSON.stringify(this.lookAt)}<br/>
                    up: {JSON.stringify(this.up)}<br/>
                    looAt.x:<input type="number" value={this.lookAt.x} onInput={v => this.lookAt.x = Number((v.target as HTMLInputElement).value)}></input>
                    looAt.y: <input type="number" value={this.lookAt.y} onInput={v => this.lookAt.y = Number((v.target as HTMLInputElement).value)}></input>
                    looAt.z: <input type="number" value={this.lookAt.z} onInput={v => this.lookAt.z = Number((v.target as HTMLInputElement).value)}></input><br/>
                    up.x:<input type="number" value={this.up.x} onInput={v => this.up.x = Number((v.target as HTMLInputElement).value)}></input>
                    up.y: <input type="number" value={this.up.y} onInput={v => this.up.y = Number((v.target as HTMLInputElement).value)}></input>
                    up.z: <input type="number" value={this.up.z} onInput={v => this.up.z = Number((v.target as HTMLInputElement).value)}></input><br/>
                    {/* camera.rotate.x:<input type="number" value={this.cameraRotate.x} onInput={v => this.cameraRotate.x = Number((v.target as HTMLInputElement).value)}></input>
                    camera.rotate.y: <input type="number" value={this.cameraRotate.y} onInput={v => this.cameraRotate.y = Number((v.target as HTMLInputElement).value)}></input>
                    camera.rotate.z: <input type="number" value={this.cameraRotate.z} onInput={v => this.cameraRotate.z = Number((v.target as HTMLInputElement).value)}></input><br/> */}
                    <button onClick={() => {
                        this.lookAt.x = 0
                        this.lookAt.y = 0
                        this.lookAt.z = 0
                        this.up.x = 0
                        this.up.y = 0
                        this.up.z = 0
                        this.cameraRotate.x = 0
                        this.cameraRotate.y = 0
                        this.cameraRotate.z = 0
                    }}>reset</button>
                    <button onClick={() => { this.camera.rotateX(10 * Math.PI / 180) }}>camera rotate X 10 deg</button>
                    <button onClick={() => { this.camera.rotateY(10 * Math.PI / 180) }}>camera rotate Y 10 deg</button>
                    <button onClick={() => { this.camera.rotateZ(10 * Math.PI / 180) }}>camera rotate z 10 deg</button>
                    <button onClick={() => { this.changeView('前') }}>前视图</button>
                    <button onClick={() => { this.changeView('顶') }}>顶视图</button><br/>
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
