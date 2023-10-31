import * as THREE from 'three'

export const lerpVectors = function (v1, v2, duration = 1000, moves = 100, callback, completeCallback) {
    let alpha = 0
    const _move = function () {
        const v = new THREE.Vector3().lerpVectors(v1, v2, alpha)
        callback && callback(v)
        if (alpha >= 1) {
            completeCallback && completeCallback()
        } else {
            alpha = Math.min(1, (alpha + moves / duration))
            window.requestAnimationFrame(_move)
        }
    }
    _move()
} 
