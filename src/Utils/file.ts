
const { dialog } = require('electron').remote;
import fs from "fs"
import path from "path"


/**
 * 打开目录
 *
 * @return {*} 
 */
const openDirectory=()=>{
    try {
        var folder = dialog.showOpenDialogSync({ properties: ['openDirectory'] }) 
        return folder[0]
    } catch (error) {
        return null
    }
}

/**
 * 保存文件
 *
 * @param {Buffer} buff
 * @param {string} fileName
 * @param {string} [folder]
 */
const saveFile=(buff:Buffer,fileName:string,folder?:string)=>{
    if(!folder)  folder = openDirectory()
    if(folder)
        fs.writeFileSync(path.join(folder,fileName),buff);
}

export {saveFile,openDirectory}