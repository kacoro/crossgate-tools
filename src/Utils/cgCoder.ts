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


 const decodeByBuferr = (raw: Buffer,elementSize:number): Buffer => {
    console.log(raw)
    var decodeData = Buffer.alloc(elementSize)
    let raw_length = raw.length
    let decodeLength = 0
    
    let a = Buffer.alloc(0)
    let x = 0;
    let i = 0;
    while (raw.length -i> 0) {
        let pixel = raw.slice(i,i+=1)[0]
        let condistion = pixel & 0xf0
        let count = 0
        switch (condistion) {
            case 0x00:  //0n 长度为n的字符串
                count = pixel & 0x0f;
                // decodeData = Buffer.concat([decodeData,raw.slice(i,i+=count)])
                 raw.copy(decodeData,decodeLength,i,i+=count);
                // console.log(decodeData,decodeLength)
                break
            case 0x10: //1n 长度为n*0x100+m的字符串
                count = (pixel & 0x0f) * 0x100 + raw.slice(i,i+=1)[0];
                // decodeData = Buffer.concat([decodeData,raw.slice(i,i+=count)])
                raw.copy(decodeData,decodeLength,i,i+=count);
                break
            case 0x20: // 0x2n 第二个字节x，第三个字节y，第四个字节c，代表n*0x10000+x*0x100+y个字符
                count = (pixel & 0x0F) * 0x10000 + raw.slice(i,i+=1)[0] * 0x100 + raw.slice(i,i+=1)[0];
                raw.copy(decodeData,decodeLength,i,i+=count);
                // decodeData = Buffer.concat([decodeData,raw.slice(i,i+=count)])
                break
            case 0x80://填充n个X
                count = pixel & 0x0F;
                a = Buffer.alloc(count,raw.slice(i,i+=1)[0])
                a.copy(decodeData,decodeLength);
                // decodeData = Buffer.concat([decodeData,a])
                break
            case 0x90: //填充n*0x100+m个X
                x = raw.slice(i,i+=1)[0]
                count = (pixel & 0x0F) * 0x100 + raw.slice(i,i+=1)[0];
                // a = new Array(count).fill(x)
                a = Buffer.alloc(count,x)
                a.copy(decodeData,decodeLength);
                // decodeData = Buffer.concat([decodeData,a])
                break
            case 0xa0: //填充x*0x10000+y*0x100+z个X
                x = raw.slice(i,i+=1)[0]
                count = (pixel & 0x0F) * 0x10000 + raw.slice(i,i+=1)[0] * 0x100 + raw.slice(i,i+=1)[0];
                a = Buffer.alloc(count,x)
                a.copy(decodeData,decodeLength);
                // decodeData = Buffer.concat([decodeData,a])
                break
            case 0xc0: // 填充n个背景色
                count = pixel & 0x0F;
                a = Buffer.alloc(count,BG_COLOR)
                a.copy(decodeData,decodeLength);
                // decodeData = Buffer.concat([decodeData,a])
                break
            case 0xd0:  // 填充n*0x100+m个背景色
                count = (pixel & 0x0F) * 0x100 + raw.slice(i,i+=1)[0];
                a = Buffer.alloc(count,BG_COLOR)
                a.copy(decodeData,decodeLength);
                // decodeData = Buffer.concat([decodeData,a])
                break
            case 0xe0:  // 填充x*0x10000+y*0x100+z个背景色
                count = (pixel & 0x0F) * 0x10000 + raw.slice(i,i+=1)[0] * 0x100 + raw.slice(i,i+=1)[0];
                a = Buffer.alloc(count,BG_COLOR)
                a.copy(decodeData,decodeLength);
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
    
    console.log("decodeLength",elementSize,decodeLength)
    return decodeData;
}


/**
 * JSS自定的一种Run-Length算法
 *
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

export {decodeImgData,decodeByBuferr}


export const deCodertest = (data:any[], elementSize: number,count:number = 0 ) => {

    console.log("data:",data)
    let pattern
    let i;
    let szRead, szRequire;
    let repeat = 0
    let value = 0
    let iptr = 0;
    let imageData: any[] = []
    // return { idx:i, _imgData:imageData }
    const memset = (target:string|any[],str:string|number,count:number) =>{ 
        for(let i=0;i<count;i++){
            if(typeof target == "object")
            target.push(str)
            else{
                target += str 
            }
        }
        
    }
    const doReadLength = (data: number,base: number, size: number) => {
        let c;
        for (let i = 0; i < size; ++i)
        {
            c = readByte(data);
    
            if (EOF == c) {
                pattern = INV;
                return 0;
            }
    
            base = (base << 8) | c;
        }
        return base;
    }

    const doDataForward = () => {
        let lo, hi, fn;
        let c =  readByte(data[iptr]);
    
        if (c == EOF) {
            pattern = INV;
            return;
        }
    
        lo = (c & 0x0f);
        hi = (c & 0x30) >> 4;
        fn = (c & 0xc0);
        console.log("c:",c)
        console.log("fn:",fn)
        console.log("0xc0:",0x00,0x80,0xc0)
        switch (fn) {
            case 0x00:
                pattern = STR;
                value = 0;
                break;
    
            case 0x80:
                pattern = REP;
                value = readByte(data[iptr]);
                break;
    
            case 0xc0:
                pattern = REP;
                value = 0;
                break;
    
            default:
                pattern = INV;
                break;
        }
    
        if (EOF == value)
            pattern = INV;
    
        if (INV != pattern)
            repeat = doReadLength(data[iptr],lo, hi);
          
    }

    
 
    for (i = 0; i < count; ++i) {
        szRequire = elementSize;
       
        while (szRequire) {
            
            if (!repeat)
                doDataForward();
            szRead = Math.min(repeat, szRequire);
            console.log(szRead)
            if (szRead) {
                switch (pattern) {
                    case REP:
                        memset(imageData, value, szRead);
                        break;

                    case STR:
                        if (1 != readByte(data[iptr]))
                            pattern = INV;
                        break;
                }
                if (INV == pattern)
                    return { idx:i, _imgData:imageData };
                
                iptr += szRead;
                repeat -= szRead;
                szRequire -= szRead;
            }
        }
    }
    
    //  return i;
    console.log(imageData)
    return { idx:iptr, _imgData:imageData };
}




function readByte(data: number){
    if (!data)
        return EOF;
    return data;
}