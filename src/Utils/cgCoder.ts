const EOF = -1
const REP = 0
const STR = 1
const INV = 2
export const deCoder = (data:any[], elementSize: number,count:number = 0 ) => {

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