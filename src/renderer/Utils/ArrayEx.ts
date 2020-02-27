export function sampling(array: Float32Array, length: number) {
    if(array.length==length) return array
    let ret = new Float32Array(length).fill(0)
    const step = array.length / length
    for (let i = 0; i < length; i++) {
        for (let j = i * step; j < (i + 1) * step; j++) {
            ret[i] += array[j]
        }
        ret[i] /= step
    }
    return ret
}

export function historySampling(history: Array<Float32Array>, array: Float32Array, max: number) {
    if (max <= 1) return array
    while (history.length > max) {
        history.shift()
    }
    history.push(array)
    let ret = new Float32Array(array.length).fill(0)
    for (let i = 0; i < array.length; i++) {
        for (let j = 0; j < history.length; j++) {
            ret[i] += history[j][i]
        }
        ret[i] /= history.length
    }
    return ret
}