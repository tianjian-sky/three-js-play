import { Vue, Prop, Component } from 'vue-property-decorator'
import {AxesHelper, Spherical, Euler, Quaternion, Scene, PerspectiveCamera, WebGLRenderer, BoxGeometry, PlaneGeometry, CircleGeometry, SphereGeometry, AmbientLight, SrcColorFactor, OneMinusSrcColorFactor, MaxEquation, PointLight, Color, SpotLight, HemisphereLight, MeshBasicMaterial, MeshStandardMaterial, MeshToonMaterial, Mesh, ArrowHelper, Vector2, Vector3, DoubleSide, LineBasicMaterial, Group, TextureLoader, Raycaster, BufferGeometry, Line, CustomBlending, InstancedMesh} from 'three'
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
    hoveredObjectList?: THREE.Mesh[] = []
    compassRotation = 0
    cursor = 'default'
    highlightColor = 0xF65D30
    matColor = 0xffffff
    edgeColor = 0xB9BBBD
    // matColor = 0xC9D2E1
    // MatClass = MeshBasicMaterial
    MatClass = MeshStandardMaterial// MeshStandardMaterial
    // @ts-ignore
    stats = Stats()
    mouseDown = false
    rotate = {
        moveX: 0,
        moveY: 0,
        startX: 0,
        startY: 0,
        x: 0,
        y: 0,
        startTime: 0,
        q: null
    }
    cube?: THREE.Group

    initCanvasBg () {
        const el: HTMLDivElement = this.$refs['bgContainer'] as HTMLDivElement
        this.sceneBG = new Scene()
        this.cameraBG =  new PerspectiveCamera(75, el.clientWidth / el.clientHeight, 0.1, 1000)
        this.cameraBG.position.set(0, 0, 7)
        this.cameraBG.lookAt(new Vector3())
        this.rendererBG = new WebGLRenderer({antialias: true, alpha:true})
        this.rendererBG.setClearColor(0xEEEEEE, 0.0)
        this.rendererBG.setPixelRatio( window.devicePixelRatio )
        this.rendererBG.setSize( el.clientWidth, el.clientHeight )
        el.appendChild(this.rendererBG.domElement)
        new TextureLoader().load('/images/compass.png', (texture) => {
            // const compassGeometry = new PlaneGeometry(10, 10, 1)
            const compassGeometry = new CircleGeometry(5, 32)
            const compassMaterial = new MeshBasicMaterial({side: DoubleSide, map: texture})
            const compass = new Mesh(compassGeometry, compassMaterial)
            compassGeometry.translate.call(compassGeometry, 0, 0, 0)
            this.sceneBG && this.sceneBG.add(compass)
        })
    }
    handleRotateMouseDown (e: MouseEvent) {
        this.mouseDown = true
        document.body.addEventListener('mousemove', this.handleRotateMouseMove)
        document.body.addEventListener('mouseup', this.handleRotateMouseUp)
        this.rotate.moveX = this.rotate.startX = e.clientX
        this.rotate.moveY = this.rotate.startY = e.clientY
        this.rotate.startTime = new Date().getTime()
        e.preventDefault()
        e.stopPropagation()
        return false
    }
    handleRotateMouseMove (e: MouseEvent) {
        const offX = e.clientX - this.rotate.moveX
        const offY = e.clientY - this.rotate.moveY
        this.rotate.moveX = e.clientX
        this.rotate.moveY = e.clientY
        this.rotate.x = .1 * offX
        this.rotate.y = .1 * offY
        console.log(this.rotate.x, this.rotate.y)
        this.cube?.rotateOnWorldAxis(new Vector3(0, 1, 0), this.rotate.x / (2 * Math.PI))
        this.cube?.rotateOnWorldAxis(new Vector3(1, 0, 0), this.rotate.y / (2 * Math.PI))
        if (this.cameraBG) {
            this.cameraBG.rotateOnWorldAxis(new Vector3(0, 0, 1), -1 * this.rotate.x / (2 * Math.PI))
        }
        e.preventDefault()
        e.stopPropagation()
        return false
    }
    handleRotateMouseUp (e: MouseEvent) {
        this.mouseDown = false
        if (
            Math.abs(e.clientX) - this.rotate.startX > 2 ||
            Math.abs(e.clientY) - this.rotate.startY > 2 ||
            new Date().getTime() - this.rotate.startTime > 200
        ) {
            e.preventDefault()
            e.stopImmediatePropagation()
            e.stopPropagation()
            this.mouseDown = false
        }
        this.rotate.moveX = 0
        this.rotate.moveY = 0
        this.rotate.startX = 0
        this.rotate.startY = 0
        this.rotate.startTime = 0
        document.body.removeEventListener('mousemove', this.handleRotateMouseMove)
        document.body.removeEventListener('mouseup', this.handleRotateMouseUp)
    }
    initCanvas () {
        const el: HTMLDivElement = this.$refs['modelContainer'] as HTMLDivElement
        const axesHelper = new AxesHelper(6)
        this.scene = new Scene()
        axesHelper.translateX(20)
        axesHelper.translateY(0)
        axesHelper.translateZ(-15)
        // axesHelper.setColors (0xf00, 0x0f0, 0x00f)
        this.scene.add(axesHelper)
        this.camera = new PerspectiveCamera( 75, el.clientWidth / el.clientHeight, 0.1, 1000 )
        this.camera.position.set(30, 0, 0)
        this.camera.lookAt(new Vector3())
        this.camera.up = new Vector3(0, 0, 1)
        // @ts-ignore
        this.camera.updateProjectionMatrix()
        this.renderer = new WebGLRenderer({antialias: true, alpha:true})
        this.renderer.setClearColor(0xEEEEEE, 0.0)
        this.renderer.setPixelRatio( window.devicePixelRatio )
        this.renderer.setSize( el.clientWidth, el.clientHeight )
        this.cube = new Group()
        this.scene.add(this.cube)
        el.addEventListener('click', this.mouseClickHandler)
        this.raycaster = new Raycaster()
        el.appendChild(this.renderer.domElement )
        el.addEventListener('mousedown', this.handleRotateMouseDown)
        el.addEventListener('mousemove', this.mouseMoveHandler)


        {
            const p2 = new Vector3(10, 10, 10)
            const p1 = new Vector3()
            const sphe = new Spherical().setFromVector3(p2.sub(p1))
            const euler = new Euler(0, sphe.theta, sphe.phi, 'XYZ')
            const quaternion = new Quaternion().setFromEuler(euler)
            console.log(sphe, euler, quaternion)
            // this.cube.rotateY(sphe.theta)
            // this.cube.rotateZ(-sphe.phi)
            this.cube.applyQuaternion(quaternion.invert())
            this.rotate.q = quaternion.invert()
        }

        // const ambLight = new AmbientLight( 0xffffff, .8 ) // soft white light
        // this.scene.add(ambLight)
        // const pLight = new PointLight( 0xffffff, 1, 100 );
        // pLight.position.set( 10, 10, 10 )
        // this.scene.add(pLight)
        // const hemLight = new HemisphereLight(0xffffff, 0xC9D2E1, 1)
        // this.scene.add(hemLight)

        // const pLight1 = new PointLight( 0xffffff, 1, 100 )
        // const pLight2 = new PointLight( 0xECF0F8, 1, 100 )
        // const pLight3 = new PointLight( 0x9DAAC2, 1, 100 )
        // pLight1.position.set(0, 0, 20)
        // pLight2.position.set(0, 0, 20)
        // pLight3.position.set(20, 0, 0)
        // this.scene.add(pLight2, pLight3)
        const pLight1 = new PointLight(0xffffff, .8)
        const pLight2 = new PointLight(0xECF0F8, .8)
        const pLight3 = new PointLight(0x9DAAC2, .8)
        pLight1.position.set(0, 20, 20)
        pLight2.position.set(-20, -20, 20)
        pLight3.position.set(20, -20, 20)
        this.scene.add(pLight1, pLight2, pLight3)
        // const spotLight1 = new SpotLight(0xffffff)
        // const spotLight2 = new SpotLight(0xECF0F8)
        // const spotLight3 = new SpotLight(0x9DAAC2)
        // spotLight1.position.set(0, 20, 20)
        // spotLight2.position.set(-20, -20, 20)
        // spotLight3.position.set(20, -20, 20)
        // this.scene.add(spotLight1, spotLight2, spotLight3)

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
            const cornerMaterial = new this.MatClass({color: this.matColor})
            const _geometry = cornerGeometry.clone()
            _geometry.translate.call(_geometry, cornerOffsets[i][0] as number, cornerOffsets[i][1] as number, cornerOffsets[i][2] as number)
            const mesh = new Mesh(_geometry, cornerMaterial)
            mesh.userData.id = cornerOffsets[i][3]
            this.cube.add(mesh)
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
            const edgeMaterial = new this.MatClass({color: this.matColor})
            const _geometry = edgeGeometry.clone()
            _geometry.rotateX(edgeOffsets[i][3] as number)
            _geometry.rotateY(edgeOffsets[i][4] as number)
            _geometry.rotateZ(edgeOffsets[i][5] as number)
            _geometry.translate.call(_geometry, edgeOffsets[i][0] as number, edgeOffsets[i][1] as number, edgeOffsets[i][2] as number)
            const mesh = new Mesh(_geometry, edgeMaterial)
            mesh.userData.id = edgeOffsets[i][6]
            this.cube.add(mesh)
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
            const lineMaterial = new this.MatClass({
                color: this.edgeColor
            })
            const points = [new Vector3( -3.5, 0, 0 ), new Vector3( 3.5, 0, 0 )]
            const _geometry = new BufferGeometry().setFromPoints( points )
            _geometry.rotateX(lineOffsets[i][3] as number)
            _geometry.rotateY(lineOffsets[i][4] as number)
            _geometry.rotateZ(lineOffsets[i][5] as number)
            _geometry.translate.call(_geometry, lineOffsets[i][0] as number, lineOffsets[i][1] as number, lineOffsets[i][2] as number)
            const line = new Line(_geometry, lineMaterial)
            line.userData.id = lineOffsets[i][6]
            this.cube.add(line)
        }
        
        const faceGeometry = new PlaneGeometry(5, 5)
        const faceOffsets: (number|string)[][] = [
            [-3.5, 0, 0, 0, -Math.PI/2, 0, '左', '/images/左.png', 'f_CBB', '/images/左.png'], // 左-前-右-后-顶-底
            [0, 0, 3.5, 0, 0, 0, '前', '/images/前.png', 'f_BBA', '/images/前ee.png'],
            [3.5, 0, 0, 0, Math.PI/2, 0, '右', '/images/右.png', 'f_ABB', '/images/右.png'],
            [0, 0, -3.5, 0, -Math.PI, 0, '后', '/images/后.png', 'f_BBC', '/images/后i.png'],
            [0, 3.5, 0, -Math.PI/2, 0, 0, '顶', '/images/顶.png', 'f_BAB', '/images/顶.png'],
            [0, -3.5, 0, Math.PI/2, 0, 0, '底', '/images/底.png', 'f_BCB', '/images/底.png']
        ]
        for (let i = 0; i < faceOffsets.length; i++) {
            const group = new Group()
            const _geometry = faceGeometry.clone()
            _geometry.rotateX(faceOffsets[i][3] as number)
            _geometry.rotateY(faceOffsets[i][4] as number)
            _geometry.rotateZ(faceOffsets[i][5] as number)
            _geometry.translate(faceOffsets[i][0] as number, faceOffsets[i][1] as number, faceOffsets[i][2] as number)
            const tl = new TextureLoader().load(faceOffsets[i][7] as string, (texture) => {
                const tl2 = new TextureLoader().load(faceOffsets[i][9] as string, (emap) => {
                    const faceMaterial = new this.MatClass({
                        color: 0xffffff,
                        side: DoubleSide,
                        map: texture
                        // ,
                        // blending: CustomBlending,
                        // blendSrc: SrcColorFactor,
                        // blendDst: OneMinusSrcColorFactor,
                        // blendEquation: MaxEquation
                    })
                    faceMaterial.userData.emap = emap
                    faceMaterial.userData.map = texture
                    const mesh = new Mesh(_geometry, faceMaterial)
                    mesh.userData.id = faceOffsets[i][8]
                    this.cube && this.cube.add(mesh)
                })
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
    }

    initStats () {
        const el: HTMLDivElement = this.$refs['modelContainer'] as HTMLDivElement
        this.stats.domElement.style.position = 'absolute';
        this.stats.domElement.style.top = '0px';
        el.appendChild(this.stats.domElement );
    }
    moveCube (dx: number, dy: number) {
        const _dx = dx * .1
        const _dy = dy * .1
        this.cube?.applyQuaternion(new Quaternion().setFromAxisAngle(new Vector3(0, 1, 0), _dx))
        this.cube?.applyQuaternion(new Quaternion().setFromAxisAngle(new Vector3(0, 0, 1), _dy))
    }
    getIntersectMeshes (mouse: Vector2): any[] {
        let intersects: any[] = []
        if (!this.raycaster || !this.camera || !this.scene) {
            return intersects
        }
        const raycaster = this.raycaster
        raycaster.setFromCamera(mouse, this.camera)
        intersects = raycaster.intersectObjects(this.cube && this.cube.children || [])
        return intersects
    }

    mouseMoveHandler (e: MouseEvent) {
        const el = e.target as HTMLElement
        this.cursor = 'default'
        if (!this.raycaster || !this.scene || !this.camera || !this.hoveredObjectList || !el || el != this.renderer?.domElement) return
        const mouse = new Vector2()
        mouse.x = (e.offsetX / el.clientWidth) * 2 - 1
        mouse.y = -(e.offsetY / el.clientHeight) * 2 + 1
        const intersects = this.getIntersectMeshes(mouse)
        this.hoveredObjectList.forEach((obj: THREE.Mesh) => {
            if (obj.material) {
                if (obj.material instanceof Array) {
                    obj.material.forEach((mat: any) => {
                        if ('color' in mat) {
                            mat.color.set(this.matColor)
                        }
                    })
                } else {
                    if ('color' in obj.material) {
                        //@ts-ignore
                        obj.material.color.set(this.matColor)
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
                                        mat.color.set(this.highlightColor)
                                        // mat.map = null
                                        // mat.emissive.set(this.highlightColor)
                                        // mat.emissiveMap = mat.userData.emap
                                    }
                                })
                            } else {
                                if ('color' in intersectedMesh.material) {
                                    // @ts-ignore
                                    intersectedMesh.material.color.set(this.highlightColor)
                                    // intersectedMesh.material.emissive.set(this.highlightColor)
                                    // intersectedMesh.material.emissiveMap = intersectedMesh.material.userData.emap
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
                <p class={styles.title}>{this.title}
                <br/>
                <button onClick={e => this.moveCube(0, -1)}>up</button><button onClick={e => this.moveCube(0, 1)}>down</button>
                <br/>
                <button onClick={e => this.moveCube(-1, 0)}>left</button><button onClick={e => this.moveCube(1, 0)}>right</button>
                </p>
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
        this.scene = undefined
        this.camera = undefined
        this.renderer = undefined
        this.sceneBG = undefined
        this.cameraBG = undefined
        this.rendererBG = undefined
        this.control = undefined
        this.raycaster = undefined
        this.hoveredObjectList = undefined
    }
}
