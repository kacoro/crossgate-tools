import fs,{ readFileSync, createReadStream, ReadStream } from 'fs';

/**
 * readStream
 *
 * @param {ReadStream} stream
 * @return {*}  {Promise<Buffer>}
 */
 const readStream = (stream: ReadStream): Promise<Buffer> => new Promise((resolve, reject) => {
    let buffers: any[] = [];
    stream.on('data', data => {
        buffers.push(data)
    });
    //读取完成
    stream.on('end', () => {
        // console.log("end")
        resolve(Buffer.concat(buffers))
    })
    //失败
    stream.on('error', () => {
        reject(Buffer.allocUnsafe(0))
    })
    
    stream.on("close",()=>{ //最后文件关闭触发
        //  console.log("关闭")
    });
})

export {readStream}