
export const deCoder = (raw: any[], len: number) => {
    // console.log(raw)
    let status = 'c'
    let c_counter = 1
    let rle: any[] = []
    let t=0, th=0, letth=0, tl=0
    let raw_length = raw.length
    while (raw.length > 0 || status != 'c') {
        if (status == 'c') {
           
            // 读取命令字
            t = raw.shift()
            
            if (!t)
                th = 15
            else {
                th = Math.floor(t / 16)
                tl = t % 16
            }
            // console.log(`t: ${t},th:${th},tl:${tl}`)
            //  解析命令字： o0～o2，直接拷贝；o8～oA，复制拷贝；oC～oE，透明色拷贝
            if (th == 0) {
                status = "o0"
                c_counter = tl
            } else if (th == 1) {
                status = "o1";
                c_counter = tl * 256
            } else if (th == 2) {
                status = "o2"
                c_counter = tl * 256 * 256
            } else if (th == 8) {
                status = "o8"
                c_counter = tl
            } else if (th == 9) {
                status = "o9"
                c_counter = tl * 0x100
            } else if (th == 0xA) {
                status = "oA"
                c_counter = tl * 0x100 * 0x100
            } else if (th == 0xc) {
                status = "oC";
                c_counter = tl
            } else if (th == 0xd) {
                status = "oD";
                c_counter = tl * 0x100
            } else if (th == 0xe) {
                status = "oE";
                c_counter = tl * 0x100 * 0x100
            } else {
                console.log(`unsupported th:${th} tl:${tl}`)
                status = "e"
            }
        }

        else if (status == "o0") {
            rle = rle.concat(raw.splice(0, c_counter))
            status = "c"
            // console.log("o0",rle)
        }else if (status == "o1") {
            c_counter += raw.shift()
            rle = rle.concat(raw.splice(0, c_counter))
            status = "c"
            // console.log("o1",rle)
        }else if (status == "o2") {
            c_counter = c_counter + raw.shift()*256
            c_counter = c_counter + raw.shift()
            rle = rle.concat(raw.splice(0, c_counter))
            status = "c"
            // console.log("o2",rle)
        }else if (status == "o8") {
            let x = raw.shift()
            let a = new Array(c_counter).fill(x)
            rle = rle.concat(a)
            status = "c"
            // console.log("o8",rle)
        }else if (status == "o9") {
            let x = raw.shift()
            c_counter = c_counter + raw.shift()
            let a = new Array(c_counter).fill(x)
            rle = rle.concat(a)
            status = "c"
            // console.log("o9",rle)
        }else  if (status == "oA") {
            let x = raw.shift()
            c_counter = c_counter + raw.shift()*256
            c_counter = c_counter + raw.shift()
            let a = new Array(c_counter).fill(x)
            rle = rle.concat(a)
            status = "c"
            // console.log("oA",rle)
        }else  if (status == "oC") {
            // 透明色，F0是随便取的，只要是调色板上未使用的编号就可以
            let a = new Array(c_counter).fill(0x00) 
            rle =rle.concat(a)
            status = "c"
            // console.log("oC",rle)
        }else  if (status == "oD") {
            c_counter = c_counter + raw.shift()
            let a = new Array(c_counter).fill(0x00) 
            rle = rle.concat(a)
            status = "c"
            // console.log("oD",rle)
        }else  if (status == "oE") {
            c_counter = c_counter + raw.shift() * 256
            c_counter = c_counter + raw.shift()
            let a =new Array(c_counter).fill(0x00) 
            rle = rle.concat(a)
            // console.log("oE",rle)
            status = "c"
        }else{
            console.log(`extration is stopped. Bytes remines ${rle.length}, total ${raw_length})`)
            console.log(`${rle.length} bytes has been extracted.`)
            break
        }
      
    }
    // console.log(rle)
    return {idx:rle.length, _imgData:rle}
}
