import { readFileSync, createReadStream, ReadStream } from 'fs';
import path from 'path';
import Jimp from 'jimp'
// tslint:disable-next-line: no-var-requires
const jimp: Jimp = require('jimp')
import { g_ImgMap, arrTrans, BG_COLOR } from "./config";
import { PaletsType } from '../Store/reduce';
import { decodeByBuferr } from './cgCoder'
import { bytes2Int } from './covert';
import { readStream } from './steam'
import { Bitmap } from '@container/InfoList';
//获取图片集信息，图片集数据
export const readGraphicInfo = async (binPath: string, version: any) => {
    try {
        let graphicInfo = readFileSync(path.join(binPath, "bin", version.info))
        // let graphic = readFileSync(path.join(binPath, "bin", version.file))
        let graphicPath = path.join(binPath, "bin", version.file)
        let length = graphicInfo.length / 40
        return { graphicInfo, length, graphicPath }
    } catch (error) {
        console.log(error.message)
        return {}
    }
}

//使用steam获取图片集信息，图片集数据
export const readGraphicInfoByStream = async (binPath: string, version: any) => {
    let graphicInfoStream = createReadStream(path.join(binPath, "bin", version.info))
    let graphicStream = createReadStream(path.join(binPath, "bin", version.file))
    let graphicInfo = await readStream(graphicInfoStream)

    let graphic = await readStream(graphicStream)

    length = graphicInfo.length / 40

    return { graphicInfo, length, graphic }
}

const readGraphiByStream = async (binPath: string, infoJson: infoType) => {

    let { ddr, length } = infoJson
    let headLength = 16
    let graphic = Buffer.allocUnsafe(0)
    let headSteam = createReadStream(binPath, { start: ddr, end: ddr + headLength - 1 })

    let head = await readStream(headSteam)
    // let rd = bytes2String(head.subarray(0, 2))
    let rd = head.subarray(0, 2).toString("utf-8")
    // console.log(rd)
    let version = head[2]
    let localPaletInfo = {
        version: version,
        length: 0
    }
    if (version >= 2) {

        let paletHeadStream = createReadStream(binPath, { start: ddr + headLength, end: ddr + headLength + 4 - 1 })
        headLength = 20
        let paletHead = await readStream(paletHeadStream)
        // console.log(paletHead)
        let paletLength = bytes2Int(paletHead)
        localPaletInfo.length = paletLength
        // paletHeadStream.destroy();
    }

    // console.log("ddr:",ddr)
    let graphicStream = createReadStream(binPath, { start: ddr + headLength, end: ddr + length - 1 })
    graphic = await readStream(graphicStream)
    // graphicStream.destroy();

    return { graphic, version, localPaletInfo }
}


//获取单张图片信息
export function getImageInfo(i: number, graphicInfo: Buffer) {

    let buf1 = Buffer.allocUnsafe(40);
    graphicInfo.copy(buf1, 0, i * 40, (i + 1) * 40);
    var json = getInfo(i * 40, buf1);
    return json
}

interface infoType {
    [key: string]: any
}

//获取单子图片数据
export async function getImage(infoJson: infoType, graphics_path: string, palet: any) {
    if (!infoJson || !graphics_path || !palet) return false

    const { graphic, version, localPaletInfo } = await readGraphiByStream(graphics_path, infoJson)
    if (version == 1 || version == 3) {// 偶数表示未压缩，按位图存放；奇数则表示压缩过
        let elementSize = infoJson.width * infoJson.height
        // console.log(data.length,infoJson.length - headLength,elementSize)
        // var imageData = deCoder(data, 1,infoJson.length - headLength)
        // console.time("decode")
        if (version == 3) {
            elementSize += localPaletInfo.length
        }
        // var imageData = decodeImgData(graphic.toJSON().data)
        var imgBuffer = decodeByBuferr(graphic, elementSize)
        let imageData = imgBuffer.toJSON().data
        // console.timeEnd("decode")
        // console.log('data:image/bmp;base64,'+Buffer.from(imageData._imgData).toString('base64'))
        try {
            let image = await filleImgPixel(infoJson, imageData, palet, localPaletInfo)

            return image
        } catch (error) {
            console.log(error)
            return null
        }

    } else {
        let imgData = graphic.toJSON().data
        let image = await filleImgPixel(infoJson, imgData, palet, localPaletInfo)
        return image
    }
    // console.log(image)
    // return false
}


//获取解析图片信息
function getInfo(i = 0, palet: Buffer) {
    let json = {    //Buffer.slice末尾不包含
        id: bytes2Int(palet.subarray(0, 4)),   //图片的编号 0开始
        ddr: bytes2Int(palet.subarray(4, 8)), //指明图片在数据文件中的起始位置 0 开始
        length: bytes2Int(palet.subarray(8, 12)), //图片数据块的大小 块长度;
        x: bytes2Int(palet.subarray(12, 16), true),  //偏移量X;显示图片时，横坐标偏移X
        y: bytes2Int(palet.subarray(16, 20), true),  //偏移量Y
        width: bytes2Int(palet.subarray(20, 24)),
        height: bytes2Int(palet.subarray(24, 28)), 
        east: palet[28],  //占地东
        south: palet[29], //占地南
        flag: palet[30], //标记
        unKnow: palet.subarray(31, 36).toJSON(), //5个字节
        tileId: bytes2Int(palet.subarray(36, 40)) //4个字节
    }
    // console.log(json)
    return json;
}


interface paletType {
    [key: string]: any
}

const filleImgPixel = (prop: infoType, data: any[], palet: PaletsType[], localPaletInfo: any):Promise<Bitmap> => {

    const { width, height } = prop;

    if (localPaletInfo.version >= 2) {//主要是处理3.0的 自带调色板
        // console.log(localPaletInfo)
        //处理palet
        let _palet: any
        try {
            console.log("localPaletInfo:", localPaletInfo.length)
            _palet = Buffer.allocUnsafe(localPaletInfo.length);

            // _imgData.copy(_palet,0,_imgData.length-localPaletInfo.length,_imgData.length)
            //    _palet =  _palet.toJSON().data
            _palet = data.slice(data.length - localPaletInfo.length)
            // console.log("_palet_length",data.length-localPaletInfo.length,_palet.length)
            data = data.slice(0, data.length - localPaletInfo.length)

            _palet = arrTrans(3, _palet)
            _palet = _palet.map((item: any[]) => {
                return item.reverse();
            });
            palet = _palet
        } catch (error) {
            console.log(error.message)
        }
    }
    var imgData: any[] = [];

    data.map((pixel: number) => {
        if (pixel == BG_COLOR) {
            imgData.push([0, 0, 0, 0])
        } else {
            try {
                let [r, g, b,a] = palet[pixel]
                if(typeof a == "undefined")  a = 255
                imgData.push([r, g, b, a])
            } catch (error) {
                //调色板上没有这个颜色时
                imgData.push([255, 255, 255, 255])
            }

        }
    })
    // console.log("finish")

    return new Promise(async (resolve, reject) => {

        new Jimp(width, height, function (err: any, image: any) {
            if (err) {
                reject(err)
            }

            arrTrans(width, imgData).forEach((row: any[], y: number) => {
                row.forEach((color: any, x: any) => {
                    // image.setPixelColor(Jimp.cssColorToHex(color), x, height - y - 1);
                    image.setPixelColor(Jimp.rgbaToInt(color[0], color[1], color[2], color[3]), x, height - y - 1);
                });
            });

            resolve(image.bitmap)
        });
    })
}

export default {
    filleImgPixel, getImage, getImageInfo
}
