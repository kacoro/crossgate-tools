import fs from 'fs';
import path from 'path';
import { g_c0_15, g_c240_255, g_palet, transBuffer, arrTrans } from "./config";
export const readPalet = (binPath: string, index: number) => {
    let palet: any
    try {
        palet = fs.readFileSync(path.join(binPath, "bin", "pal", g_palet[index].value))
        palet = palet.slice(0, palet.length - 13 * 3).toJSON().data
        
        palet = [...g_c0_15, ...palet, ...g_c240_255]
        console.log(palet.length)
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
      
        // console.log(palet)
    } catch (error) {
        //弹窗
        console.dir(error.message)
        alert(error.message+"，请重新选择目录！")

    }

    
    return palet;

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
    let files = fs.readdirSync(paletsPath)// 读取目录
        files.forEach((filename, index) => { // item: 目录和文件名称
            if(filename.includes(suffix)){
                let data: any
                console.log(path.join(paletsPath,filename));
                data = fs.readFileSync(path.join(paletsPath,filename))
                data = data.slice(0, data.length - 13 * 3).toJSON().data
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

    return allPalet;
}
