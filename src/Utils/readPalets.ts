import fs from 'fs';
import path from 'path';
import { g_c0_15, g_c240_255, g_palet, transBuffer, arrTrans } from "./config";
export const readPalet = (binPath: string, index: number) => {
    let palet: any
    try {
        palet = fs.readFileSync(path.join(binPath, "bin", "pal", g_palet[index].value))
        palet = palet.slice(0, palet.length - 13 * 3).toJSON().data
        palet = [...g_c0_15, ...palet, ...g_c240_255]

        palet = arrTrans(3, palet)
        palet = palet.map((item:any | any[])=>{
            return item.reverse();
        });
    } catch (error) {
        //弹窗
        console.dir(error.message)
        alert(error.message+"，请重新选择目录！")

    }

    
    return palet;

}
