import fs,{createReadStream} from 'fs';
import path from 'path';
const { dialog } = require('electron').remote;
import { g_c0_15, g_c240_255, g_palet, arrTrans } from "./config";
import { PaletsType } from '../Store/reduce';
import { readStream } from './steam'
export const readPalet = (binPath: string, index: number) => {
    let palet: any
    try {
        palet = fs.readFileSync(path.join(binPath, "bin", "pal", g_palet[index].value))
        
        palet = palet.slice(0, palet.length - 12 * 3).toJSON().data
        
        palet = [...g_c0_15, ...palet, ...g_c240_255]
        // console.log(palet.length)
        palet = arrTrans(3, palet)
        palet = palet.map((item:any | any[])=>{
            return item.reverse();
        });
        
        // let palet0_15 = arrTrans(3, g_c0_15)
        //  palet0_15 = palet0_15.map((item:any | any[])=>{
        //     return item.reverse();
        // });
        // let palet240_255 = arrTrans(3, g_c240_255)
        //  palet240_255 = palet240_255.map((item:any | any[])=>{
        //     return item.reverse();
        // });
        // palet = arrTrans(3, palet)
        // palet = palet.map((item:any | any[])=>{
        //     return item.reverse();
        // });
        // palet = [...palet0_15, ...palet, ...palet240_255]
      
        //  console.log(palet)
    } catch (error) {
        //弹窗
        console.dir(error.message)
        alert(error.message+"，请重新选择目录！")
    }
    return palet;
}

interface infoType {
    [key: string]: any
}

//获取隐藏调色版
export const getHiddenPalet = async (binPath: string, infoJson: infoType) =>{
     //也许所有的图片都是从V3_拿的，比如V2的也是暂时不处理
     let { ddr, length } = infoJson
    //  console.log(length%3)
    //  console.log(binPath)
     let paletStream = createReadStream(binPath, { start: ddr -20,end: ddr + length-1})
    
     let paletBuffer = await readStream(paletStream)
    //  console.log(paletBuffer)
     let palet =  paletBuffer.toJSON().data
    
     
     let hiddenPalet:any = arrTrans(3,palet)
     let m = hiddenPalet[hiddenPalet.lenght] % 3
     for (let index = 0; index <m ; index++) {
        palet.push(0)
     }
    //  hiddenPalet = hiddenPalet.map((item: any[]) => {
    //     return item.reverse();
    //  });
     return hiddenPalet
}
//获取隐藏调色版
export const getHiddenPaletInfo = async (binPath: string, infoJson: infoType) =>{
    //也许所有的图片都是从V3_拿的，比如V2的也是暂时不处理
    // let AllPalet = []
    // const hinddenStream = createReadStream(path.join(versionPath,filename), { start: 3840*40 })
    // return AllPalet
}
export interface paletType  {
    name:string
    path?:string
    data:any
}

export const readAllPalet  =  (binPath: string):paletType[] => {
    let allPalet:paletType[] = [];
    let suffix = ".cgp";
    let paletsPath = path.join(binPath, "bin", "pal")
    try {
        let files = fs.readdirSync(paletsPath)// 读取目录
        files.forEach((filename, index) => { // item: 目录和文件名称
            if(filename.includes(suffix)){
                let data: any
                data = fs.readFileSync(path.join(paletsPath,filename))
                // console.log(data)
                // data = data.slice(0, data.length - 12 * 3).toJSON().data
                data = data.slice(0, data.length - 12 * 3).toJSON().data
                data = [...g_c0_15, ...data, ...g_c240_255]
                data = arrTrans(3, data)
                data = data.map((item:any | any[])=>{
                    return item.reverse();
                });
                allPalet.push({
                    name:filename.replace(suffix,""),
                    data:data
                })
            }
             
        })
    } catch (error) {
        alert(error.message+"，请重新选择目录！") 
    }
    // console.log(allPalet)
    return allPalet;
}




export const SavePalet = (palet: PaletsType[]  ) =>{
    palet = palet.map((item)=>{
        return item.reverse();
    });
    palet =  palet.slice(16, palet.length - 16 + 13)
    let flatPalet =  palet.reduce((acc, val) => acc.concat(val), []);
    
    dialog.showSaveDialog({
        title:'保存文件',
    }).then((res)=>{
        fs.writeFileSync(res.filePath,Buffer.from(flatPalet))
    }).catch((req)=>{
        console.log(req)
    })
}

