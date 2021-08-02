import { Bitmap } from "@container/InfoList";
export type MIME_TYPE = "image/png" | "image/jpg" | "image/bmp" | "image/gif"
export function exportCanvasAsPNG(MIME_TYPE: MIME_TYPE = "image/png", canvas: HTMLCanvasElement, fileName: string, image?: Bitmap) {
    var gco = new Array();
    gco.push("source-atop");
    gco.push("source-in");
    gco.push("source-out");
    gco.push("source-over");
    gco.push("destination-atop");
    gco.push("destination-in");
    gco.push("destination-out");
    gco.push("destination-over");
    gco.push("lighter");
    gco.push("copy");
    gco.push("xor");
   
    if (image) {
        var imageData = new ImageData(
            Uint8ClampedArray.from(image.data),
            image.width,
            image.height
        );
    
        var newCanvas = document.createElement("canvas");
        // var imgData = canvas.getContext("2d").getImageData(0, 0, 60, 60); //(sx,sy,sw,sh)
        var ctx = newCanvas.getContext("2d");
        newCanvas.width = image.width;
        newCanvas.height = image.height;


        ctx.putImageData(imageData, 0, 0)
        ctx.globalCompositeOperation = "lighter"; //destination-out destination-atop
        if (MIME_TYPE == "image/jpg" || MIME_TYPE == "image/bmp") {
            if (MIME_TYPE == "image/jpg") {
                ctx.fillStyle = "#ffffff"
            } else {
                ctx.fillStyle = "#000000"
            }
            ctx.fillRect(0, 0, image.width, image.height);

        }
        var imgURL = newCanvas.toDataURL(MIME_TYPE);
    }else{
        var imgURL = canvas.toDataURL(MIME_TYPE);
    }

   
    var dlLink = document.createElement('a');
    dlLink.download = fileName;
    dlLink.href = imgURL;
    dlLink.dataset.downloadurl = [MIME_TYPE, dlLink.download, dlLink.href].join(':');

    document.body.appendChild(dlLink);
    dlLink.click();
    document.body.removeChild(dlLink);
}


    /**
     *  //不在动画中使用 putImageData 方法,提前离屏处理
     *
     * @param {HTMLCanvasElement[]} imagedatas
     * @return {*} 
     */
    const canvasOffScreen = (imagedatas:ImageData[])=>{
        let coxs:HTMLCanvasElement[] = []
        imagedatas.forEach((image:ImageData)=>{
            var cos:HTMLCanvasElement = document.createElement('canvas');
            cos.width = image.width;
            cos.height = image.height;
            cos.getContext('2d').putImageData(image,image.width,image.height)
            
            coxs.push(cos)
            //  context.putImageData(image, (width - image.width) / 2, (heigth - image.height) / 2);
        })
        return coxs
    }

    

     /**
     *  //不在动画中使用 putImageData 方法,提前离屏处理
     *   OffscreenCanvas  API，ImageBitmap 和 ImageBitmapRenderingContext，
     * @param {HTMLCanvasElement[]} imagedatas
     * @return {*} 
     */
      const canvasOffScreen2 = (imagedatas:ImageData[])=>{

        let coxs:ImageBitmap [] = []
        // imagedatas.forEach((image:ImageData)=>{
        //     var cos =document.createElement('canvas')
        //     document.body.appendChild(cos);  
        //     cos.width = image.width;
        //     cos.height = image.height;
        //     cos.getContext('2d').putImageData(image,image.width,image.height)
        //     var two = cos.getContext("bitmaprenderer");
        //     var osc = new OffscreenCanvas(image.width, image.height);
           
        //     let  bitmapOne = osc.transferToImageBitmap();
        //     let bitmap = two.transferFromImageBitmap(bitmapOne)
        //     console.log(bitmap)
        //     // coxs.push(bitmap)
        //     //  context.putImageData(image, (width - image.width) / 2, (heigth - image.height) / 2);
        // })
        return coxs
    }




    export {canvasOffScreen}