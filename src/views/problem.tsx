import { Vue, Prop, Component, Watch } from 'vue-property-decorator'
import { Scene, ArrowHelper, BufferGeometry, BufferAttribute, Line, LineBasicMaterial, PerspectiveCamera, MeshBasicMaterial, MeshPhongMaterial, OrthographicCamera, TextureLoader, WebGLRenderer, BoxGeometry, ShapeGeometry, TextGeometry, FontLoader, SphereGeometry, MeshStandardMaterial, Mesh, Group, AmbientLight, HemisphereLight, Vector3, Color, Matrix4, RawShaderMaterial, GLSL1, InstancedBufferGeometry } from '../../public/three/src/Three'
import styles from './Test.module.scss'
import { OrbitControls } from '../../public/three/examples/jsm/controls/OrbitControls.js'
import { Heart } from './coms/heart'
import { Ground } from './coms/ground'
import { points, indices, itemSize } from './consts'

@Component
export default class TestComponent extends Vue {
    @Prop({ default: 'Hello World problem' }) readonly title!: string
    scene?: THREE.Scene
    camera?: THREE.Camera
    renderer?: THREE.WebGLRenderer
    ambientLight?: THREE.AmbientLight
    control?: OrbitControls



    initCanvas() {
        const el: HTMLDivElement = this.$refs['modelContainer'] as HTMLDivElement
        this.scene = new Scene()
        this.camera = new OrthographicCamera(-50, 50, 50, -50, 1, 1000)
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
        const mat2 = new MeshBasicMaterial({color: 0x00ffff})
        const vertices = new BufferAttribute(new Float32Array(points), itemSize, false)
        const indicesAttr = new BufferAttribute(new Uint16Array(indices), 1, false)
        const bg = new InstancedBufferGeometry()
        const bg2 = new BufferGeometry()
        bg.setAttribute('position', vertices)
        bg.setIndex(indicesAttr)
        bg2.setAttribute('position', vertices)
        bg2.setIndex(indicesAttr)
        bg.instanceCount = 2
        const ff = new Mesh(bg, mat2)
        
        this.scene.add(ff)
        console.log('rr', Math.random())
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
