"use strict"

// const { GifReader ,GifWriter} = require("omggif")
//  const { GifReader} = require("/GifReader")
import { GifReader,GifWriter } from "./omggif"

//  const arrayRange = require("array-range")

let arrayRange = (start: number, end: number) => Array(end - start + 1).fill(0).map((v, i) => i + start)


const gifDecoder = (data: any) => {
	const reader = new GifReader(data)
    let numFrames = reader.numFrames()
    let palette = reader.palette()
    console.log(reader)
    console.log({palette})
    console.log(palette?.paletteRGB[168])
	let currentTime = 0
    // let width = 64
    // let height = 47
	const frames = arrayRange(0,numFrames).map((frameIndex: number) => {
        const frameInfo = reader.frameInfo(frameIndex)
        let decode = reader.decode(frameIndex)
        console.log(decode)
        let delay = frameInfo.delay*10
        // console.log(frameInfo)
		const frameData = new Array(reader.width * reader.height * 4)
		reader.decodeAndBlitFrameRGBA(frameIndex, frameData)
        const BGRAData= new Array(reader.width * reader.height * 4)
		reader.decodeAndBlitFrameBGRA(frameIndex, frameData)
        // console.log(frameData)
        // console.log(BGRAData)
        currentTime += delay
		const data = {
			delay, 
            width:frameInfo.width,
            height:frameInfo.height,
            frameInfo, 
            decode,
			data: frameData,
            BGRAData:BGRAData,
            x:frameInfo.x,
            y:frameInfo.y
		}
		return data
	})
	return {
		width: reader.width,
		height: reader.height,
        numFrames,
		frames,
        currentTime
	}
}

export interface frameType{
    x: number;
    y: number;
    width: number;
    height: number;
    disposal?:number;  //2表示不延续
    delay?:number
    transparent?:number;// 指定调色版索引颜色透明 默认为0
}


function genGif256(width:number,height:number,duringTime:number,palette:number[],frames:frameType[],streams:number[][]) {
   
    var buf =  Buffer.alloc(1024*1024);
    var gf = new GifWriter(buf, width, height, {loop: 0,
      palette:palette
    });
    frames.map((item,index)=>{
        var stream = Array(item.width*item.height);
        gf.addFrame(item.x, item.y, item.width,item.height, streams[index], {
            delay:Math.floor(item.delay/10) ||  duringTime / frames.length/10,
            transparent: item.transparent||0,
            disposal: item.disposal||2});  
    })
    var data = buf.slice(0, gf.end());
    return data;
  }
  export interface RealGifType {
    x: number,
    y: number,
    width: number,
    height: number,
    id?: number,
    ddr?: number,
    length?: number,
    east?: number,
    south?: number,
    flag?: number,
    unKnow?: number[],
    tileId?: number,
    frames?: RealGifType[],
}
const getRealGifInfo = (data: RealGifType[]) => {
    
    let info = data.reduce((prev: RealGifType, cur: RealGifType) => {
        let height = prev.height > cur.height ? prev.height : cur.height
        let width = prev.width > cur.width ? prev.width : cur.width
        let y = Math.abs(prev.y) > Math.abs(cur.y) ? Math.abs(prev.y) : Math.abs(cur.y)
        let x = Math.abs(prev.x) > Math.abs(cur.x) ? Math.abs(prev.x) : Math.abs(cur.x)
        let data: RealGifType = { height, y, width, x}
        return data
    })
   
    let frames = data.map(item => {
        item.x += Math.abs(info.x)
        item.y += Math.abs(info.y)
        return item
    })
    let maxYItem = frames.reduce((prev: RealGifType, cur: RealGifType) => {//取得最大的y项，用来计算最大的高度
        return prev.height + prev.y > cur.y + cur.height? prev :cur
    })
    let maxXItem = frames.reduce((prev: RealGifType, cur: RealGifType) => {//取得最大的X项，用来计算最大的宽度
        return prev.width + prev.x  > cur.x + cur.width ? prev :cur
    })
    info.height = maxYItem.height + Math.abs(maxYItem.y)
    info.width =  maxXItem.width + Math.abs(maxXItem.x)
    info.x = -Math.abs(info.x)
    info.y = -Math.abs(info.y)
    info.frames = frames
    return info
}


  

export {gifDecoder,getRealGifInfo,genGif256}