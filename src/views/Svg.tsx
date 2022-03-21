import { Vue, Prop, Component, Watch } from 'vue-property-decorator'
import {Scene, BufferGeometry, Vector3, DoubleSide, Color, WebGLRenderer, Float32BufferAttribute, LineBasicMaterial, Line, LineDashedMaterial, BoxGeometry, SphereGeometry, MeshBasicMaterial, MeshStandardMaterial, Mesh, Group, AmbientLight, HemisphereLight, ArrowHelper} from 'three'

import { PerspectiveCamera } from 'three'
// import { OrthographicCamera } from 'three'
// import { Shape, ExtrudeGeometry } from 'three'
// import { SphereGeometry } from 'three'
// import { CylinderGeometry } from 'three'
import { CircleGeometry } from 'three'
// import { Shape } from 'three'
import styles from './Svg.module.scss'
import { GLTF, GLTFLoader } from '../../public/three/examples/jsm/loaders/GLTFLoader.js'
import { DRACOLoader } from '../../public/three/examples/jsm/loaders/DRACOLoader.js'
// import { MapControls } from '../../public/three/examples/jsm/controls/OrbitControls.js'
import { OrbitControls } from '../../public/three/examples/jsm/controls/OrbitControls.js'
// import { TrackballControls } from '../../public/three/examples/jsm/controls/TrackballControls.js'
import { SVGRenderer, SVGObject } from '../../public/three/examples/jsm/renderers/SVGRenderer'
// import { CSS3DRenderer, CSS3DObject } from '../../public/three/examples/jsm/renderers/CSS3DRenderer'
// import { CSS2DRenderer, CSS2DObject } from '../../public/three/examples/jsm/renderers/CSS2DRenderer.js'
@Component
export default class TestComponent extends Vue {
    @Prop({ default: 'Hello World' }) readonly title!: string
    scene?: THREE.Scene
    camera?: THREE.Camera
    renderer?: SVGRenderer
    ambientLight?: THREE.AmbientLight
    control?: OrbitControls

    stations = [
        {   
            id: 1,
            name: '鱼嘴站',
            type: 'station',
            coords: [0,0,0],
            label: {
                show: true
            }
        },
        {
            id: 2,
            name: '鱼嘴站2',
            type: 'station',
            coords: [10,0,-10],
            label: {
                show: true
            }
        },
        {
            id: 3,
            name: '鱼嘴站3',
            type: 'station',
            coords: [20,0,-20],
            label: {
                show: true
            }
        },
        {
            id: 4,
            name: '鱼嘴站4',
            type: 'station',
            coords: [30,0,-30],
            label: {
                show: true
            }
        },
        {
            id: 5,
            name: '鱼嘴站5',
            type: 'station',
            coords: [50,0,-50],
            label: {
                show: true
            }
        },
        {
            id: 6,
            name: '鱼嘴站6',
            type: 'station',
            coords: [70,0,-30],
            label: {
                show: true
            }
        },
        {
            id: 7,
            name: '鱼嘴站7',
            type: 'station',
            coords: [90,0,0],
            label: {
                show: true
            }
        }
    ]
    passCount = 20
    mouseMovePosition = {
        offX: 0,
        offY: 0
    }
    zoomFactor = {
        x: 0,
        y: 0
    }

    initCanvas () {
        const el: HTMLDivElement = this.$refs['modelContainer'] as HTMLDivElement
        this.scene = new Scene()
        this.camera = new PerspectiveCamera( 75, el.clientWidth / el.clientHeight, 0.1, 1000 )
        // this.camera = new OrthographicCamera(-100, 100, 100, -100, 1, 1000)
        this.camera.position.set(0, 100, 0)
        this.camera.lookAt (0, 0, 0) 
        // this.renderer = new WebGLRenderer()
        this.renderer = new SVGRenderer()
        this.renderer.setClearColor(new Color(0x3A4045), 1)
        // this.renderer.setPixelRatio(window.devicePixelRatio)
        this.renderer.setSize(el.clientWidth, el.clientHeight)
        el.appendChild( this.renderer.domElement )

        // const el2: HTMLDivElement = this.$refs['cssRendererContainer'] as HTMLDivElement
        // const vertices = []
        // const divisions = 50
        // for (let i = 0; i <= divisions; i ++) {
        //     const v = ( i / divisions ) * ( Math.PI * 2 )
        //     const x = Math.sin(v)
        //     const z = Math.cos(v)
        //     vertices.push(x, 0, z)
        // }
        // const geometry = new BufferGeometry()
        // geometry.setAttribute( 'position', new Float32BufferAttribute(vertices, 3))
        // for ( let i = 1; i <= 3; i ++ ) {
        //     const material = new LineBasicMaterial({
        //         color: Math.random() * 0xffffff,
        //         linewidth: 10
        //     })
        //     const line = new Line(geometry, material)
        //     line.scale.setScalar(i / 3)
        //     this.scene.add(line)
        // }
        // const material = new LineDashedMaterial({
        //     color: 'blue',
        //     linewidth: 1,
        //     dashSize: 10,
        //     gapSize: 10
        // })
        // const line = new Line(geometry, material)
        // line.scale.setScalar(2)
        // this.scene.add(line)

        // 画地铁图
        const verticesStation = []
        
        for (let i = 0; i < this.stations.length; i++) {
            const coor = this.stations[i].coords
            verticesStation.push(coor[0], 0, coor[2])

            // 1. 圆柱体
            // const stationGeo = new CylinderGeometry(1,1,2,32)
            // const stationMat = new MeshBasicMaterial({color: 0xffffff})
            // const station = new Mesh(stationGeo, stationMat)
            // station.renderOrder = 100
            // station.position.x = coor[0]
            // station.position.z = coor[2]
            // stationGeo.scale(0.2, 0.2, 0.2)
            // this.scene.add(station)

            // 2.圆形 Mesh
            // const stationGeo = new CircleGeometry(1, 32)
            // const stationMat = new MeshBasicMaterial({color: 0xffffff, side: DoubleSide})
            // const station = new Mesh(stationGeo, stationMat)
            // station.renderOrder = 100
            // station.position.x = coor[0]
            // station.position.y = 0.1
            // station.position.z = coor[2]
            // stationGeo.rotateX(-.5*Math.PI)
            // stationGeo.scale(0.2, 0.2, 0.2)
            // this.scene.add(station)

            // 3. 挤出
            // const shape = new Shape()
            // shape.moveTo(0,0)
            // shape.arc(0, 0 , Math.PI * 2, 0, Math.PI*2) 
            // const extrudeSettings = {
            //     steps: 2,
            //     depth: 16,
            //     bevelEnabled: true,
            //     bevelThickness: 1,
            //     bevelSize: 1,
            //     bevelOffset: 0,
            //     bevelSegments: 1
            // }
            // const stationGeo = new ExtrudeGeometry(shape, extrudeSettings)
            // const stationMat = new MeshBasicMaterial({color: 0xffffff, side: DoubleSide})
            // const station = new Mesh(stationGeo, stationMat)
            // station.renderOrder = 100
            // station.position.x = coor[0]
            // station.position.y = 0
            // station.position.z = coor[2]
            // stationGeo.rotateX(-.5*Math.PI)
            // stationGeo.scale(0.1, 0.1, 0.1)
            // this.scene.add(station)

            // 4.原生svg
            const circleNode = document.createElementNS( 'http://www.w3.org/2000/svg', 'circle' )
            // circleNode.setAttribute('cx', String(coor[0]))
            // circleNode.setAttribute('cy', String(coor[1]))
            circleNode.setAttribute('r', '5')
            circleNode.setAttribute('fill', '#fff')
            circleNode.setAttribute('stroke-width', '0')
            const circleObject = new SVGObject(circleNode) as THREE.Object3D;
            circleObject.position.x = coor[0]
            circleObject.position.y = 0
            circleObject.position.z = coor[2]
            circleObject.userData.id = this.stations[i].id
            circleObject.renderOrder = 100
            circleObject.frustumCulled = false
            this.scene.add(circleObject)

            // 站点标签 原生svg
            const groupNode = document.createElementNS( 'http://www.w3.org/2000/svg', 'g' )
            const textNode = document.createElementNS( 'http://www.w3.org/2000/svg', 'text' )
            textNode.setAttribute('style', 'fill:#fff;font-size:12px;font-weight:bold;text-anchor: middle;')
            textNode.textContent = this.stations[i].name
            groupNode.appendChild(textNode)

            const object = new SVGObject(groupNode) as THREE.Object3D;
            object.position.x = coor[0]
            object.position.y = 0
            object.position.z = coor[2]
            let angle
            if (i == this.stations.length - 1) {
                angle = Math.atan2(this.stations[i].coords[2] - this.stations[i-1].coords[2], this.stations[i].coords[0] - this.stations[i-1].coords[0])
                console.log('a', angle)
            } else if (i == 0) {
                angle = Math.atan2(this.stations[i + 1].coords[2] - this.stations[i].coords[2], this.stations[i + 1].coords[0] - this.stations[i].coords[0])
                console.log('a', angle)
            } else {
                angle = Math.atan2(this.stations[i+1].coords[2] - this.stations[i-1].coords[2], this.stations[i+1].coords[0] - this.stations[i-1].coords[0])
                console.log('a', angle)
            }
            console.log(angle * 180 / Math.PI)
            textNode.setAttribute('transform', `rotate(${angle * 180 / Math.PI} ${coor[0]}, ${coor[2]})`)
            object.frustumCulled = false
            this.scene.add(object)

            // 站点标签 css2d,css3d
            // const labelEl = document.createElement('div') // transform对行内元素无效！！
            // labelEl.innerHTML = this.stations[i].name
            // labelEl.className = 'staionLabel'
            // let styleStr ='color:#fff;font-size:12px;font-weight:bold;'
            // labelEl.style = styleStr
            // let angle
            // if (i == this.stations.length - 1) {
            //     console.log(1, this.stations[i].coords[2], this.stations[i-1].coords[2], this.stations[i].coords[0], this.stations[i-1].coords[0])
            //     angle = Math.atan2(this.stations[i].coords[2] - this.stations[i-1].coords[2], this.stations[i].coords[0] - this.stations[i-1].coords[0])
            //     console.log('a', angle)
            // } else if (i == 0) {
            //     console.log(2, this.stations[i + 1].coords[2], this.stations[i].coords[2], this.stations[i + 1].coords[0], this.stations[i].coords[0])
            //     angle = Math.atan2(this.stations[i + 1].coords[2] - this.stations[i].coords[2], this.stations[i + 1].coords[0] - this.stations[i].coords[0])
            //     console.log('a', angle)
            // } else {
            //     console.log(3, this.stations[i+1].coords[2], this.stations[i-1].coords[2], this.stations[i+1].coords[0], this.stations[i-1].coords[0])
            //     angle = Math.atan2(this.stations[i+1].coords[2] - this.stations[i-1].coords[2], this.stations[i+1].coords[0] - this.stations[i-1].coords[0])
            //     console.log('a', angle)
            // }
            // const labelObj = new CSS3DObject(labelEl)
            // labelObj.userData.id = this.stations[i].id
            // // labelObj.position.set(station.position.x, station.position.y, station.position.z)
            // labelObj.rotateX(-Math.PI/2)
            // // labelObj.rotateY(angle)
            // console.log(123, labelObj)
        }
        const geometryStation = new BufferGeometry()
        geometryStation.setAttribute('position', new Float32BufferAttribute(verticesStation, 3))

        /*
        * 关于linecap 和 linejoin
        * https://blog.csdn.net/ssisse/article/details/52217082
        */
        const metroMaterial = new LineBasicMaterial({
            color: 0x0071BB,
            linewidth: 10,
            linecap: 'round', // round,butt,square 线端点的线帽
            linejoin: 'round' // round,bevel,miter 一条线段末尾和另一条线段开始如何衔接？
        })
        const metroLine = new Line(geometryStation, metroMaterial)
        metroLine.renderOrder = 10
        metroLine.frustumCulled = false
        this.scene.add(metroLine)



        const animate = () => {
            if (this.passCount) {
                requestAnimationFrame( animate )
            }
            // this.passCount--
            if (this.scene && this.camera) {
                if (this.renderer) {
                    this.renderer.render(this.scene, this.camera)
                }
            }
        }
        animate();
    }

    initControls () {
        // if (this.camera && this.renderer) {
        //     this.control = new OrbitControls(this.camera, this.renderer.domElement)
        // }
        const svg = this.renderer && this.renderer.domElement
        if (!svg) return
        this.zoomFactor = {
            x: svg.clientWidth,
            y: svg.clientHeight
        }
        svg.addEventListener('mousedown', this.handleSvgMouseDown)
        svg.addEventListener('mousewheel', this.handleSvgMouseWheel)
    }

    handleSvgMouseDown (e: MouseEvent) {
        document.body.addEventListener('mousemove', this.handleSvgMouseMove)
        document.body.addEventListener('mouseup', this.handleSvgMouseUp)
        this.mouseMovePosition = {
            offX: e.clientX,
            offY: e.clientY
        }
    }

    handleSvgMouseMove (e: MouseEvent) {
        const offX = e.clientX - this.mouseMovePosition.offX
        const offY = e.clientY - this.mouseMovePosition.offY
        const svg = this.renderer && this.renderer.domElement
        if (!svg) return
        this.mouseMovePosition = {
            offX: e.clientX,
            offY: e.clientY
        }
        const vbx = svg.getAttributeNS(null, 'viewBox')
        if (!vbx) return
        const vbxArr: string[] = vbx && vbx.split(' ')
        vbxArr[0] = vbxArr[0] * 1 - offX * this.zoomFactor.x / svg.clientWidth
        vbxArr[1] = vbxArr[1] * 1 - offY * this.zoomFactor.y / svg.clientHeight
        svg.setAttributeNS(null, 'viewBox', vbxArr.join(' '))

    }

    handleSvgMouseUp (e: MouseEvent) {
        document.body.removeEventListener('mousemove', this.handleSvgMouseMove)
        document.body.removeEventListener('mouseup', this.handleSvgMouseUp)
        this.mouseMovePosition = {
            offX: 0,
            offY: 0
        }
    }

    handleSvgMouseWheel (e: MouseWheelEvent) {
        const isZoom = e.deltaY < 0
        const svg = this.renderer && this.renderer.domElement
        const vbx = svg && svg.getAttributeNS(null, 'viewBox')
        if (!vbx || !svg) return
        const vbxArr: any[] = vbx.split(' ')
        const steps = 1
        let offX: number = vbxArr[0] * 1
        let offY: number = vbxArr[1] * 1
        const curW = vbxArr[2] * 1
        const curH = vbxArr[3] * 1
        if (isZoom) {
            this.zoomFactor.x = Math.max(curW - 2 * steps, 0)
            this.zoomFactor.y = Math.max(curH - 2 * steps, 0)
            if (this.zoomFactor.x <= svg.clientWidth * 0.75) {
                this.zoomFactor.x = svg.clientWidth * 0.75
                this.zoomFactor.y = svg.clientHeight * 0.75
            } else {
                offX += steps
                offY += steps
            }
        } else {
            this.zoomFactor.x = Math.max(curW + 2 * steps, 0)
            this.zoomFactor.y = Math.max(curH + 2 * steps, 0)
            if (this.zoomFactor.x >= svg.clientWidth * 2) {
                this.zoomFactor.x = svg.clientWidth * 2
                this.zoomFactor.y = svg.clientHeight * 2
            } else {
                offX -= steps
                offY -= steps
            }
        }

        const viewBox = `${offX} ${offY} ${this.zoomFactor.x} ${this.zoomFactor.y}`
        svg.setAttributeNS(null, 'viewBox', viewBox)
    }

    mounted () {
        this.initCanvas()
        this.initControls()
    }
 
    render () {
        return (
            <div class={styles.wrap}>
                <p class={styles.title}>{this.title}</p>
                <div class={styles.model}>
                    <div ref="modelContainer" class={styles.webglRenderer}></div>
                    {/* <div ref="cssRendererContainer"  class={styles.cssRenderer}></div> */}
                </div>
            </div>
        )
    }

    beforeDestroy () {
        // this.renderer && this.renderer.dispose()
        this.control && this.control.dispose()
        this.scene = undefined
        this.camera = undefined
        this.renderer = undefined
        this.ambientLight = undefined
        this.control = undefined
    }
}
