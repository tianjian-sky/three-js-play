import { Vue, Prop, Component, Watch } from 'vue-property-decorator'
import { Scene, ArrowHelper, BufferGeometry, BufferAttribute, Line, LineBasicMaterial, PerspectiveCamera, MeshBasicMaterial, MeshPhongMaterial, OrthographicCamera, TextureLoader, WebGLRenderer, BoxGeometry, ShapeGeometry, TextGeometry, FontLoader, SphereGeometry, MeshStandardMaterial, Mesh, Group, AmbientLight, HemisphereLight, Vector3, Color, Matrix4, RawShaderMaterial, GLSL1, InstancedBufferGeometry } from 'three'
import styles from './Test.module.scss'
import { OrbitControls } from '../../public/three/examples/jsm/controls/OrbitControls.js'
import { Heart } from './coms/heart'
import { Ground } from './coms/ground'
import { points, indices, itemSize } from './consts'

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
        this.camera.position.z = 100
        const heart1 = new Heart()
        const heart2 = new Heart()
        const haert = new Group()
        haert.add(heart1.getHeart())
        haert.add(heart2.getHeart().rotateY(-Math.PI))
        haert.translateX(100)
        haert.translateY(-99)
        // this.scene.add(haert)
        const axesHelper = new ArrowHelper()
        this.scene.add(axesHelper)

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

        const ggg = new Group()
        const gg = new BufferGeometry()
        const vv = new Float32Array([
            -20.0, -20.0, 0.0,
            20.0, 20.0, 0.0,
            -20.0, 20.0, 0.0,
        ])
        gg.setAttribute('position', new BufferAttribute(vv, 3))
        const mm = new MeshBasicMaterial({ color: 0xff0000 })
        const me = new Mesh(gg, mm)
        me.name = 'aaa'
        ggg.add(me)
        this.scene.add(ggg)


        const g1 = new Group();
        g1.rotateZ(.25 * Math.PI)
        g1.translateX(50);
        const mm2 = new MeshBasicMaterial({ color: 0x00ff00 })
        const me2 = new Mesh(gg, mm2)
        // this.scene.add(g1)
        g1.add(me2)
        setTimeout(() => {
            const gg3 = new Group()
            const mm3 = new MeshBasicMaterial({ color: 0xffff00 })
            const me3 = new Mesh(gg, mm3)
            gg3.matrix = new Matrix4().copy(g1.matrix)
            gg3.add(me3)
            gg3.matrixAutoUpdate = false
            console.log(JSON.stringify(g1.matrix), JSON.stringify(gg3.matrixWorld), JSON.stringify(gg3.matrix), JSON.stringify(me3.matrixWorld))
            gg3.updateWorldMatrix(false, true) 
            this.scene.add(gg3)

            console.log(JSON.stringify(g1.matrix), JSON.stringify(gg3.matrixWorld), JSON.stringify(gg3.matrix), JSON.stringify(me3.matrixWorld))
        }, 1000)
        const lineGeometry = new BufferGeometry()
        const material = new LineBasicMaterial({
            color: 0x00ff00,
            linewidth: 110
        })
        lineGeometry.setFromPoints([
            new Vector3(0, 0, 0),
            new Vector3(100, 100, 100),
        ]);
        const line = new Line(lineGeometry, material)
        this.scene.add(line)

        const rsMat = new RawShaderMaterial({
            uniforms: {
                color: {
                    value: new Color(0xff00ff)
                }
            },
            vertexShader: `
                precision highp float;
                precision highp int;
                attribute vec2 position;
                uniform mat4 modelViewMatrix;
                uniform mat4 projectionMatrix;
                
                void main() {
                    vec4 pos = vec4(position, 0.0, 1.0);
                    gl_Position = projectionMatrix * modelViewMatrix * pos;
                }
            `,
            fragmentShader: `
                precision highp float;
                precision highp int;
                uniform vec3 color;
                vec3 myColor = vec3(1.0, 0, 0);
                varying vec4 fragColor;
                // #include <clipping_planes_pars_fragment>
                
                void main() {
                    // #include <clipping_planes_fragment>
                    gl_FragColor = vec4(myColor, 1.0);
                }
            `,
            transparent: false, // 暂时设置为false，否则后绘制的线条被覆盖？ TODO:
            depthTest: true,
            depthWrite: true,
            glslVersion: GLSL1,
            clipping: false
        })
        const vertices = new BufferAttribute(new Float32Array(points), 3, false)
        const indicesAttr = new BufferAttribute(new Uint16Array(indices), 3, false)
        const bg = new InstancedBufferGeometry()
        bg.setAttribute('position', vertices)
        bg.setIndex(indicesAttr)
        const ff = new Mesh(bg, rsMat)
        this.scene.add(ff)

        const fontLoader = new FontLoader()
        fontLoader.load('/helvetiker_regular.typeface.json', font => {
            const textGeometry = new TextGeometry('5', {
                font: font,
                height: 1,
                size: 30
            })
            // textGeometry.computeBoundingBox()
            const textMaterial = new MeshBasicMaterial({ color: new Color(0xffffff) })
            const text = new Mesh(textGeometry, textMaterial)
            text.translateX(-1 * 2 * 0.7 / 2)
            text.translateY(-2 / 2)
            // this.scene?.add(text)

            const shapes = font.generateShapes('i love u', 100)
            const geometry2 = new ShapeGeometry(shapes)
            geometry2.computeBoundingBox()
            geometry2.translate(-20, -20, 10)
            const text2 = new Mesh(geometry2, new MeshBasicMaterial({ color: new Color(0x1352f5) }))
            this.scene?.add(text2)
            setTimeout(() => {
                const img = new Image()
                this.renderer?.render(this?.scene, this?.camera)
                const dataUrl = this?.renderer?.domElement.toDataURL('image/png', 1.0)
                img.src = dataUrl || ''
                document.body.appendChild(img)
            }, 1000)

        },
            function (xhr) {
                console.log((xhr.loaded / xhr.total * 100) + '% loaded')
            },
            function (err) {
                console.log('An error happened', err)
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
