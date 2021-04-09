import { Vue, Prop, Component } from 'vue-property-decorator'
import {Scene, PerspectiveCamera, WebGLRenderer, BoxGeometry, PlaneGeometry, CircleGeometry, SphereGeometry, MeshBasicMaterial, Mesh, ArrowHelper, Vector2, Vector3, DoubleSide, LineBasicMaterial, Group, TextureLoader, Raycaster, BufferGeometry, Line} from 'three'
import styles from './CubeAndCompass.module.scss'
import { OrbitControls } from '../../public/three/examples/jsm/controls/OrbitControls.js'
import Stats from '../../public/three/examples/jsm/libs/stats.module.js'

@Component
export default class CubeComponent extends Vue {
    @Prop({ default: 'Cube & Compass' }) readonly title!: string
    scene?: THREE.Scene
    camera?: THREE.Camera
    renderer?: THREE.WebGLRenderer
    sceneBG?: THREE.Scene
    cameraBG?: THREE.Camera
    rendererBG?: THREE.WebGLRenderer
    control?: OrbitControls
    raycaster?: THREE.Raycaster
    hoveredObjectList: THREE.Mesh[] = []
    compassRotation = 0
    cursor = 'default'
    stats = Stats()

    initCanvasBg () {
        const el: HTMLDivElement = this.$refs['bgContainer'] as HTMLDivElement
        const scene = this.sceneBG = new Scene()
        const camera = this.cameraBG =  new PerspectiveCamera(75, el.clientWidth / el.clientHeight, 0.1, 1000)
        camera.position.set(0, 0, 7)
        camera.lookAt(new Vector3())
        const renderer = this.rendererBG = new WebGLRenderer({antialias: true, alpha:true})
        renderer.setClearColor(0xEEEEEE, 0.0)
        renderer.setPixelRatio( window.devicePixelRatio )
        renderer.setSize( el.clientWidth, el.clientHeight )
        window.addEventListener('resize', () => {
            renderer.setSize(el.clientWidth, el.clientHeight)
        })
        el.appendChild(renderer.domElement)
        new TextureLoader().load('/images/compass.png', (texture) => {
            // const compassGeometry = new PlaneGeometry(10, 10, 1)
            const compassGeometry = new CircleGeometry(5, 32)
            const compassMaterial = new MeshBasicMaterial({side: DoubleSide, map: texture})
            const compass = new Mesh(compassGeometry, compassMaterial)
            compassGeometry.translate.call(compassGeometry, 0, 0, 0)
            scene.add(compass)
        })
    }

    initCanvas () {
        const el: HTMLDivElement = this.$refs['modelContainer'] as HTMLDivElement
        const scene = this.scene = new Scene()
        const camera = this.camera = new PerspectiveCamera( 75, el.clientWidth / el.clientHeight, 0.1, 1000 )
        camera.position.set(0, 0, 12)
        camera.lookAt(new Vector3())
        const renderer = this.renderer = new WebGLRenderer({antialias: true, alpha:true})
        renderer.setClearColor(0xEEEEEE, 0.0)
        renderer.setPixelRatio( window.devicePixelRatio )
        renderer.setSize( el.clientWidth, el.clientHeight )
        const control = this.control = new OrbitControls(camera, renderer.domElement)
        control.enableZoom = false
        control.enablePan = false
        control.addEventListener('change', (e) => {
            if (this.camera) {
                const vec = new Vector3()
                this.camera.getWorldDirection(vec).multiplyScalar(-1)
                const angle = Math.atan2(vec.x, vec.z)
                const angleDiff = angle - this.compassRotation
                this.compassRotation = angle
                if (this.cameraBG) {
                    this.cameraBG.rotateZ(angleDiff)
                }
            }
        })
        el.addEventListener('click', this.mouseClickHandler)
        this.raycaster = new Raycaster()
        el.appendChild( renderer.domElement )
        el.addEventListener('mousemove', this.mouseMoveHandler)

        const geometry = new SphereGeometry(1, 16, 16)
        const material = new MeshBasicMaterial({color: 0xffff00})
        const cube = new Mesh(geometry, material)
        scene.add(cube)

        const cornerGeometry = new BoxGeometry( 1, 1, 1 )
        const cornerOffsets: (number|string)[][] = [
            [-3, 3, 3, 'c_CAA'], // 上左前-右前-右后-左后
            [3, 3, 3, 'c_AAA'],
            [3, 3, -3, 'c_AAC'],
            [-3, 3, -3, 'c_CAC'],
            [-3, -3, 3, 'c_CCA'], // 下左前-右前-右后-左后
            [3, -3, 3, 'c_ACA'],
            [3, -3, -3, 'c_ACC'],
            [-3, -3, -3, 'c_CCC']
        ]
        for (let i = 0; i < cornerOffsets.length; i++) {
            const cornerMaterial = new MeshBasicMaterial({color: 0xffffff})
            const _geometry = cornerGeometry.clone()
            _geometry.translate.call(_geometry, cornerOffsets[i][0] as number, cornerOffsets[i][1] as number, cornerOffsets[i][2] as number)
            const mesh = new Mesh(_geometry, cornerMaterial)
            mesh.userData.id = cornerOffsets[i][3]
            scene.add(mesh)
        }

        const edgeGeometry = new BoxGeometry( 5, 1, 1 )
        const edgeOffsets: (number|string)[][] = [
            [-3, 3, 0, 0, Math.PI/2, 0, 'e_CAB'], // 上左中-前中-右中-后中
            [0, 3, 3, 0, 0, 0, 'e_BAA'],
            [3, 3, 0, 0, Math.PI/2, 0, 'e_AAB'],
            [0, 3, -3, 0, 0, 0, 'e_BAC'],
            [-3, 0, 3, 0, 0, Math.PI/2, 'e_CBA'], // 中左前-右前-右后-左后
            [3, 0, 3, 0, 0, Math.PI/2, 'e_ABA'],
            [3, 0, -3, 0, 0, Math.PI/2, 'e_ABC'],
            [-3, 0, -3, 0, 0, Math.PI/2, 'e_CBC'],
            [-3, -3, 0, 0, Math.PI/2, 0, 'e_CCB'], // 下左中-前中-右中-后中
            [0, -3, 3, 0, 0, 0, 'e_BCA'],
            [3, -3, 0, 0, Math.PI/2, 0, 'e_ACB'],
            [0, -3, -3, 0, 0, 0, 'e_BCC'],
        ]
        for (let i = 0; i < edgeOffsets.length; i++) {
            const edgeMaterial = new MeshBasicMaterial({color: 0xffffff})
            const _geometry = edgeGeometry.clone()
            _geometry.rotateX(edgeOffsets[i][3] as number)
            _geometry.rotateY(edgeOffsets[i][4] as number)
            _geometry.rotateZ(edgeOffsets[i][5] as number)
            _geometry.translate.call(_geometry, edgeOffsets[i][0] as number, edgeOffsets[i][1] as number, edgeOffsets[i][2] as number)
            const mesh = new Mesh(_geometry, edgeMaterial)
            mesh.userData.id = edgeOffsets[i][6]
            scene.add(mesh)
        }
        const lineOffsets: (number|string)[][] = [
            [-3.5, 3.5, 0, 0, -Math.PI/2, 0, 'l_CAX'], // 顶：左前右后
            [0, 3.5, 3.5, 0, 0, 0, 'l_XAA'],
            [3.5, 3.5, 0, 0, -Math.PI/2, 0, 'l_AAX'],
            [0, 3.5, -3.5, 0, 0, 0, 'l_XAC'],
            [-3.5, -3.5, 0, 0, -Math.PI/2, 0, 'l_CCX'], // 底：左前右后
            [0, -3.5, 3.5, 0, 0, 0, 'l_XCA'],
            [3.5, -3.5, 0, 0, -Math.PI/2, 0, 'l_ACX'],
            [0, -3.5, -3.5, 0, 0, 0, 'l_XCC'],
            [-3.5, 0, 3.5, 0, 0, -Math.PI/2, 'l_CXA'], // 腰：左前右前右后左后
            [3.5, 0, 3.5, 0, 0, -Math.PI/2, 'l_AXA'],
            [3.5, 0, -3.5, 0, 0, -Math.PI/2, 'l_AXC'],
            [-3.5, 0, -3.5, 0, 0, -Math.PI/2, 'l_CXC']
        ]
        for (let i = 0; i < lineOffsets.length; i++) {
            const lineMaterial = new LineBasicMaterial({
                color: 0xB9BBBD
            })
            const points = [new Vector3( -3.5, 0, 0 ), new Vector3( 3.5, 0, 0 )]
            const _geometry = new BufferGeometry().setFromPoints( points )
            _geometry.rotateX(lineOffsets[i][3] as number)
            _geometry.rotateY(lineOffsets[i][4] as number)
            _geometry.rotateZ(lineOffsets[i][5] as number)
            _geometry.translate.call(_geometry, lineOffsets[i][0] as number, lineOffsets[i][1] as number, lineOffsets[i][2] as number)
            const line = new Line(_geometry, lineMaterial)
            line.userData.id = lineOffsets[i][6]
            scene.add(line)
        }
        
        const faceGeometry = new PlaneGeometry(5, 5)
        const faceOffsets: (number|string)[][] = [
            [-3.5, 0, 0, 0, -Math.PI/2, 0, '左', '/images/左.png', 'f_CBB'], // 左-前-右-后-顶-底
            [0, 0, 3.5, 0, 0, 0, '前', '/images/前.png', 'f_BBA'],
            [3.5, 0, 0, 0, Math.PI/2, 0, '右', '/images/右.png', 'f_ABB'],
            [0, 0, -3.5, 0, -Math.PI, 0, '后', '/images/后.png', 'f_BBC'],
            [0, 3.5, 0, -Math.PI/2, 0, 0, '顶', '/images/顶.png', 'f_BAB'],
            [0, -3.5, 0, Math.PI/2, 0, 0, '底', '/images/底.png', 'f_BCB']
        ]
        for (let i = 0; i < faceOffsets.length; i++) {
            const group = new Group()
            const _geometry = faceGeometry.clone()
            _geometry.rotateX(faceOffsets[i][3] as number)
            _geometry.rotateY(faceOffsets[i][4] as number)
            _geometry.rotateZ(faceOffsets[i][5] as number)
            _geometry.translate(faceOffsets[i][0] as number, faceOffsets[i][1] as number, faceOffsets[i][2] as number)
            const tl = new TextureLoader().load(faceOffsets[i][7] as string, function (texture) {
                const faceMaterial = new MeshBasicMaterial({color: 0xffffff, side: DoubleSide, map: texture})
                const mesh = new Mesh(_geometry, faceMaterial)
                mesh.userData.id = faceOffsets[i][8]
                scene.add(mesh)
            })
            // texture.wrapS = THREE.RepeatWrapping;
            // texture.wrapT = THREE.RepeatWrapping;

            // 2.css 添加字体
            // const labelRenderer = this.labelRenderer
            // labelRenderer.setSize(el.clientWidth, el.clientHeight)
            // labelRenderer.domElement.style.position = 'absolute';
            // labelRenderer.domElement.style.top = '0px';
            // el.appendChild(labelRenderer.domElement)

            // const label = document.createElement( 'label' );
            // label.className = 'label';
            // label.textContent = faceOffsets[i][6] as string
            // const labelObj = new CSS2DObject(label)
            // mesh.add(labelObj)


            // 3. text geometry 添加字体
            // const loader = new FontLoader();
            // loader.load('/Microsoft YaHei_Regular.json', function ( font ) {
                // const textGeo = new TextGeometry(faceOffsets[i][6] as string, {
                // 	font: font,
                // 	size: 2.5,
                // 	height: 0.1
                // })

                // textGeo.computeBoundingBox()
                // if (textGeo && textGeo.boundingBox) {
                //     const centerOffset = [-0.5*(textGeo.boundingBox.max.x - textGeo.boundingBox.min.x), -0.5*(textGeo.boundingBox.max.y - textGeo.boundingBox.min.y)]
                //     const textMesh = new Mesh(textGeo, new MeshBasicMaterial({color: 0x969A9D, side: DoubleSide}))
                //     textMesh.position.x = 0
                //     textMesh.position.y = 0
                //     textMesh.position.z = 0
                //     group.add(textMesh)
                // }
            // })
        }
        const axesHelper = new ArrowHelper()
        scene.add(axesHelper)
    }

    initStats () {
        const el: HTMLDivElement = this.$refs['modelContainer'] as HTMLDivElement
        this.stats.domElement.style.position = 'absolute';
        this.stats.domElement.style.top = '0px';
        el.appendChild(this.stats.domElement );
    }

    getIntersectMeshes (mouse: Vector2): any[] {
        let intersects: any[] = []
        if (!this.raycaster || !this.camera || !this.scene) {
            return intersects
        }
        const raycaster = this.raycaster
        raycaster.setFromCamera(mouse, this.camera)
        intersects = raycaster.intersectObjects(this.scene.children)
        return intersects
    }

    mouseMoveHandler (e: MouseEvent) {
        const el = e.target as HTMLElement
        this.cursor = 'default'
        if (!this.raycaster || !this.scene || !this.camera || !el || el != this.renderer?.domElement) return
        const mouse = new Vector2()
        mouse.x = (e.offsetX / el.clientWidth) * 2 - 1
        mouse.y = -(e.offsetY / el.clientHeight) * 2 + 1
        const intersects = this.getIntersectMeshes(mouse)
        this.hoveredObjectList.forEach((obj: THREE.Mesh) => {
            if (obj.material) {
                if (obj.material instanceof Array) {
                    obj.material.forEach((mat: any) => {
                        if ('color' in mat) {
                            mat.color.set(0xffffff)
                        }
                    })
                } else {
                    if ('color' in obj.material) {
                        obj.material.color.set(0xffffff)
                    }
                }
            }
        })
        this.hoveredObjectList = []
        if (intersects.length) { // 有时候一些不可见的mesh也会判定为相交？
            for (let i = 0; i < intersects.length; i++) {
                if (intersects[i].object && intersects[i].object instanceof Mesh) {
                    const intersectedMesh = intersects[i].object as Mesh
                    if (intersectedMesh.userData && intersectedMesh.userData.id && intersectedMesh.userData.id.match(/(e|c|f)_/)) {
                        this.cursor = 'pointer'
                        if (intersectedMesh.material) {
                            if (intersectedMesh.material instanceof Array) {
                                intersectedMesh.material.forEach((mat: any) => {
                                    if ('color' in mat) {
                                        mat.color.set(0xd4ebff)
                                    }
                                })
                            } else {
                                if ('color' in intersectedMesh.material) {
                                    intersectedMesh.material.color.set(0xd4ebff)
                                }
                            }
                        }
                        this.hoveredObjectList.push(intersectedMesh)
                        break
                    }
                }
            }
        }
    }

    mouseClickHandler (e: MouseEvent) {
        const el = e.target as HTMLElement
        const mouse = new Vector2()
        mouse.x = (e.offsetX / el.clientWidth) * 2 - 1
        mouse.y = -(e.offsetY / el.clientHeight) * 2 + 1
        const intersects = this.getIntersectMeshes(mouse)
        if (intersects.length) {
            for (let i = 0; i < intersects.length; i++) {
                if (intersects[i].object && intersects[i].object instanceof Mesh) {
                    const intersectedMesh = intersects[i].object as Mesh
                    if (intersectedMesh.userData && intersectedMesh.userData.id && intersectedMesh.userData.id.match(/(e|c|f)_/)) {
                        const id = intersectedMesh.userData.id
                        const [type, posStr] = id.split('_')
                        console.log('点击：', type, posStr)
                        break
                    }
                }
            }
        }
    }

    animate () {
        requestAnimationFrame(this.animate)
        if (this.renderer && this.scene && this.camera) {
            this.renderer.render(this.scene, this.camera)
        }
        if (this.rendererBG && this.sceneBG && this.cameraBG) {
            this.rendererBG.render(this.sceneBG, this.cameraBG)
        }
        this.stats.update()
    }
    mounted () {
        this.initCanvasBg()
        this.initCanvas()
        this.initStats()
        this.animate()
    }
 
    render () {
        return (
            <div class={styles.wrap} style={{cursor: this.cursor}}>
                <p class={styles.title}>{this.title}</p>
                <div class={styles.modelContainer}>
                <div ref="bgContainer" class={styles.model}></div>
                <div ref="modelContainer" class={styles.model}></div>
                </div>
            </div>
        )
    }

    beforeDestroy () {
        this.renderer && this.renderer.dispose()
        this.rendererBG && this.rendererBG.dispose()
        this.control && this.control.dispose()
    }
}
