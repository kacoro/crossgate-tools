import { readFileSync, createReadStream, ReadStream } from 'fs';
import path from 'path';
import Jimp from 'jimp'
// tslint:disable-next-line: no-var-requires
const jimp: Jimp = require('jimp')
import { g_ImgMap, transBuffer, decodeImgData, arrTrans } from "./config";
import { PaletsType } from '../Store/reduce';
import {deCoder} from './cgCoder2'
//获取图片集信息，图片集数据
export const readGraphicInfo = async (binPath: string, version: any) => {
    let graphicInfo = readFileSync(path.join(binPath, "bin", g_ImgMap[version].info))
    let graphic = readFileSync(path.join(binPath, "bin", g_ImgMap[version].file))
    let length = graphicInfo.length / 40
    return { graphicInfo, length, graphic }
}

//使用steam获取图片集信息，图片集数据
export const readGraphicInfoByStream = async (binPath: string, version: any) => {
    let graphicInfoStream = createReadStream(path.join(binPath, "bin", g_ImgMap[version].info))
    let graphicStream = createReadStream(path.join(binPath, "bin", g_ImgMap[version].file))
    let graphicInfo = await readStream(graphicInfoStream)
   
    let graphic = await readStream(graphicStream)
    
     length = graphicInfo.length / 40
   
    return { graphicInfo, length, graphic }
}

const readStream = (stream: ReadStream): Promise<Buffer> => new Promise((resolve, reject) => {
    let buffers: any[] = [];
    stream.on('data', data => {
        buffers.push(data)
    });
    //读取完成
    stream.on('end', () => {
        console.log("finish")
        resolve(Buffer.concat(buffers))
    })
    //失败
    stream.on('error', () => {
        reject(Buffer.allocUnsafe(0))
    })
})


//获取单张图片信息
export function getImageInfo(i: number, graphicInfo: Buffer) {

        let buf1 = Buffer.allocUnsafe(40);
        graphicInfo.copy(buf1, 0, i * 40, (i + 1) * 40);
        var json = getInfo(i * 40, buf1);
        return json
    
   
    // let buf1 = graphicInfo.subarray(i * 40, (i + 1) * 40)
    
    
}

interface infoType {
    [key: string]: any
}

//获取单子图片数据
export async function getImage(infoJson: infoType, graphics: Buffer, palet:any) {
    
    if (!infoJson) return false
    // let head = graphics.subarray(infoJson.ddr, infoJson.ddr + 16);
    // let graphic = graphics.subarray(infoJson.ddr + 16, infoJson.ddr + infoJson.length)
    //根据起点位置，和i长度找到图片源，再根据调色板获取最终的颜色
    let headLength = 16
     let head = Buffer.allocUnsafe(headLength);
    graphics.copy(head,0, infoJson.ddr, infoJson.ddr + headLength);
   
     let graphic  = Buffer.allocUnsafe(infoJson.length-headLength);
     
     graphics.copy(graphic,0, infoJson.ddr+ headLength, infoJson.ddr +  infoJson.length);
    let version = head[2]
    let localPaletInfo = {
        version :version,
        length:0
    }
    console.log(version)
    
    if(version>=2){//版本大于2或3，说明使用自带调色板 调色板长度为4 通常为0x300，即256*3=768
         headLength = 20
         let paletHead = Buffer.allocUnsafe(4);
         graphics.copy(paletHead,0,infoJson.ddr + 16, infoJson.ddr + 20);
         let paletLength = transBuffer(paletHead)
         localPaletInfo.length =  paletLength
         console.log(paletHead,paletLength) //0300=>768
         graphic = Buffer.allocUnsafe(infoJson.length-20);
         graphics.copy(graphic,0,infoJson.ddr + 20, infoJson.ddr + infoJson.length)

    }
    // var image = null;
    if (version == 1 || version == 3) {// 偶数表示未压缩，按位图存放；奇数则表示压缩过
        let data = graphic.toJSON().data
        let elementSize = infoJson.width*infoJson.height
        console.log(data.length,infoJson.length - headLength,elementSize)
        // var imageData = deCoder(data, 1,infoJson.length - headLength)
        // var imageData = decodeImgData(graphic.toJSON().data, infoJson.length - headLength)
        var imageData = deCoder(graphic.toJSON().data, infoJson.length - headLength)
       
        // console.log('data:image/bmp;base64,'+Buffer.from(imageData._imgData).toString('base64'))
        try {
            let image = await filleImgPixel(infoJson, imageData, palet,localPaletInfo)
            // console.log(image)
            return image    
        } catch (error) {
            return null
        }
       
    } else {
        let imgData = { 
            idx: graphic.length,
            _imgData:graphic.toJSON().data 
         }
        let image = await filleImgPixel(infoJson, imgData, palet,localPaletInfo)
        return image
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

const filleImgPixel = (prop: infoType, data: { idx: number; _imgData: any[]; }, palet: PaletsType[],localPaletInfo:any) => {
    
    const { width, height } = prop;
    var { _imgData, idx } = data;
    if(localPaletInfo.version>=2){
        console.log(localPaletInfo)
        //处理palet
        let _palet: any
        _palet = Buffer.allocUnsafe(localPaletInfo.length);
        try {
            // _imgData.copy(_palet,0,_imgData.length-localPaletInfo.length,_imgData.length)
            //    _palet =  _palet.toJSON().data
            _palet = _imgData.slice(_imgData.length-localPaletInfo.length)
            _imgData = _imgData.slice(0,_imgData.length-localPaletInfo.length)
           
           _palet = arrTrans(3, _palet)
           _palet = _palet.map((item: any[])=>{
           return item.reverse();
           });
           palet = _palet
        } catch (error) {
            console.log(error.message)
        }
   }
    var imgData: any[] = [];

    // _imgData.map((item: any) => {
    //     if (palet[item]) {
    //         var pix = (palet[item] ).map((p:number|string) => {
    //             p = p.toString(16)
    //             if (Number(p) < 10) {
    //                 p = '0' + p
    //             } else {
    //                 p = p
    //             }
    //             if (Number('0x' + p) > 0) {
    //                 return p;
    //             }
    //         }).join('');
           
    //          imgData.push(pix != '' ? '#' + pix : '#0x000000');
    //     }
    //     else { //有些图片位置读取不到调色板，这里跳过
    //          imgData.push('#0x000000');
    //     }

    // })
    
    _imgData.map((pixel: number) => {
        if(pixel == 0x100){
            imgData.push([0, 0, 0, 0])
        }else{
            let [r, g, b] = palet[pixel]
            let a = 255
            imgData.push([r,g,b,a])
        }
    })

    return new Promise(async (resolve, reject) => {
        new Jimp(width, height, function (err: any, image: any) {
            if (err) {
                reject(err)
            }

            arrTrans(width, imgData).forEach((row: any[], y: number) => {
                row.forEach((color: any, x: any) => {
                    // image.setPixelColor(Jimp.cssColorToHex(color), x, height - y - 1);
                    image.setPixelColor(Jimp.rgbaToInt(color[0],color[1],color[2],255), x, height - y - 1);
                });
            });

            resolve(image.bitmap)
        });
    })
}


