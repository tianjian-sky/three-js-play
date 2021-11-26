import { Vue, Prop, Component, Watch } from 'vue-property-decorator'
import { Scene, ArrowHelper, BufferGeometry, BufferAttribute, Line, LineBasicMaterial, PerspectiveCamera, MeshBasicMaterial, MeshPhongMaterial, OrthographicCamera, TextureLoader, WebGLRenderer, BoxGeometry, ShapeGeometry, TextGeometry, FontLoader, SphereGeometry, MeshStandardMaterial, Mesh, Group, AmbientLight, HemisphereLight, Vector3, Color, Matrix4, RawShaderMaterial, GLSL1, InstancedBufferGeometry } from '../../public/three/src/Three'
import styles from './Test.module.scss'
import { OrbitControls } from '../../public/three/examples/jsm/controls/OrbitControls.js'
import { Heart } from './coms/heart'

@Component
export default class OrthCamera extends Vue {
    @Prop({ default: 'Hello World' }) readonly title!: string
    scene?: THREE.Scene
    camera?: THREE.Camera
    renderer?: THREE.WebGLRenderer
    ambientLight?: THREE.AmbientLight
    control?: OrbitControls
    camPos = {x: 0, y: 0, z: 1}
    camParams = {l:-500, r: 500, t: 500, b: -500, n: 0, f: 2000}


    initCanvas() {
        const el: HTMLDivElement = this.$refs['modelContainer'] as HTMLDivElement
        this.scene = new Scene()
        // this.camera = new PerspectiveCamera( 75, el.clientWidth / el.clientHeight, 0.1, 1000 )
        this.renderer = new WebGLRenderer()
        const light = new AmbientLight(0x404040, 110); // soft white light
        const hemisphereLight = new HemisphereLight(0xffffbb, 0x080820, 110);
        this.scene.add(light)
        this.scene.add(hemisphereLight)
        const dpr = 3 // window.devicePixelRatio
        alert(`${el.clientWidth}, ${el.clientHeight}, ${el.clientWidth * dpr}, ${el.clientHeight * dpr}, 2340, ${360 * el.clientHeight * 6.5 / el.clientWidth}`)
        this.renderer.setPixelRatio(dpr)
        this.renderer.setSize(el.clientWidth, el.clientHeight)
        alert(el.clientWidth)
        el.appendChild(this.renderer.domElement)

        const ratio = el.clientWidth / el.clientHeight
        this.camParams.t = 1000 / ratio / 2
        this.camParams.b = - this.camParams.t
        this.camera = new OrthographicCamera(this.camParams.l, this.camParams.r, this.camParams.t, this.camParams.b, this.camParams.n, this.camParams.f)
        this.camera.position.set(this.camPos.x, this.camPos.y, this.camPos.z)
        this.camera.lookAt(new Vector3(this.camPos.x, this.camPos.y, 0))
        this.camera.position.z = 100
        this.scene.add(this.camera)

        this.control = new OrbitControls(this.camera, this.renderer.domElement)
        const axesHelper = new ArrowHelper()
        this.scene.add(axesHelper)

        const geometry = new SphereGeometry(5, 32, 16)
        const material = new MeshBasicMaterial({color: 0xff0000})
        const circle1 = new Mesh(geometry, material)
        this.scene.add(circle1)

        const loader = new TextureLoader()
        loader.load('https://gimg2.baidu.com/image_search/src=http%3A%2F%2Fimg.lanrentuku.com%2Fimg%2Fallimg%2F1502%2F46-1502121526450-L.jpg&refer=http%3A%2F%2Fimg.lanrentuku.com&app=2002&size=f9999,10000&q=a80&n=0&g=0n&fmt=jpeg?sec=1629547043&t=026796058c3867bf972e7dae9212c621', (texture) => {
            const material = new MeshBasicMaterial({
                map: texture,
                color: '#ccc'
            })
            const geometry = new BoxGeometry(240, 160, 240)
            const cube = new Mesh(geometry, material)
            cube.translateZ(-120)
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


    changeCamParam (type: string, e: InputEvent) {
        this.camParams[type] = e.target.value
        this.updateCam()
    }
    moveFruscrum (type: string) {
        if (type == 'up' || type == 'down') {
            this.camParams.t += 10 * (type == 'up' ? 1 : -1)
            this.camParams.b += 10 * (type == 'up' ? 1 : -1)
        } else {
            this.camParams.l += 10 * (type == 'left' ? -1 : 1)
            this.camParams.r += 10 * (type == 'left' ? -1 : 1)
        }
        this.updateCam()
    }

    changeCamPos (dx: number, dy: number) {
        this.camPos.x += dx
        this.camPos.y += dy
        this.updateCam()
    }

    updateCam () {
        this.camera.left = this.camParams.l
        this.camera.right = this.camParams.r
        this.camera.top = this.camParams.t
        this.camera.bottom = this.camParams.b
        this.camera.position.set(this.camPos.x, this.camPos.y, this.camPos.z)
        this.camera.lookAt(new Vector3(this.camPos.x, this.camPos.y, 0))
        this.camera.updateProjectionMatrix()
    }

    mounted() {
        this.initCanvas()
    }

    render() {
        return (
            <div class={styles.wrap}>
                <p>
                    camPos: {JSON.stringify(this.camPos)}<br/>
                    <button onClick={e => this.changeCamPos(0, 1)}>上移</button>
                    <button onClick={e => this.changeCamPos(0, -1)}>下移</button>
                    <button onClick={e => this.changeCamPos(-1, 0)}>左移</button>
                    <button onClick={e => this.changeCamPos(1, 0)}>右移</button>
                </p>
                <p>
                    camParameter: {JSON.stringify(this.camParams)}<br/>
                    left:<input id="c-l" value={this.camParams.r} onInput={e => this.changeCamParam('left', e)}></input>
                    right:<input id="c-r" value={this.camParams.l} onInput={e => this.changeCamParam('right', e)}></input>
                    top:<input id="c-t" value={this.camParams.t} onInput={e => this.changeCamParam('top', e)}></input>
                    bottom:<input id="c-b" value={this.camParams.b} onInput={e => this.changeCamParam('bottom', e)}></input><br/>
                    <button onClick={e => this.moveFruscrum('up')}>上移</button>
                    <button onClick={e => this.moveFruscrum('down')}>下移</button>
                    <button onClick={e => this.moveFruscrum('left')}>左移</button>
                    <button onClick={e => this.moveFruscrum('right')}>右移</button>
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
