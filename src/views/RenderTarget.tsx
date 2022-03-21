import { Vue, Prop, Component, Watch } from 'vue-property-decorator'
import { WebGLRenderTarget, RepeatWrapping, Scene, ArrowHelper, BufferGeometry, BufferAttribute, Line, LineBasicMaterial, PerspectiveCamera, MeshBasicMaterial, MeshPhongMaterial, OrthographicCamera, TextureLoader, WebGLRenderer, BoxGeometry, ShapeGeometry, TextGeometry, FontLoader, SphereGeometry, MeshStandardMaterial, Mesh, Group, AmbientLight, HemisphereLight, Vector3, Color, Matrix4, RawShaderMaterial, GLSL1, InstancedBufferGeometry } from '../../public/three/src/Three'
import { OrbitControls } from '../../public/three/examples/jsm/controls/OrbitControls.js'
import { Heart } from './coms/heart'
import styles from './RenderTarget.module.scss'

@Component
export default class OrthCamera extends Vue {
    @Prop({ default: 'renderTarget' }) readonly title!: string
    scene?: THREE.Scene
    camera?: THREE.Camera
    renderer?: THREE.WebGLRenderer
    ambientLight?: THREE.AmbientLight
    control?: OrbitControls
    camPos = {x: 0, y: 0, z: 1}
    camParams = {l:-140, r: 860, t: 86, b: -206, n: 0, f: 2000}
    windowParams = {l: 0, t: 0, w: 300, h: 300}
    snapshotList: Array<string> = []


    initCanvas() {
        const el: HTMLDivElement = this.$refs['modelContainer'] as HTMLDivElement
        this.scene = new Scene()
        // this.camera = new PerspectiveCamera( 75, el.clientWidth / el.clientHeight, 0.1, 1000 )
        this.renderer = new WebGLRenderer({
            preserveDrawingBuffer: true // 要使用 toDataUrl，preserveDrawingBuffer必须为true
        })
        const light = new AmbientLight(0x404040, 110); // soft white light
        const hemisphereLight = new HemisphereLight(0xffffbb, 0x080820, 110);
        this.scene.add(light)
        this.scene.add(hemisphereLight)
        const dpr = window.devicePixelRatio
        this.renderer.setPixelRatio(dpr)
        this.renderer.setSize(el.clientWidth, el.clientHeight)
        // this.windowParams.w = el.clientWidth
        // this.windowParams.h = el.clientHeight
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
    changeWindowParam (type: string, e: InputEvent) {
        this.windowParams[type] = e.target.value
    }
    setFullScreen () {
        this.windowParams.w = this.renderer?.domElement.clientWidth
        this.windowParams.h = this.renderer?.domElement.clientHeight
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

    snapshot () {
        const dpr = window.devicePixelRatio
        const el = this.renderer.domElement
        const drawCanvas: HTMLCanvasElement = document.createElement('canvas')
        const p = new Promise((resolve, reject) => {

            let dx = this.windowParams.l * 1
            let dy = this.windowParams.t * 1
            let w = this.windowParams.w * 1
            let h = this.windowParams.h * 1
            // 拿到的buffer图像y轴是反的
            const dy2 = dy + h
            dx *= dpr
            dy = (el.clientHeight - dy2) * dpr
            w *= dpr
            h *= dpr

            const renderer: THREE.WebGLRenderer = this.renderer
            const target = new WebGLRenderTarget(el.clientWidth * dpr, el.clientHeight * dpr, {
                wrapS: RepeatWrapping,
                wrapT: RepeatWrapping,
                flipY: false
            })
            if (this.renderer) {
                renderer.setRenderTarget(target)
                renderer.render(this.scene, this.camera)
                renderer.setRenderTarget(null)
                renderer.render(this.scene, this.camera)
                const pixelBuffer = new Uint8ClampedArray(w * h * 4)
                renderer.readRenderTargetPixels( target, dx, dy, w, h, pixelBuffer)
                console.log(pixelBuffer.length / 4)
                drawCanvas.width = w
                drawCanvas.height = h
                // flipY
                const buffer = new ArrayBuffer(w * h * 4);
                const pixelBuffer2 = new Uint8ClampedArray(buffer)
                console.log(0, pixelBuffer2)
                let offset = 0
                for (let i = h - 1; i >= 0; i--) {
                    const temp = new Uint8ClampedArray(pixelBuffer, i * w * 4, w * 4)
                    // temp.forEach(ele => {
                    // console.log(3, temp, i * w * 4, w * 4)
                    // pixelBuffer2.set(temp, offset)
                    pixelBuffer2.set(temp.slice(i * w * 4, i * w * 4 + w * 4), offset)
                    // })
                    console.log('dv', offset)
                    offset += w * 4
                }
                drawCanvas.getContext('2d').putImageData(new ImageData(pixelBuffer2, w, h), 0, 0)
                this.snapshotList.push(drawCanvas.toDataURL())
            }
            
        })
        return p
    }

    snapshot2 () {
        const dpr = window.devicePixelRatio
        const el = this.renderer.domElement
        const drawCanvas: HTMLCanvasElement = document.createElement('canvas')
        const p = new Promise((resolve, reject) => {
            const dx = this.windowParams.l
            const dy = this.windowParams.t
            const w = this.windowParams.w * dpr
            const h = this.windowParams.h * dpr
            console.log(dx, dy ,w, h) 
            const image = new Image()
            image.src = el.toDataURL('image/png', 1)
            image.onload = () => {
                drawCanvas.width = w
                drawCanvas.height = h
                drawCanvas.getContext('2d').drawImage(image, dx, dy, w, h, 0, 0, w, h)
                const image2 = new Image()
                image2.src = drawCanvas.toDataURL('image/png', 1)
                image2.onload = () => {
                    this.snapshotList.push(image2.src)
                }
            }
        })
        return p
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
        const imgs = []
        for (let i = 0; i < this.snapshotList.length; i++) {
            imgs.push(<el-image style="position:absolute;left:0;top: 0;float:left;width:200px;margin:10px;border:1px solid blue;" src={this.snapshotList[i]} preview-src-list={this.snapshotList}></el-image>)
        }
        return (
            <div class={styles.wrap}>
                <p>
                    camPos: {JSON.stringify(this.camPos)}<br/>
                    <button onClick={e => this.changeCamPos(0, 1)}></button>
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
                <p>
                    {imgs}
                    截图左x:<input id="w-l" value={this.windowParams.l} onInput={e => this.changeWindowParam('l', e)}></input>
                    截图左y:<input id="w-r" value={this.windowParams.t} onInput={e => this.changeWindowParam('t', e)}></input>
                    截图宽度:<input id="w-t" value={this.windowParams.w} onInput={e => this.changeWindowParam('w', e)}></input>
                    截图高度:<input id="w-b" value={this.windowParams.h} onInput={e => this.changeWindowParam('h', e)}></input><br/>
                    全屏幕截图:<button onClick={e => this.setFullScreen()}>全屏幕</button><br/>
                    <button onClick={e => this.snapshot()}>webgl截图</button>
                    <button onClick={e => this.snapshot2()}>canvas截图</button>
                </p>
                <div class={styles.container}>
                    <div ref="modelContainer" class={styles.model} style={{width: '100%', height: '100%'}}></div>
                    <div class={styles.window} style={{ 
                    left: this.windowParams.l + 'px', top: this.windowParams.t + 'px',
                    width: this.windowParams.w + 'px', height: this.windowParams.h + 'px'}}></div>
                </div>
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