const fs = require('fs');
const fsExtra = require('fs-extra');
const path = require('path')
const gltfPipeline = require('gltf-pipeline');
const gltfToGlb = gltfPipeline.gltfToGlb
const processGltf = gltfPipeline.processGltf;

const useDraco = true
const options = {
    resourceDirectory: path.resolve('./public/models/gltf/nongkeyuan/bak')
}
if (useDraco) {
    options.compressionLevel = 50
}

let dir = fs.readdirSync(path.resolve('./public/models/gltf/nongkeyuan/bak'))
dir.forEach(filePath => {
    if (filePath.indexOf('.gltf') >= 0) {
        if (useDraco) {
            const gltf = fsExtra.readJsonSync(path.resolve('./public/models/gltf/nongkeyuan/bak', filePath))
            processGltf(gltf, options).then(function(results) {
                fsExtra.writeJsonSync(path.resolve('./public/models/gltf/nongkeyuan/bak', filePath.replace('.gltf', '.draco')), results.gltf)
            }, err => {
                console.log('error:', err)
            })
        } else {
            const gltf = fsExtra.readJsonSync(path.resolve('./public/models/gltf/nongkeyuan/bak', filePath))
            gltfToGlb(gltf, options).then(function(results) {
                fsExtra.writeFileSync(path.resolve('./public/models/gltf/nongkeyuan/bak', filePath.replace('.gltf', '.glb')), results.glb)
            }, err => {
                console.log('error:', err)
            })
        }
    }
})
