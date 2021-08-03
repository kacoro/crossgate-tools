import fs, { readFileSync, createReadStream, ReadStream } from 'fs';
import path from 'path';
import Jimp from 'jimp'
// tslint:disable-next-line: no-var-requires
const jimp: Jimp = require('jimp')
import { bytes2Int } from './covert';
import { readStream } from './steam'
import { getImage, getImageInfo, graphicInfo, readGraphiByStream, readGraphicInfo } from './readImages';
import { Bitmap } from '@container/InfoList';
import { getHiddenPalet } from './readPalets';
import { PaletsType } from '../Store/reduce';
import { decodeByBuferr } from './cgCoder';
import { arrTrans } from './config';
import { store } from '../Store';

interface AnimeDict {
    [key: string]: string
}
const versionDict: AnimeDict = {
    "3": "命运的开启者",
    "Ex1": "龙之沙时计",
    "V37": "乐园之卵（精灵）",
    "V38": "乐园之卵（精灵",
    "Ex5": "Ex5",
    "ga1": "ga1",
    "V319": "V319",
    "66": "66",
    "Joy125": "Joy125",
    "JoyCH1": "JoyCH1",
    "JoyEX62": "JoyEX62",
    "JoyEX80": "JoyEX80"
}

export interface allAnimeType {
    name: string,
    realName: string,
    info: string,
    file: string,
    graphicInfoBin?: string,
    graphicBin?: string,
    version?: number
}


export interface hiddenPaletInfoType {
    [key: string]: graphicInfo
}

export const readAllAnime = async (binPath: string): Promise<{ allAnime: allAnimeType[], hiddenPalet: hiddenPaletInfoType }> => {
    let readAllAnime: allAnimeType[] = [];
    let suffix = "AnimeInfo";
    let versionPath = path.join(binPath, "bin")
    let hiddenPalet: hiddenPaletInfoType = {}
    console.log("readAllAnime", binPath)
    try {
        let files = fs.readdirSync(versionPath)// 读取目录
        console.log(files)
        files.forEach((filename) => { // item: 目录和文件名称
            if (filename.includes(suffix)) {
                let file = filename.replace("Info", "")
                let name = file.replace(".Bin", "").replace(".bin", "").replace("Anime", "").replace(/_/g, "")

                //找到匹配的图档
                console.log({ name })
                readAllAnime.push({
                    name: versionDict[name] || name,
                    realName: name,
                    info: filename,
                    file: file,
                    graphicInfoBin: '',
                    graphicBin: '',
                    version: parseInt(name.replace(/[a-zA-Z]/g, ''))
                })
            }
        })
        let readAllVersion: allAnimeType[] = [];

        let versionSuffix = "GraphicInfo"
        files.forEach((filename) => { // 匹配对应的图档
            if (filename.includes(versionSuffix)) {
                let file = filename.replace("Info", "")
                let name = file.replace(".bin", "").replace("Graphic", "").replace(/_/g, "")
                //找到匹配的图档
                readAllVersion.push({
                    name: name,
                    realName: name,
                    info: filename,
                    file: file,
                    version: parseInt(name.replace(/[a-zA-Z]/g, ''))
                })

            }
        })
        let hidenPaletSuffix = /^GraphicInfoV3_/ // 用正则匹配 有可能出现两次的情况


        let hiddenPaletArray: string[] = []
       
        files.forEach(async (filename) => { // 匹配对应的图档
            if (hidenPaletSuffix.test(filename)) {
                hiddenPaletArray.push(filename)
            }
        })

        const hinddenStream = createReadStream(path.join(versionPath, hiddenPaletArray[0]), { start: 3840 * 40 })
        let hiddenBuffer = await readStream(hinddenStream)
        let length = hiddenBuffer.length / 40
        for (let index = 0; index < length; index++) {
            let info = getImageInfo(index, hiddenBuffer)
            if (info && info.width == 4 && info.height == 1) {
                hiddenPalet[info.tileId] = info
            }
        }
        console.log(hiddenPalet)
        readAllAnime.map((item, index) => {
            //后续考虑使用match
            if (item.name == "Joy91") {
                item.graphicInfoBin = readAllVersion[index - 1].info,
                    item.graphicBin = readAllVersion[index - 1].file
            } else if (item.name == "Joy13" && index + 1 < readAllAnime.length) {
                item.graphicInfoBin = readAllVersion[index + 1].info,
                    item.graphicBin = readAllVersion[index + 1].file
            } else {
                item.graphicInfoBin = readAllVersion[index].info,
                    item.graphicBin = readAllVersion[index].file
            }
            return item
        })
        console.log({ readAllAnime, readAllVersion })

    } catch (error) {
        console.log("error.message :", error.message)
        // alert(error.message + "，请重新选择目录！")
    }

    return { allAnime: readAllAnime, hiddenPalet: hiddenPalet };
}





//获取动画集信息
export const readAnimesInfo = async (binPath: string, version: any) => {
    try {
        let animesInfo = readFileSync(path.join(binPath, "bin", version.info))
        let graphicsInfo = readFileSync(path.join(binPath, "bin", version.graphicInfoBin))
        let animePath = path.join(binPath, "bin", version.file)
        let graphicPath = path.join(binPath, "bin", version.graphicBin)

        let length = animesInfo.length / 12
        return { animesInfo, length, animePath, graphicsInfo, graphicPath }
    } catch (error) {
        console.log(error.message)
        return {}
    }
}

interface animesInfoype {
    id: number
    ddr: number
    length: number
    unknow: string
}
interface animeInfoType {
    direction: number
    action: number
    time: number
    frames: number
    graphicIds?: graphicIds[],
    paletId?: number
    reverse?: number
    paletUnknow?: string
} interface graphicIds {
    id: number
    unknow: string
    data?: Buffer
    width?: number
    height?: number
}
type animeInfoTypeAll = animesInfoype & animeInfoType
type animeInfoTypes = animesInfoype | animeInfoType | graphicIds | animeInfoTypeAll

//获取解析图片信息
function getInfo(palet: Buffer, type = 0): animeInfoTypes {
    let json: animeInfoTypes
    if (type == 0) { //动画地址信息
        json = {    //Buffer.slice末尾不包含
            id: bytes2Int(palet.subarray(0, 4)),  //动画序号
            ddr: bytes2Int(palet.subarray(4, 8)), //动画在数据文件中的起始位置 0 开始
            length: bytes2Int(palet.subarray(8, 10)), //动作数目
            unknow: (palet.subarray(10, 12)).toString("ucs-2"),  //未知
        }
    } else if (type == 1) { //动画信息
        json = {    //Buffer.slice末尾不包含
            direction: bytes2Int(palet.subarray(0, 2)),   //0-7分别表示8个方向
            action: bytes2Int(palet.subarray(2, 4)), //表示该动作的含义，比如坐下或者走
            time: bytes2Int(palet.subarray(4, 8)), // 该动作完成一遍所需时间，单位为毫秒
            frames: bytes2Int(palet.subarray(8, 12)), //该动画有多少帧，决定后面数据的大小
        }
    } else if (type == 3) { //3.0之后的 动画信息 加了8个字节。变为20个字节
        json = {    //Buffer.slice末尾不包含
            direction: bytes2Int(palet.subarray(0, 2)),   //0-7分别表示8个方向
            action: bytes2Int(palet.subarray(2, 4)), //表示该动作的含义，比如坐下或者走
            time: bytes2Int(palet.subarray(4, 8)), // 该动作完成一遍所需时间，单位为毫秒
            frames: bytes2Int(palet.subarray(8, 12)), //该动画有多少帧，决定后面数据的大小
            paletId: bytes2Int(palet.subarray(12, 14)), //调色板号 没完全弄清楚，我不用它来判断
            reverse: bytes2Int(palet.subarray(14, 16)), //若为奇数表示该序列的图片左右反向
            paletUnknow: palet.subarray(16, 20).toString('utf-8'), //为0xFFFFFFFF，可能是结束符，便于以后再扩充？
        }
    } else { //动作序列号
        json = {    //Buffer.slice末尾不包含
            id: bytes2Int(palet.subarray(0, 4)),      // 该帧所使用的图片
            unknow: palet.subarray(4, 10).toString("utf-8"), //动画在数据文件中的起始位置 0 开始
        }
    }

    return json;
}

interface paletType {
    [key: string]: any
}

//获取单个图动画信息
export function getAnimeInfo(i: number, graphicInfo: Buffer) {

    let buf1 = Buffer.allocUnsafe(12);
    graphicInfo.copy(buf1, 0, i * 12, (i + 1) * 12);
    var json = getInfo(buf1);
    console.log(json)
    return json
}

const readAnimeByStream = async (binPath: string, infoJson: infoType) => {
    let { ddr, length } = infoJson
    console.log({ binPath, infoJson })
    // 版本判断 Ex_1  _3 之外的就是3.0，需要特殊处理
    //正向匹配
    let checkV3 = binPath.includes('V3') || binPath.includes('Joy')
    console.log({ checkV3 })

    let headLength = 12
    if (checkV3) {
        headLength = 20
    }
    let headSteam = createReadStream(binPath, { start: ddr, end: ddr + headLength - 1 })

    // 后面就跟有多少个序列号，每个序列号长10字节。
    let head = await readStream(headSteam)
    let headInfo = getInfo(head, 1) as animeInfoType
    if (checkV3) {
        headInfo = getInfo(head, 3) as animeInfoType
    }
    let graphicIds = []
    let graphicHeadLength = 10
    for (let index = 0; index < headInfo.frames; index++) {
        let graphicStream = createReadStream(binPath, {
            start: ddr + headLength + index * graphicHeadLength,
            end: ddr + headLength + (index + 1) * graphicHeadLength - 1
        })
        let graphicHead = await readStream(graphicStream)
        let graphicHeadInfo = getInfo(graphicHead, 2) as graphicIds
        graphicIds.push(graphicHeadInfo)
    }

    // animeInfo = await readStream(graphicStream)
    // graphicStream.destroy();
    let info: animeInfoTypes = Object.assign(infoJson, headInfo, { graphicIds })
    return { info }
}


interface infoType {
    [key: string]: any
}





//获取单个动画信息
export async function getAnime(infoJson: infoType, animePath: string, 
    palet: any, graphics: Buffer, graphicPath: string,hiddenPalets:hiddenPaletInfoType) {
    if (!infoJson || !animePath || !palet) return false

    // console.log({ graphics, length, graphicPath })
    const { info } = await readAnimeByStream(animePath, infoJson)
    //使用动画编号来查

    let hiddenPalet: any
    if (info.paletId) {//如果有隐藏的id，则查找。//GraphicInfoV3_*.bin中
        //即使是AnimeInfo_PUK2_*.bin中的动画也是使用这里的调色板，从3840幅图片开始是隐藏调色板，不过并不是全部连续存在的，所以需要判断，除了宽4高1外
        //，普通图片的地图编号高位为0或者3(乐园版本的地图)，调色板的则不是，可以依此辨别。 

        // console.log(hiddenPalets,info.paletId)
      
        let graphicInfo = hiddenPalets[(info as any).id]

        // console.log(graphicInfo)
        if(graphicInfo&&graphicInfo.width==4&&graphicInfo.height==1&&graphicInfo.tileId!=0){//这种才是调色版的。暂时以这个判断
             hiddenPalet = await getHiddenPalet(graphicPath,graphicInfo)
            // console.log(hiddenPalet)

            const { graphic, version, localPaletInfo } = await readGraphiByStream(graphicPath, graphicInfo)
            if(version == 1 || version == 3) {
                let elementSize = graphicInfo.width * graphicInfo.height

                if (version == 3) {
                    elementSize += localPaletInfo.length
                    var imgBuffer = decodeByBuferr(graphic, elementSize)
                    let imageData = imgBuffer.toJSON().data

                    let _palet: any
                    _palet = imageData.slice(imageData.length - localPaletInfo.length)
                    console.log(_palet)
                    _palet = arrTrans(3, _palet)
                    _palet = _palet.map((item: any[]) => {
                        return item.reverse();
                    });
                    hiddenPalet = _palet
                    console.log(_palet)
                }else{
                    console.log("ortherVersion")
                }
            }
            else {
                let hiddenPalet = graphic.toJSON().data
                return hiddenPalet
            }
        }   

    }

    //读取图片
    let images: Bitmap[] = []
    for (let index = 0; index < info.graphicIds.length; index++) {
        const id = info.graphicIds[index].id;
        let graphicInfo = getImageInfo(id, graphics);
        let image: Bitmap | boolean = await getImage(graphicInfo, graphicPath, palet, hiddenPalet)
        if (image) {
            images.push(image)
        }

    }

    return { info, images }
}
