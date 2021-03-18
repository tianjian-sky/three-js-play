import { PlaneGeometry, MeshBasicMaterial, Mesh } from 'three'


export class Ground {
    getGround(): Mesh {
        const geo = new PlaneGeometry(500, 500)
        geo.rotateX(-.5 * Math.PI)
        const mesh = new Mesh(geo, new MeshBasicMaterial({
            color: 0xccc
        }))
        return mesh
    }
}
