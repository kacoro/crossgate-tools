import fs, { readFileSync, createReadStream, ReadStream } from 'fs';
import path from 'path';
import Jimp from 'jimp'
// tslint:disable-next-line: no-var-requires
const jimp: Jimp = require('jimp')
import { arrTrans, BG_COLOR } from "./config";
import { PaletsType } from '../Store/reduce';
import { decodeByBuferr } from './cgCoder'
import { bytes2Int } from './covert';
import { readStream } from './steam'
import { getImage, getImageInfo, readGraphicInfo } from './readImages';
import { Bitmap } from '@container/InfoList';
import { resolve } from 'webpack.config';

interface AnimeDict {
    [key: string]: string
}
const versionDict: AnimeDict = {
    "20": "命运的开启者",
    "Ex4": "龙之沙时计",
    "Joy22": "乐园之卵",
    "V318": "乐园之卵（精灵",
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
    graphicBin?: string
}

export const readAllAnime = (binPath: string): allAnimeType[] => {
    let readAllAnime: allAnimeType[] = [];
    let suffix = "AnimeInfo";
    let versionPath = path.join(binPath, "bin")
    try {
        let files = fs.readdirSync(versionPath)// 读取目录
        files.forEach((filename) => { // item: 目录和文件名称
            if (filename.includes(suffix)) {
                let file = filename.replace("Info", "")
                let name = file.replace(".Bin", "").replace(".bin", "").replace("Anime", "").replace(/_/g, "")

                //找到匹配的图档
                //  console.log(name)
                readAllAnime.push({
                    name: versionDict[name] || name,
                    realName: name,
                    info: filename,
                    file: file,
                    graphicInfoBin: '',
                    graphicBin: '',
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
                })

            }
        })
        readAllAnime.map((item, index) => {
            item.graphicInfoBin = readAllVersion[index].info,
                item.graphicBin = readAllVersion[index].file
            return item
        })
        console.log({ readAllAnime, readAllVersion })
    } catch (error) {
        alert(error.message + "，请重新选择目录！")
    }

    return readAllAnime;
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
    unknow: number
}
interface animeInfoType {
    direction: number
    action: number
    time: number
    frames: number
    graphicIds?: graphicIds[]
} interface graphicIds {
    id: number
    Unknow: number
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
            unknow: bytes2Int(palet.subarray(10, 12), true),  //未知
        }
    } else if (type == 1) { //动画信息
        json = {    //Buffer.slice末尾不包含
            direction: bytes2Int(palet.subarray(0, 2)),   //0-7分别表示8个方向
            action: bytes2Int(palet.subarray(2, 4)), //表示该动作的含义，比如坐下或者走
            time: bytes2Int(palet.subarray(4, 8)), // 该动作完成一遍所需时间，单位为毫秒
            frames: bytes2Int(palet.subarray(8, 12)), //该动画有多少帧，决定后面数据的大小
        }
    } else { //动作序列号
        json = {    //Buffer.slice末尾不包含
            id: bytes2Int(palet.subarray(0, 4)),      // 该帧所使用的图片
            Unknow: bytes2Int(palet.subarray(4, 10)), //动画在数据文件中的起始位置 0 开始
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
    let headLength = 12
    let headSteam = createReadStream(binPath, { start: ddr, end: ddr + headLength - 1 })

    // 后面就跟有多少个序列号，每个序列号长10字节。
    let head = await readStream(headSteam)
    let headInfo = getInfo(head, 1) as animeInfoType
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
export async function getAnime(infoJson: infoType, animePath: string, palet: any, graphics: Buffer, graphicPath: string) {
    if (!infoJson || !animePath || !palet) return false
    let length = graphics.length / 40
    // console.log({ graphics, length, graphicPath })
    const { info } = await readAnimeByStream(animePath, infoJson)

    //读取图片
    let images: Bitmap[] = []
    for (let index = 0; index < info.graphicIds.length; index++) {
        const id = info.graphicIds[index].id;
        let graphicInfo = getImageInfo(id, graphics);
        let image: Bitmap | boolean = await getImage(graphicInfo, graphicPath, palet)
        if(image){
            images.push(image)
        }
        
    }

    return {info,images}
}
