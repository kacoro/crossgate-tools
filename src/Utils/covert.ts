const maxHex = 0xffffffff //4294967295, 4g
const minHex = 0x00000000


/**
 * 字节数组转int  
 *
 * @param {Uint8Array} palet
 * @param {boolean} [signed=false]
 * @return {*}  {number}
 */
function bytes2Int(palet: Uint8Array, signed = false): number {
    let str = ""
    let int = 0
    let maxStr = "0x"

    palet.reverse().forEach((item) => {
        str += item.toString(2)
        maxStr += "ff"
    })
    let max = parseInt(maxStr,16)
    if (str.slice(0, 1) == "1" && signed) {//首位是1 为负数
        // let int = palet[0] * (1 << 24) + palet[1] * (1 << 16) + palet[2] * (1 << 8) + palet[3]
       
        palet = palet.reverse()
        palet.forEach((item:number,index:number)=>{
            int += item * (1 << (8*index)) 
        })
       
        let hex = max - int + 1;
        int = checkBoundary(hex, max)
        return -int
    } else {
        // let int = palet[0] * (1 << 24) + palet[1] * (1 << 16) + palet[2] * (1 << 8) + palet[3]
        // 256 1 << 8 256 *  256 * 256相当于 1<<16 256 * 256 * 256相当于 1<<24 
        palet = palet.reverse()
        palet.forEach((item:number,index:number)=>{
            int += item * (1 << (8*index)) 
        })
         int = checkBoundary(int, max )
        return int
    }
}




/**
 * int 转 字节数组
 *
 * @param {*} num
 * @return {*} 
 */
 function int2bytes(num: number,length=4): Uint8Array { //默认是4个字节
    let bytes = new Uint8Array(length);
    let maxStr = "0x"
    let minStr = "0x"
    bytes.forEach(()=>{
        maxStr += "ff"
        minStr += "00"
    })
    let max = parseInt(maxStr,16)
    let min = parseInt(minStr,16)
    let hex: number
    if (num < 0) {
       
        hex = max - num + 1;
         num = checkBoundary(hex,2*max-Math.pow(256,length-1)+2) //num不能超过max -256
        bytes = bytes.map((_item:number,i:number)=>{
            return 256 - hex  /  (1<<(8*i)) % 256
        })
    } else {
        hex = min + num;
        hex = checkBoundary(hex, max)
        bytes = bytes.map((_item:number,i:number)=>{
            return hex / (1<<(8*i)) % 256
        })
    }
    return bytes
}

/**
 * 检测数字是否越界，如果越界给出提示
 * @param {*number} num 输入数
 */
function checkBoundary(num: number, safe_number: number) {
    if (num > safe_number) {
        console.warn(`${num} is beyond boundary when transfer to integer, the results may not be accurate`);
        return safe_number
    } else {
        return num
    }
}


export { bytes2Int, int2bytes }
export default { bytes2Int, int2bytes }