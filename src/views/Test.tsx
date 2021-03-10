import { Vue, Prop, Component } from 'vue-property-decorator'
import {Scene, PerspectiveCamera, WebGLRenderer, BoxGeometry, MeshBasicMaterial, Mesh} from 'three'
import styles from './Test.module.scss'

@Component
export default class TestComponent extends Vue {
    @Prop({ default: 'Hello World' }) readonly title!: string


    initCanvas () {
        const el: HTMLDivElement = this.$refs['modelContainer'] as HTMLDivElement
        const scene = new Scene()
        const camera = new PerspectiveCamera( 75, el.clientWidth / el.clientHeight, 0.1, 1000 )
        const renderer = new WebGLRenderer()
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

        const animate = function () {
            requestAnimationFrame( animate )
            cube.rotation.x += 0.01
            cube.rotation.y += 0.01
            renderer.render( scene, camera )
        }
        animate();
    }

    mounted () {
        this.initCanvas()
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
