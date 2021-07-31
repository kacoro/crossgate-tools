
import fs from 'fs'
import path from 'path'

interface versionDict  {
    [key:string]:string
}
const versionDict:versionDict =  {
    "Graphic_20":"命运的开启者",
    "GraphicEx_4":"龙之沙时计",
    "Graphic_Joy_22":"乐园之卵",
    "GraphicV3_18":"乐园之卵（精灵",
    "GraphicEx_5":"GraphicEx_5",
    "Graphicga_1":"Graphicga_1",
    "GraphicV3_19":"GraphicV3_19",
    "Graphic_66":"Graphic_66",
    "Graphic_Joy_125":"Graphic_Joy_125",
    "Graphic_Joy_CH1":"Graphic_Joy_CH1",
    "Graphic_Joy_EX_62":"Graphic_Joy_EX_62",
    "Graphic_Joy_EX_80":"Graphic_Joy_EX_80"
}
    
export interface versionType {
    name:string,
    realName:string,
    info:string,
    file:string
}
 /**
 *
 *
 * @param {string} binPath
 * @return {*}  {versionType[]}
 */

 
 export const readAllVersion  =  (binPath: string):versionType[] => {
    let readAllVersion:versionType[] = [];
    let suffix = "GraphicInfo";
    let versionPath = path.join(binPath, "bin")
    try {
        let files = fs.readdirSync(versionPath)// 读取目录
        files.forEach((filename) => { // item: 目录和文件名称
            if(filename.includes(suffix)){
                // data = fs.readFileSync(path.join(paletsPath,filename))
                //  console.log(filename)
                 let file = filename.replace("Info","")
                 let name = file.replace(".bin","")
                 console.log(name)
                 readAllVersion.push({
                     name:versionDict[name]||name,
                     realName:name,
                     info:filename,
                     file:file
                 })
            }
             
        })
    } catch (error) {
        alert(error.message+"，请重新选择目录！") 
    }
    console.log(readAllVersion)
    return readAllVersion;
}