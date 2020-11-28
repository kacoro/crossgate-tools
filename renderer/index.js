const { time } = require('console');
const fs = require('fs')
const { dialog } = require('electron').remote;
const path = require('path')
const { decodeImgData } = require('./utils')
const { g_ImgMap, g_palet, g_c0_15, g_c240_255, arrTrans } = require('./utils/config')
const Jimp = require('jimp');


// const rootPath = "F:\Program Files (x86)\\crossgate6.0"
// const root = fs.readdirSync('F:\Program Files (x86)\\crossgate6.0')
// console.log(root)
// const file = fs.readFileSync(rootPath+"/bin/Graphic_20.bin")
// console.log("file",file) 
var rootPath = ""
var paletArr = []; //调色板
window.onload = () => {
    var selectDirnDom = document.querySelector("#selectDir")
    infoDom = document.querySelector("#info")
    console.dir(infoDom)
    selectDirnDom.onclick = openDialog
}

const openDialog = () => {
    rootPath = dialog.showOpenDialogSync({ properties: ['openDirectory'] })
    console.log(rootPath, g_ImgMap)
    let binPath = path.join(rootPath[0], 'bin')
    console.log(binPath)
    readGraphicInfo(binPath) //读取图片信息
    //    readGraphic(binPath) //读取图片
}

//读取图片bin文件
const readGraphic = (binPath) => {
    g_ImgMap.map(item => {
        console.log(item.file)
        let palet = fs.readFileSync(path.join(binPath, item.file))
        console.log(palet)

        var i = 0;
        // for(let i =0;i<=palet.length/16;i++){
            getGraphic(0, palet.slice(i, (i + 1) * 16), palet)
        // }
    })
}

//获取图片素材
function getGraphic(i = 0, palet, palets) {
    console.log(palet)
    let json = {    //Buffer.slice末尾不包含
        magic: transBuffer(palet.slice(0, 2)), //固定为'RD'
        version: palet[2], //偶数表示未压缩，按位图存放；奇数则表示压缩过
        unKnow: palet[3],
        width: transBuffer(palet.slice(4, 8)),
        height: transBuffer(palet.slice(8, 12)),
        length: transBuffer(palet.slice(12, 16)), //数据块的长度，包括数据头本身的长度(16BYTE)
    }
    console.log(json)
    var graphic = palets.slice(16, json.length);

    console.log(graphic)
    if (json.version == 1 || json.version == 3) {// 压缩的图片
        var imageData = decodeImgData(graphic, json.length - 16)
        // console.log('data:image/bmp;base64,'+Buffer.from(imageData._imgData).toString('base64'))
        filleImgPixel(json, imageData)
    }
    //console.log('data:image/bmp;base64,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QUFBvr6+vr6+vr6+vr6+vr6+vr6+vr6+vkFBQUFBAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAEFBQUFBQb6+vr6+vr6+vr6+vr6+vr6+vr6+vr5BQUFBQUEAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAQUFBQUFBQUFBQUFBQUFBQUG+vr6+QUFBQUFBQUFBQUFBQUFBQUEAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAQUFBQUFBQUFBQUFBQUFBQUFBvr6+vkFBQUFBQUFBQUFBQUFBQUFBQQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAQUFBQUFBQUFBQUFBQUFBQUFBQb6+vr5BQUFBQUFBQUFBQUFBQUFBQUFBAAAAAAAAAAAAAAAAAAAAAAAAAABBQUFBQUFBQUFBQUFBQUFBvr6+vr6+vr6+vr6+vr5BQUFBQUFBQUFBQUFBQUFBAAAAAAAAAAAAAAAAAAAAAABBQUFBQUFBQUFBQUFBQUFBQb6+vr6+vr6+vr6+vr6+QUFBQUFBQUFBQUFBQUFBQUEAAAAAAAAAAAAAAAAAAABBQUFBQUFBQUFBQUFBQUFBQUG+vr6+vr6+vr6+vr6+vkFBQUFBQUFBQUFBQUFBQUFBQQAAAAAAAAAAAAAAAEFBQUFBQUFBQUFBQUFBQUFBQUFBvr6+vr6+vr6+vr6+vr5BQUFBQUFBQUFBQUFBQUFBQUFBQQAAAAAAAAAAAEFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBAAAAAAAAAEFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUEAAAAAQUFBQUFBQUFBQUFBQUFBQUFBQUFBvr6+vr6+vr5BQUFBQb6+vr6+vr6+vkFBQUFBQUFBQUFBQUFBQUFBQUEAQUFBQUFBQUFBQUFBQUFBQUFBQUFBQb6+vr6+vr6+QUFBQUG+vr6+vr6+vr5BQUFBQUFBQUFBQUFBQUFBQUFBQQBBQUFBQUFBQUFBQUFBQUFBQUFBQUG+vr6+vr6+vkFBQUFBvr6+vr6+vr6+QUFBQUFBQUFBQUFBQUFBQUFBQQAAAABBQUFBQUFBQUFBQUFBQUFBQUFBvr6+vr6+vr5BQUFBQb6+vr6+vr6+vkFBQUFBQUFBQUFBQUFBQUFBAAAAAAAAAEFBQUFBQUFBQUFBQUFBQUFBQUFBQUG+vr6+QUFBQUG+vr6+QUFBQUFBQUFBQUFBQUFBQUFBQUFBAAAAAAAAAAAAQUFBQUFBQUFBQUFBQUFBQUFBQUFBvr6+vkFBQUFBvr6+vkFBQUFBQUFBQUFBQUFBQUFBQUFBAAAAAAAAAAAAAAAAQUFBQUFBQUFBQUFBQb6+vr5BQb6+vr5BQUFBQb6+vr5BQb6+vr5BQUFBQUFBQUFBQUEAAAAAAAAAAAAAAAAAAABBQUFBQUFBQUFBQUG+vr6+QUG+vr6+QUFBQUG+vr6+QUG+vr6+QUFBQUFBQUFBQUEAAAAAAAAAAAAAAAAAAAAAAEFBQUFBQUFBQUFBvr6+vkFBQUFBQUFBQUFBQUFBQUFBvr6+vkFBQUFBQUFBQUEAAA')


    return json;

}

const filleImgPixel = async ({ width, height }, { _imgData, idx }) => {
    var palet = paletArr[0].map(item=>{
        return item.reverse();
    });
    var imgData = [];
    console.log(width, height, palet, _imgData, idx)
    _imgData.map((item) => {
        var pix = palet[item].map(p => {
            p = p.toString(16)
            if (p < 10) {
                p = '0' + p
            } else {
                p = p
            }
            if(Number('0x'+p)>0){
                return p;
            }
            
        }).join('');
        
        imgData.push(pix !=''? '#'+ pix:'');
    })


    var mycanvas = document.getElementById('tiledCanvas')
    var myImg = document.getElementById('tiledImg')
    var ctx = mycanvas.getContext('2d')
    var imageData = arrTrans(width, imgData);
    let image = await new Jimp(width, height, function (err, image) {
        if (err) throw err;
        arrTrans(width, imgData).forEach((row, y) => {
            row.forEach((color, x) => {
                image.setPixelColor(Jimp.cssColorToHex(color), x, height-y-1);
            });
        });
        var imageData2 = new ImageData(
            Uint8ClampedArray.from(image.bitmap.data),
            image.bitmap.width,
            image.bitmap.height
        );
        ctx.putImageData(imageData2, 0, 0);

        image.write('test.bmp', (err) => {
          if (err) throw err;
        });
    });
    // var buffer = new Buffer.from(imgData.flat());
}



// 读取通过bin文件读取图片信息
const readGraphicInfo = (binPath) => {
    g_ImgMap.map(item => {
        let palet = fs.readFileSync(path.join(binPath, item.info))
        console.log(palet)
        infoDom = document.querySelector("#info")

        let i = 0, length = palet.length / 40
        infoDom.innerText = length
        //    for(let i =0;i<=palet.length/40;i++){
        getInfo(0, palet.slice(i, (i + 1) * 40))
        //    }
    })
}

//获取图片素材
function getInfo(i = 0, palet) {
    let json = {    //Buffer.slice末尾不包含
        id: transBuffer(palet.slice(0, 4)),   //图片的编号 0开始
        ddr: transBuffer(palet.slice(4, 8)), //指明图片在数据文件中的起始位置 0 开始
        length: transBuffer(palet.slice(8, 12)), //图片数据块的大小 块长度;
        x: transBuffer(palet.slice(12, 16), 'BIN'),  //偏移量X;显示图片时，横坐标偏移X
        y: transBuffer(palet.slice(16, 20), 'BIN'),  //偏移量Y
        width: transBuffer(palet.slice(20, 24)),
        height: transBuffer(palet.slice(24, 28)),
        east: palet[28],
        south: palet[29],
        flag: palet[30],
        unKnow: palet.slice(31, 36),
        tileId: transBuffer(palet.slice(36, 40)),
    }
    console.log(json)
}

function transBuffer(palet, encode = 'DEC') {//先把数组倒序，转化为二进制，拼接之后再进行进制转化，默认不转。BIN_OCT_HEX_DEC
    var str = ""
    palet = palet.reverse().map(item => {
        str += item.toString(2)
    })
    if (encode == 'BIN') {
        // 首位是1，为负数 减一取反
        var flag = false
        if (str.slice(0, 1) == "1") {//首位是1 为负数
            //补码
            str = str.slice(1, str.length)
            var index = 0
            str = str.split("").reverse().map((item, i) => {
                if (!flag && item != 0) {//找到第一个1。不进行操作
                    flag = true
                    item = 0
                    index = i
                } else {

                }
                return item
            })
            for (i = 0; i < index; i++) {
                str[i] = 1
            }
            str = str.map(s => {
                return s > 0 ? s = 0 : s = 1
            })
            str = str.reverse().join("").replace(/(^0*)/g, "")
            return parseInt("-" + str, 2)
        }
    }
    str = str.replace(/(^0*)/g, "");
    return str == '' ? 0 : parseInt(str, 2)
}

const readPalet = (binPath) => {

    g_palet.map(item => {
        let palet = fs.readFileSync(path.join(binPath, "pal", item.value))

       
        palet = palet.slice(0,palet.length-13*3).toJSON().data
        
        palet = [...g_c0_15,...palet,...g_c240_255]

        palet = arrTrans(3,palet)
       
        paletArr.push(palet);
        
    })
}
// testRead()

function testRead() {
    let binPath = path.join("F:\Program Files (x86)\\crossgate6.0", 'bin')
    readGraphicInfo(binPath)
    readPalet(binPath); //读取调色板
    readGraphic(binPath)
}



