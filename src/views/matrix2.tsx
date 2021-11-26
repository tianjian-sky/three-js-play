import { Vue, Prop, Component, Watch } from 'vue-property-decorator'
import { Scene, ArrowHelper, BufferGeometry, BufferAttribute, Line, LineBasicMaterial, PerspectiveCamera, MeshBasicMaterial, MeshPhongMaterial, OrthographicCamera, TextureLoader, WebGLRenderer, BoxGeometry, ShapeGeometry, TextGeometry, FontLoader, SphereGeometry, MeshStandardMaterial, Mesh, Group, AmbientLight, HemisphereLight, Vector3, Color, Matrix4, RawShaderMaterial, GLSL1, InstancedBufferGeometry, InterleavedBufferAttribute, InstancedInterleavedBuffer, Plane, CircleGeometry } from '../../public/three/src/Three'
import styles from './Test.module.scss'
import { OrbitControls } from '../../public/three/examples/jsm/controls/OrbitControls.js'

/**
 * 问题排查测试用例
 */
let cube
@Component
export default class TestComponent extends Vue {
    @Prop({ default: 'Hello World problem' }) readonly title!: string
    scene?: THREE.Scene
    camera?: THREE.Camera
    renderer?: THREE.WebGLRenderer
    ambientLight?: THREE.AmbientLight
    control?: OrbitControls
    rotateCenter = {x: 0, y: 0, z: 0}
    scale = 1


    initCanvas() {
        const el: HTMLDivElement = this.$refs['modelContainer'] as HTMLDivElement
        this.scene = new Scene()
        const camWidth = 100
        let camHeight = 100
        camHeight = camWidth / (el.clientWidth / el.clientHeight)
        this.camera = new OrthographicCamera(- camWidth / 2, camWidth / 2, camHeight/ 2, - camHeight / 2, 1, 1000)
        this.camera.position.set(0, 0, 10)
        this.camera.lookAt(new Vector3(0, 0, 0))
        // this.camera = new PerspectiveCamera( 75, el.clientWidth / el.clientHeight, 0.1, 1000 )
        this.scene.add(this.camera)
        this.renderer = new WebGLRenderer({
            depth: false
        })
        this.renderer.localClippingEnabled = true
        this.control = new OrbitControls(this.camera, this.renderer.domElement)
        const light = new AmbientLight(0x404040, 110); // soft white light
        const hemisphereLight = new HemisphereLight(0xffffbb, 0x080820, 110);
        this.scene.add(light)
        this.scene.add(hemisphereLight)
        this.renderer.setPixelRatio(window.devicePixelRatio)
        this.renderer.setSize(el.clientWidth, el.clientHeight)
        el.appendChild(this.renderer.domElement)
        this.camera.position.z = 100

        const geometry = new BoxGeometry( 30, 10, 1 )
        const material = new MeshBasicMaterial( {color: 0x00ff00} )
        cube = new Mesh( geometry, material )
        this?.scene.add( cube )

        const animate = () => {
            requestAnimationFrame(animate)
            if (this.renderer && this.scene && this.camera) {
                this.renderer.render(this.scene, this.camera)
            }
        }
        animate();
    }

    transform1 () {
        this.resetTransform()
        // 先旋转
        setTimeout(() => {
            const transform1 = new Matrix4().makeRotationZ(30 * Math.PI / 180) 
            cube.matrix = cube.matrix.multiply(transform1)
            cube.matrixAutoUpdate = false
        }, 3000)

        // 再平移   
        setTimeout(() => {
            const transform1 = new Matrix4().makeTranslation(10, 0, 0)
            cube.matrix = cube.matrix.multiply(transform1)
            cube.matrixAutoUpdate = false
        }, 6000)
    }

    transform2 () {
        this.resetTransform()
        // 再平移   
        setTimeout(() => {
            const transform1 = new Matrix4().makeTranslation(10, 0, 0)
            cube.matrix = cube.matrix.multiply(transform1)
            cube.matrixAutoUpdate = false
        }, 3000)

        // 先旋转
        setTimeout(() => {
            const transform1 = new Matrix4().makeRotationZ(30 * Math.PI / 180) 
            cube.matrix = cube.matrix.multiply(transform1)
            cube.matrixAutoUpdate = false
        }, 6000)
    }

    resetTransform () {
        cube.matrix = new Matrix4()
        cube.matrixAutoUpdate = false
    }

    changeRotationCenter (e: InputEvent, type: string) {
        this.rotateCenter[type] = e.target.value
    }

    
    changeScale (e: InputEvent) {
        this.scale = e.target.value
    }
    

    mounted() {
        this.initCanvas()
    }

    transform () {
        /**
        * x = (x-px)*scale + px = x*scale + (1-scale)*px
        * y = (y-py)*scale + py = y*scale + (1-scale)*py
        **/

        /*
        *  行主序： 矩阵 * 向量
        *  列主序： 向量 * 矩阵
        *  setFromMatrixColumn 行主序的某一列， 列主序中某一行
        *  setPosition, 改变列主序数组中12，13，14个，即常数分量d,h, k
        */


        //                {x,0,0,d  (a
        //                 0,f,0,h,  b
        //                 0,0,z,K   c
        //                 0,0,0,1}  1)

        //      (a,b,c,1)  {x,0,0,0
        //                  0,f,0,0,
        //                  0,0,z,0
        //                  d,h,k,1}
        const container = this?.scene.getObjectByName('transform')
        const transform = new Matrix4()
        transform.makeScale(this.scale, this.scale, 1).setPosition((1-this.scale)*this.rotateCenter.x, (1-this.scale)*this.rotateCenter.y, 0)
        container.matrix = transform
        container.matrixAutoUpdate = false

    }

    render() {
        return (
            <div class={styles.wrap}>
                <p class={styles.title}>{this.title}</p>
                <div>
                    rotate center:
                    <input id="rc-x" value={this.rotateCenter.x} onInput={e => this.changeRotationCenter(e, 'x')}></input>
                    <input id="rc-y" value={this.rotateCenter.y} onInput={e => this.changeRotationCenter(e, 'y')}></input>
                    <input id="rc-z" value={this.rotateCenter.z} onInput={e => this.changeRotationCenter(e, 'z')}></input>
                    <br/>
                    scale:
                    <input id="scale-i" value={this.scale} onInput={e => this.changeScale(e)}></input>
                    <br/>
                    <button onClick={this.transform1}>旋转矩阵 x 平移矩阵</button>
                    <button onClick={this.transform2}>平移矩阵 x 旋转矩阵</button>
                    <button onClick={this.resetTransform}>重置</button>
                </div>
                <div ref="modelContainer" class={styles.model}>运用变换</div>
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
