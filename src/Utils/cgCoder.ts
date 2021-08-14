import { BG_COLOR } from "./config"

const EOF = -1
const REP = 0
const STR = 1
const INV = 2


/**
 * JSS自定的一种Run-Length算法
 *
 * @param {any[]} raw
 * @return {*}  {any[]}
 */


const decodeByBuferr = (raw: Buffer, elementSize: number): Buffer => {
    // console.log(raw)
    var decodeData = Buffer.alloc(0)
    try {
        decodeData = Buffer.alloc(elementSize)
    } catch (error) {

    }

    let raw_length = raw.length
    let decodeLength = 0

    let a = Buffer.alloc(0)
    let x = 0;
    let i = 0;
    while (raw.length - i > 0) {
        let pixel = raw.slice(i, i += 1)[0]
        let condistion = pixel & 0xf0
        let count = 0
        switch (condistion) {
            case 0x00:  //0n 长度为n的字符串
                count = pixel & 0x0f;
                // decodeData = Buffer.concat([decodeData,raw.slice(i,i+=count)])
                raw.copy(decodeData, decodeLength, i, i += count);
                // console.log(decodeData,decodeLength)
                break
            case 0x10: //1n 长度为n*0x100+m的字符串
                count = (pixel & 0x0f) * 0x100 + raw.slice(i, i += 1)[0];
                // decodeData = Buffer.concat([decodeData,raw.slice(i,i+=count)])
                raw.copy(decodeData, decodeLength, i, i += count);
                break
            case 0x20: // 0x2n 第二个字节x，第三个字节y，第四个字节c，代表n*0x10000+x*0x100+y个字符
                count = (pixel & 0x0F) * 0x10000 + raw.slice(i, i += 1)[0] * 0x100 + raw.slice(i, i += 1)[0];
                raw.copy(decodeData, decodeLength, i, i += count);
                // decodeData = Buffer.concat([decodeData,raw.slice(i,i+=count)])
                break
            case 0x80://填充n个X
                count = pixel & 0x0F;
                a = Buffer.alloc(count, raw.slice(i, i += 1)[0])
                a.copy(decodeData, decodeLength);
                // decodeData = Buffer.concat([decodeData,a])
                break
            case 0x90: //填充n*0x100+m个X
                x = raw.slice(i, i += 1)[0]
                count = (pixel & 0x0F) * 0x100 + raw.slice(i, i += 1)[0];
                // a = new Array(count).fill(x)
                a = Buffer.alloc(count, x)
                a.copy(decodeData, decodeLength);
                // decodeData = Buffer.concat([decodeData,a])
                break
            case 0xa0: //填充x*0x10000+y*0x100+z个X
                x = raw.slice(i, i += 1)[0]
                count = (pixel & 0x0F) * 0x10000 + raw.slice(i, i += 1)[0] * 0x100 + raw.slice(i, i += 1)[0];
                a = Buffer.alloc(count, x)
                a.copy(decodeData, decodeLength);
                // decodeData = Buffer.concat([decodeData,a])
                break
            case 0xc0: // 填充n个背景色
                count = pixel & 0x0F;
                a = Buffer.alloc(count, BG_COLOR)
                a.copy(decodeData, decodeLength);
                // decodeData = Buffer.concat([decodeData,a])
                break
            case 0xd0:  // 填充n*0x100+m个背景色
                count = (pixel & 0x0F) * 0x100 + raw.slice(i, i += 1)[0];
                a = Buffer.alloc(count, BG_COLOR)
                a.copy(decodeData, decodeLength);
                // decodeData = Buffer.concat([decodeData,a])
                break
            case 0xe0:  // 填充x*0x10000+y*0x100+z个背景色
                count = (pixel & 0x0F) * 0x10000 + raw.slice(i, i += 1)[0] * 0x100 + raw.slice(i, i += 1)[0];
                a = Buffer.alloc(count, BG_COLOR)
                a.copy(decodeData, decodeLength);
                // decodeData = Buffer.concat([decodeData,a])
                break
            default:
                console.log(`extration is stopped. Bytes remines ${decodeData.length}, total ${raw_length})`)
                console.log(`${decodeData.length} bytes has been extracted.`)
                break
        }
        decodeLength += count
    }
    //console.log(idx,iPos)

    // console.log("decodeLength",elementSize,decodeLength)
    return decodeData;
}

const runLength = (buf: Buffer) => {
    console.log(buf.toJSON().data)
    var encodeBuf = Buffer.alloc(buf.length) //压缩后不应该超过原本的长度
    if (buf.length < 2) return encodeBuf
    var p = 0;
    var p1 = 0;
    const BG_index = 0x0  //背景颜色索引
    let count = 1
    let prev = buf[0]
    let same: { count: number, start: number, end?: number, value: number, type: number }[] = []
    for (p = 1; p < buf.length; p++) {
        const next = buf[p];
        if (prev == next) {
            count++
            continue
        } else {
          
            // if(prev==0){
            //     same.push({ count, start: p - count, end: p, value: prev, type: 0 })
            // }else {
                if(count<3    ){
                    same.push({ count, start: p - count, end: p, value: prev, type: 2 })
                }else{
                    same.push({ count, start: p - count, end: p, value: prev, type: 1 })
                }
            // }
            count = 1;
            prev = next;
        }
    }
    if (count > 0) {//相同的还有两次
    
        // if(prev==0){
        //     same.push({ count, start: p - count, end: p, value: prev, type: 0 })
        // }else {
            if(count<3 ){
                same.push({ count, start: p - count, end: p, value: prev, type: 2 })
            }else{
                same.push({ count, start: p - count, end: p, value: prev, type: 1 })
            }
        // }
    }
    if (same.length > 1) { //去重 合并
        // let diff: { count: number, start: number, end: number, value?: number, type?: number }[] = []
        let diffCount = 0
        let diffIndex = 1
        let diffPrev = same[0]
        let diffNext = same[diffIndex]
        let indexCout = 1
        for (diffIndex; diffIndex < same.length; diffIndex++) {
            diffNext = same[diffIndex];
            if ( diffPrev.type == 2 && diffNext.type == 2 ) {
            // if (diffNext.count == diffPrev.count && diffPrev.count == 1 && diffNext.count == 1 && diffPrev.type != 0 && diffNext.type != 0) {
                diffPrev.count += diffNext.count
                diffCount = diffPrev.count
                indexCout++
                // continue
            } else {
                if (indexCout > 1) {
                    // diff.push({ count: diffCount, start: diffPrev.start, end: diffPrev.start + diffCount, type: 2 })
                     same.splice(diffIndex -indexCout, indexCout, 
                        { count: diffCount, start: diffPrev.start, end: diffPrev.start + diffCount, type: 2, value: diffPrev.value })
                     diffIndex = 1 //重新索引
                }
                diffCount = 0;
                indexCout = 1;
                diffPrev = diffNext
            }
        }

        if (indexCout > 1) {
            //  diff.push({ count: diffCount, start: diffPrev.start, end: diffPrev.start + diffCount, type: 2 })
             same.splice(diffIndex -indexCout, indexCout, 
                { count: diffCount, start: diffPrev.start, end: diffPrev.start + diffCount, type: 2, value: diffPrev.value })
        }
        // console.log({diff})
    }
    //  console.log({same})
 
    same.forEach((item) => {
        const { count, type, start, end, value } = item
            switch (type) {
                case 0:
                case 1:
                    if (count <= 0xf) { //小于16
                        if (value != BG_index) {
                          
                            encodeBuf[p1++] = 0x80 + count
                            encodeBuf[p1++] = value
                        } else {
                            encodeBuf[p1++] = 0xc0 + count
                        }
                    } else if (count <= 0xf * 0x100 + 0xff) { //4090  长度为n*0x100+m的字符串
                        let n = count >> 8 & 0xf
                        let m = count & 0xff
                     
                        if (value != BG_index) {
                            encodeBuf[p1++] = 0x90 + n
                            encodeBuf[p1++] = value
                            encodeBuf[p1++] = m
                        } else {
                            encodeBuf[p1++] = 0xD0 + n
                            encodeBuf[p1++] = m
                        }
                    } else if (count <= 0xf * 0x10000 + 0xff * 0x100 + 0xff) {  //x*0x10000+y*0x100+z
                      
                        let x = count >> 16 & 0xff
                        let y = count >> 8 & 0xff
                        let z = count & 0xff
                        if (value != BG_index) {
                            encodeBuf[p1++] = 0xA0 + x
                            encodeBuf[p1++] = value
                            encodeBuf[p1++] = y
                            encodeBuf[p1++] = z
                        } else {
                            encodeBuf[p1++] = 0xE0 + x
                            encodeBuf[p1++] = y
                            encodeBuf[p1++] = z
                        }
                    }
                    break;
                case 2:
                    if (count <= 0xf) { //填充n个字符串 小于等于15
                        // console.log(count)
                        encodeBuf[p1++] = 0x00 + count
                        buf.copy(encodeBuf, p1++, start, end);
                         p1 += count - 1
                    } else if (count <= 0xf * 0x100 + 0xff) { //填充n*0x100+m个X
                        // console.log(count)
                        let n = count >> 8 & 0xf
                        let m = count & 0xff
                        encodeBuf[p1++] = 0x10 + n
                        encodeBuf[p1++] = m
                        buf.copy(encodeBuf, p1++, start, end);
                        p1 += count - 1
                        
                    } else if (count <= 0xf * 0x10000 + 0xff * 0x100 + 0xff) {//填充x*0x10000+y*0x100+z个X
                        let x = count >> 16 & 0xff
                        let y = count >> 8 & 0xff
                        let z = count & 0xff
                        encodeBuf[p1++] = 0x20 + x
                        encodeBuf[p1++] = y
                        encodeBuf[p1++] = z
                        buf.copy(encodeBuf, p1++, start, end);
                        p1 += count - 1
                       
                    }
                    break;
                default:
                    break;
            }
       
    })

    let data = encodeBuf.slice(0, p1);
    // console.log(data.length,data.toJSON().data)
    return data
}



/**
 * JSS自定的一种Run-Length算法
 * shift 性能低下
 * @param {any[]} raw
 * @return {*}  {any[]}
 */
const decodeImgData = (raw: any[]): any[] => {
    console.log(raw)
    var decodeData: any[] = []
    let raw_length = raw.length
    let count = 0
    let a = []
    let x = 0;

    while (raw.length > 0) {
        let pixel = raw.shift()
        let condistion = pixel & 0xf0

        switch (condistion) {
            case 0x00:  //0n 长度为n的字符串
                count = pixel & 0x0f;
                decodeData = decodeData.concat(raw.splice(0, count))
                break
            case 0x10: //1n 长度为n*0x100+m的字符串
                count = (pixel & 0x0f) * 0x100 + raw.shift();
                decodeData = decodeData.concat(raw.splice(0, count))
                break
            case 0x20: // 0x2n 第二个字节x，第三个字节y，第四个字节c，代表n*0x10000+x*0x100+y个字符
                count = (pixel & 0x0F) * 0x10000 + raw.shift() * 0x100 + raw.shift();
                decodeData = decodeData.concat(raw.splice(0, count))
                break
            case 0x80://填充n个X
                count = pixel & 0x0F;
                a = new Array(count).fill(raw.shift())
                decodeData = decodeData.concat(a)
                break
            case 0x90: //填充n*0x100+m个X
                x = raw.shift()
                count = (pixel & 0x0F) * 0x100 + raw.shift();
                a = new Array(count).fill(x)
                decodeData = decodeData.concat(a)
                break
            case 0xa0: //填充x*0x10000+y*0x100+z个X
                x = raw.shift()
                count = (pixel & 0x0F) * 0x10000 + raw.shift() * 0x100 + raw.shift();
                a = new Array(count).fill(x)
                decodeData = decodeData.concat(a)
                break
            case 0xc0: // 填充n个背景色
                count = pixel & 0x0F;
                a = new Array(count).fill(BG_COLOR)
                decodeData = decodeData.concat(a)
                break
            case 0xd0:  // 填充n*0x100+m个背景色
                count = (pixel & 0x0F) * 0x100 + raw.shift();
                a = new Array(count).fill(BG_COLOR)
                decodeData = decodeData.concat(a)
                break
            case 0xe0:  // 填充x*0x10000+y*0x100+z个背景色
                count = (pixel & 0x0F) * 0x10000 + raw.shift() * 0x100 + raw.shift();
                a = new Array(count).fill(BG_COLOR)
                decodeData = decodeData.concat(a)
                break
            default:
                console.log(`extration is stopped. Bytes remines ${decodeData.length}, total ${raw_length})`)
                console.log(`${decodeData.length} bytes has been extracted.`)
                break
        }
    }
    //console.log(idx,iPos)
    return decodeData;
}

export { decodeImgData, decodeByBuferr, runLength }