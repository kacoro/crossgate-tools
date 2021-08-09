
import fs from 'fs'
import path from 'path'

interface versionDict  {
    [key:string]:string
}
const versionDict:versionDict =  {
    "20":"命运的开启者",
    "Ex4":"龙之沙时计",
    "Joy22":"乐园之卵",
    "V318":"乐园之卵（精灵",
    "Ex5":"Ex5",
    "ga1":"ga1",
    "V319":"V319",
    "66":"66",
    "Joy125":"Joy125",
    "JoyCH1":"JoyCH1",
    "JoyEX62":"JoyEX62",
    "JoyEX80":"JoyEX80"
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
                 let name = file.replace(".bin","").replace("Graphic","").replace(/_/g,"")
                //  console.log(name)
                //  console.log(name)
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
    // console.log(readAllVersion)
    return readAllVersion;
}