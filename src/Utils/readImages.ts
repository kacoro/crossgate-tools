import { readFileSync } from 'fs';
import path from 'path';
import Jimp from 'jimp'
// tslint:disable-next-line: no-var-requires
const jimp: Jimp = require('jimp')
import { g_ImgMap, transBuffer, decodeImgData, arrTrans } from "./config";

//获取图片集信息，图片集数据
export const readGraphicInfo = (binPath: string, version: any) => {
    let graphicInfo = readFileSync(path.join(binPath, "bin", g_ImgMap[version].info))
    let graphic = readFileSync(path.join(binPath, "bin", g_ImgMap[version].file))
    let length = graphicInfo.length / 40
    return { graphicInfo, length, graphic }
}

//获取单张图片信息
export function getImageInfo(i: number, graphicInfo: Buffer) {

    // let buf1 = Buffer.allocUnsafe(40);
    // graphicInfo.copy(buf1, 0, i * 40, (i + 1) * 40);
    let buf1 = graphicInfo.subarray( i * 40, (i + 1) * 40)
    var json = getInfo(i * 40, buf1);
    return json
}

interface infoType {
    [key: string]: any
}

//获取单子图片数据
export async function getImage(infoJson: infoType, graphics: Buffer, palet: Buffer) {
   
    if(!infoJson) return false
    //根据起点位置，和i长度找到图片源，再根据调色板获取最终的颜色
    // let head = Buffer.allocUnsafe(16);
    // graphics.copy(head,0, infoJson.ddr, infoJson.ddr + 16);
    let head = graphics.subarray(infoJson.ddr, infoJson.ddr + 16);
    // let graphic  = Buffer.allocUnsafe(infoJson.length-16);
    let graphic = graphics.subarray(infoJson.ddr + 16, infoJson.ddr + infoJson.length)
    // graphics.copy(graphic,0, infoJson.ddr+ 16, infoJson.ddr +  infoJson.length);
    let version = head[2]
    // var image = null;
    if (version == 1 || version == 3) {// 压缩的图片
        var imageData = decodeImgData(graphic.toJSON().data, infoJson.length - 16)
        // console.log('data:image/bmp;base64,'+Buffer.from(imageData._imgData).toString('base64'))
        let image = await filleImgPixel(infoJson, imageData, palet)
        console.log(image)
        return image
    } else {

    }
    // console.log(image)
    return false
}


//获取解析图片信息
function getInfo(i = 0, palet: Buffer) {
    let json = {    //Buffer.slice末尾不包含
        id: transBuffer(palet.subarray(0, 4)),   //图片的编号 0开始
        ddr: transBuffer(palet.subarray(4, 8), "drr"), //指明图片在数据文件中的起始位置 0 开始
        length: transBuffer(palet.subarray(8, 12)), //图片数据块的大小 块长度;
        x: transBuffer(palet.subarray(12, 16), 'BIN'),  //偏移量X;显示图片时，横坐标偏移X
        y: transBuffer(palet.subarray(16, 20), 'BIN'),  //偏移量Y
        width: transBuffer(palet.subarray(20, 24)),
        height: transBuffer(palet.subarray(24, 28)),
        east: palet[28],
        south: palet[29],
        flag: palet[30],
        unKnow: palet.subarray(31, 36),
        tileId: transBuffer(palet.subarray(36, 40))
    }
    return json;
}


interface paletType {
    [key: string]: any
}

const filleImgPixel = (prop: infoType, data: { idx: any; _imgData: any; }, palet: Buffer) => {
    const { width, height } = prop;
    const { _imgData, idx } = data;

    var imgData: any[] = [];

    _imgData.map((item: any) => {
        if (palet[item]) {
            var pix = (palet[item] as any).map((p: string | number) => {
                p = p.toString(16)
                if (Number(p) < 10) {
                    p = '0' + p
                } else {
                    p = p
                }
                if (Number('0x' + p) > 0) {
                    return p;
                }
            }).join('');
            imgData.push(pix != '' ? '#' + pix : '#0x000000');
        }
        else{ //有些图片位置读取不到调色板，这里跳过
            imgData.push('#0x00000');
        }

    })

    return new Promise(async (resolve, reject) => {
        new Jimp(width, height, function (err: any, image: any) {
            if (err) {
                reject(err)
            }

            arrTrans(width, imgData).forEach((row: any[], y: number) => {
                row.forEach((color: any, x: any) => {
                    image.setPixelColor(Jimp.cssColorToHex(color), x, height - y - 1);
                });
            });

            resolve(image.bitmap)
        });
    })
}

