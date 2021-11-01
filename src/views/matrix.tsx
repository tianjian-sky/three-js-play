import { Vue, Prop, Component, Watch } from 'vue-property-decorator'
import { Scene, ArrowHelper, BufferGeometry, BufferAttribute, Line, LineBasicMaterial, PerspectiveCamera, MeshBasicMaterial, MeshPhongMaterial, OrthographicCamera, TextureLoader, WebGLRenderer, BoxGeometry, ShapeGeometry, TextGeometry, FontLoader, SphereGeometry, MeshStandardMaterial, Mesh, Group, AmbientLight, HemisphereLight, Vector3, Color, Matrix4, RawShaderMaterial, GLSL1, InstancedBufferGeometry, InterleavedBufferAttribute, InstancedInterleavedBuffer, Plane, CircleGeometry } from '../../public/three/src/Three'
import styles from './Test.module.scss'
import { OrbitControls } from '../../public/three/examples/jsm/controls/OrbitControls.js'

/**
 * 问题排查测试用例
 */

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
        this.camera = new OrthographicCamera(-50, 50, 50, -50, 1, 1000)
        this.camera.position.set(0, 0, 1)
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

        const geometry1 = new CircleGeometry( 1, 32 )
        const material1 = new MeshBasicMaterial( { color: 0xff0000 } );
        const circle1 = new Mesh( geometry1, material1 )
        this?.scene.add( circle1 )

        const geometry = new BoxGeometry( 10, 10, 1 )
        const material = new MeshBasicMaterial( {color: 0x00ff00} )
        const cube = new Mesh( geometry, material )
        cube.translateX(10)
        cube.translateY(10)
        this?.scene.add( cube )

        const geometry2 = new BoxGeometry( 10, 10, 1 )
        const material2 = new MeshBasicMaterial( {color: 0x00ffff} )
        const cube2 = new Mesh( geometry2, material2 )
        cube2.translateX(10)
        cube2.translateY(10)
        const transform = new Matrix4()
        transform.makeScale(.5, .5, 1)
        cube2.applyMatrix4(transform)
        this?.scene.add( cube2 )

        // const geometry3 = new BoxGeometry( 10, 10, 1 )
        // const material3 = new MeshBasicMaterial( {color: 0xffff00} )
        // const cube3 = new Mesh( geometry3, material3 )
        // // cube3.translateX(10)
        // // cube3.translateY(10)
        // const transform3 = new Matrix4()
        // transform3.makeScale(.1, .1, 1).setPosition(10, 10, 0)
        // // transform3.makeTranslation(5, 5, 0)
        // console.log('mat', transform3)
        // cube3.matrix.multiplyMatrices(cube3.matrix, transform3)
        // cube3.matrixAutoUpdate = false
        // this?.scene.add( cube3 )
    
        // const geometryp2 = new CircleGeometry( 1, 32 )
        // const materialp2 = new MeshBasicMaterial( { color: 0xff0000 } );
        // const circle2 = new Mesh( geometryp2, materialp2 )
        // circle2.translateX(10)
        // circle2.translateY(10)
        // this?.scene.add( circle2 )

        let group = new Group()
        group.name="transform"
        for (let i = 0; i < 5; i++){
            let v = (i > 1 ? 1 : -1) * 10 * [2,1,0,1,2][i]
            for (let j = 0; j < 5; j++) {
                let h = (j > 1 ? 1 : -1) * 10 * [2,1,0,1,2][j]
                const g = new BoxGeometry( 5, 5, 1 )
                const m = new MeshBasicMaterial( {color: 0xff00f0} )
                const cube = new Mesh( g, m )
                cube.translateX(h)
                cube.translateY(v)
                group.add(cube)
            }
        }
        this?.scene.add(group)
        // const transform3 = new Matrix4()
        // transform3.makeScale(0.5, 0.5, 1).setPosition(0.5*-5, 0, 0)
        // group.matrix.multiplyMatrices(group.matrix, transform3)
        // group.matrixAutoUpdate = false

        const animate = () => {
            requestAnimationFrame(animate)
            if (this.renderer && this.scene && this.camera) {
                this.renderer.render(this.scene, this.camera)
            }
        }
        animate();
    }

    changeRotationCenter (e: InputEvent, type: String) {
        this.rotateCenter[type] = e.target.value
    }

    changeScale (e:InputEvent) {
        this.scale = e.target.value
    }


    mounted() {
        this.initCanvas()
    }

    transform () {
        console.log(3)
        /**
        * x = (x-px)*scale + px = x*scale + (1-scale)*px
        * y = (y-py)*scale + py = y*scale + (1-scale)*py
        **/
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
                    <button onClick={this.transform}></button>
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
