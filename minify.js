const fs = require('fs');
const fsExtra = require('fs-extra');
const path = require('path')
const gltfPipeline = require('gltf-pipeline');
const gltfToGlb = gltfPipeline.gltfToGlb

const useDraco = false
const options = {
    resourceDirectory: path.resolve('./public/models/gltf/nongkeyuan/bak')
}
if (useDraco) {
    options.compressionLevel = 10
}

let dir = fs.readdirSync(path.resolve('./public/models/gltf/nongkeyuan/bak'))
dir.forEach(filePath => {
    console.log(123, filePath, ['.gltf'].includes(filePath))
    if (filePath.indexOf('.gltf') >= 0) {
        const gltf = fsExtra.readJsonSync(path.resolve('./public/models/gltf/nongkeyuan/bak', filePath))
        gltfToGlb(gltf, {
            resourceDirectory: path.resolve('./public/models/gltf/nongkeyuan/bak')
        }).then(function(results) {
            fsExtra.writeFileSync(path.resolve('./public/models/gltf/nongkeyuan/bak', filePath.replace('.gltf', useDraco? '.draco' : '.glb')), results.glb)
        }, err => {
            console.log('error:', err)
        })
    }
})
