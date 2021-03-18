import {ShapeGeometry, Shape, MeshBasicMaterial, Mesh} from 'three'


export class Heart {
    getHeart(): Mesh {
        const x = 0, y = 0;
        const heartShape = new Shape(); // Defines an arbitrary 2d shape plane using paths with optional holes
        heartShape.moveTo( x + 5, y + 5 );
        heartShape.bezierCurveTo( x + 5, y + 5, x + 4, y, x, y );
        heartShape.bezierCurveTo( x - 6, y, x - 6, y + 7,x - 6, y + 7 );
        heartShape.bezierCurveTo( x - 6, y + 11, x - 3, y + 15.4, x + 5, y + 19 );
        heartShape.bezierCurveTo( x + 12, y + 15.4, x + 16, y + 11, x + 16, y + 7 );
        heartShape.bezierCurveTo( x + 16, y + 7, x + 16, y, x + 10, y );
        heartShape.bezierCurveTo( x + 7, y, x + 5, y + 5, x + 5, y + 5 );

        const shapeGeo = new ShapeGeometry(heartShape, 19) // Creates an one-sided polygonal geometry from one or more path shapes.
        const mesh = new Mesh(shapeGeo, new MeshBasicMaterial({
            color: 0xeeb89e
        }))
        return mesh
    }
}
