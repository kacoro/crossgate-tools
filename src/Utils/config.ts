var _strPath;	// 程序路径
var _uMapCgp = []; // 调色板
var _vecImginfo = null; // 图片索引
var _imgEncode = 1024 * 1024 + 256 * 3; // 记录加密后的图片信息
var _imgData = 1024 * 1024 + 256 * 3; // 记录解密后的图片数据，有的带有调色板，调色板记录在最后
var _imgDataIdx = 0;	// 解密之后的idx
var _cgpLen = 0;		// 图片中调色板长度

var _imgPixel = 1024 * 1024; // 记录图片数据 最大支持4M的图片 如果有图片过大，修改这里

var _tiledFilesJson; // 存储图片的所有信息
// *info*.bin 文件格式
const imgInfoHead =
{
	id: 0,
	addr: 0,  // 在图像文件中的偏移
	len: 0,	// 长度
	xOffset: 0,		//long  在游戏内的偏移量x
	yOffset: 0,		//long 在游戏内的偏移量y
	width: 0, //int
	height: 0,  //int
	tileEast: 0,// char 地图上横向几格
	tileSouth: 0,//char 竖向几格
	flag: 0, //char 是否可以同行
	unKnow: new Array(5), //[5]
	tileId: 0			// long 所属的地图tile的id
};

// 图像bin 文件格式
const imgData =
{
	cName: new Array(2),//= new Array(2),
	cVer: "",	// 1压缩
	cUnknow: "",
	width: 0,
	height: 0,
	len: 0	// 包含自身头的总长度，后续跟char数组
}; // + char* len = size - 16

// #pragma pack()


export const DEFAULT_CPG_LEN = 768		// 调色板文件长度256色，每个颜色3个字节存储BGR
// 游戏指定的调色板0-15 BGR
export const g_c0_15 = [
	0x00, 0x00, 0x00,
	0x80, 0x00, 0x00,
	0x00, 0x80, 0x00,
	0x80, 0x80, 0x00,
	0x00, 0x00, 0x80,
	0x80, 0x00, 0x80,
	0x00, 0x80, 0x80,
	0xc0, 0xc0, 0xc0,
	0xc0, 0xdc, 0xc0,
	0xa6, 0xca, 0xf0,
	0xde, 0x00, 0x00,
	0xff, 0x5f, 0x00,
	0xff, 0xff, 0xa0,
	0x00, 0x5f, 0xd2,
	0x50, 0xd2, 0xff,
	0x28, 0xe1, 0x28,
];
// 游戏指定的调色板240-255 BGR
export const g_c240_255 = [
	0xf5, 0xc3, 0x96,
	0x1e, 0xa0, 0x5f,
	0xc3, 0x7d, 0x46,
	0x9b, 0x55, 0x1e,
	0x46, 0x41, 0x37,
	0x28, 0x23, 0x1e,
	0xff, 0xfb, 0xf0,
	0x3a, 0x6e, 0x5a,
	0x80, 0x80, 0x80,
	0xff, 0x00, 0x00,
	0x00, 0xff, 0x00,
	0xff, 0xff, 0x00,
	0x00, 0x00, 0xff,
	0xff, 0x80, 0xff,
	0x00, 0xff, 0xff,
	0xff, 0xff, 0xff,
];

// 图片索引与图片库的对照表
// 已经包含所有图片库
// Anime开头的相当于是指定以下库的动作，相当于是配置文件，这个就不解析了，必要性不大
export const g_ImgMap = [
	{name:"命运的开启者", info: "GraphicInfo_20.bin", file: "Graphic_20.bin" },			// 命运的开启者
	{name:"龙之沙时计", info:"GraphicInfoEx_4.bin", file: "GraphicEx_4.bin" },		// 龙之沙时计
	{name:"乐园之卵", info:"GraphicInfo_Joy_22.bin", file: "Graphic_Joy_22.bin" }	// 乐园之卵
	
	//{ "GraphicInfoV3_18.bin", "GraphicV3_18.bin" }, // 乐园之卵（精灵
	//{ "Puk2\\GraphicInfo_PUK2_2.bin", "Puk2\\Graphic_PUK2_2.bin"},
	//{ "Puk3\\GraphicInfo_PUK3_1.bin", "Puk3\\Graphic_PUK3_1.bin" },
];
//调色板 白天00（） 傍晚01（发橙色） 黑夜02（发蓝色） 凌晨03
export const g_palet = [
	 {name:'白天',value:'palet_00.cgp'},
	 {name:'傍晚',value:'palet_01.cgp'},
	 {name:'黑夜',value:'palet_02.cgp'},
	 {name:'凌晨',value:'palet_03.cgp'}
];  

interface binArraryType {
    [key: string]: any
    [index:number]:string | number| any
 } 
export const arrTrans =(num:number, arr:Array<any>) => { // 一维数组转换为二维数组
	const iconsArr: any[][] = []; // 声明数组
	arr.forEach((item, index) => {
	  const page = Math.floor(index / num); // 计算该元素为第几个素组内
	  if (!iconsArr[page]) { // 判断是否存在
		iconsArr[page] = [];
	  }
	  iconsArr[page].push(item);
	});
	return iconsArr;
  }
// const config = {
// 	g_ImgMap,g_palet, g_c0_15, g_c240_255,arrTrans, MAX_IMG_SIZE, DEFAULT_CPG_LEN, imgData, imgInfoHead
// }

type strType = string | any[];
type itemType =  any |   any[];

export function transBuffer(palet: any, encode:string = 'DEC') {//先把数组倒序，转化为二进制，拼接之后再进行进制转化，默认不转。BIN_OCT_HEX_DEC
   
    // 43D // 1085 //10000111101 
    //00100111101
    var str:strType = ""
    
    if (encode == 'BIN') {
        palet = palet.reverse().map( (item:itemType) => {
            str += item.toString(2)
        })
        // 首位是1，为负数 减一取反
        var flag = false
        if (str.slice(0, 1) == "1") {//首位是1 为负数
            //补码
            str = str.slice(1, str.length)
            var index = 0
            str = str.split("").reverse().map((item:any, i) => {
                if (!flag && item != 0) {//找到第一个1。不进行操作
                    flag = true
                    item = 0
                    index = i
                } else {

                }
                return item
            })
            for (let i:number = 0; i < index; i++) {
                str[i] = 1
            }
            str = str.map(s => {
                return s > 0 ? s = 0 : s = 1
            })
            str = str.reverse().join("").replace(/(^0*)/g, "")
            return parseInt("-" + str, 2)
        }
    }

    palet = palet.reverse().map( (item:itemType) => {
        if(item<16){
            
            str += "0"+item.toString(16)
        }else{
            str += ""+item.toString(16)
        }
        if(encode=="drr"){
            console.log("item:",item,item.toString(16))
        }
    })
    str =  str.replace(/(^0*)/g, "");
    if(encode=="drr"){
        console.log("hex:",str)
    }
   
    return str == '' ? 0 : parseInt(str, 16)
}
interface infoType {
    [key: string]: any
}

export const clampNumber = (num: number,a: number,b: number)=>{
    return Math.max(Math.min(num, Math.max(a, b)), Math.min(a, b));
}

export const myInfoList: infoType = {
    'id': { name: '图片编号', value: 0, isShow: true },
    'ddr': { name: '起始位置', value: 0, isShow: true },  //图片在数据文件中的起始位置 0 开始
    'length': { name: '图片块长度', value: 0, isShow: true },   //图片数据块的大小 块长度
    'x': { name: 'X偏移', value: 0, isShow: true },          //偏移量X;显示图片时，横坐标偏移X
    'y': { name: 'Y偏移', value: 0, isShow: true },          //偏移量y;显示图片时，横坐标偏移y
    'width': { name: '图片宽度', value: 0, isShow: true },
    'height': { name: '图片高度', value: 0, isShow: true },
    'east': { name: '东', value: 0, isShow: true },
    'south': { name: '南', value: 0, isShow: false },
    'flag': { name: '地图属性', value: true, isShow: true },  //是否可以穿越
    'unKnow': { name: '未知', value: 0, isShow: false },
    'tileId': { name: '地图编号', value: 0, isShow: true }
};

export function decodeImgData(graph: any[], len: number) {

    let p: any[] = []
    // console.log(graph)
    // 图片解密 Run-Length压缩
    var iPos = 0;
    var idx = 0;
    var _imgData = []
    graph.map((item: string | number) => {
        item = item.toString(16)
        if (Number(item) < 10) {
            item = '0x0' + item
        } else {
            item = '0x' + item
        }
        p.push(item)
    })
    //console.log(p)

    function generateImage(count: number, item: any) {
        for (let i = 0; i < count; ++i) {
            _imgData[idx++] = item
        }

    }

    while (iPos < len) {

        let condistion = (p[iPos] & 0xf0).toString(16)

        switch (condistion) {
            case '0': { //0n 长度为n的字符串
                let count = p[iPos] & 0x0f;
                ++iPos;
                //console.log('s 0 , '+p[iPos] +' count:' ,count)
                for (let i = 0; i < count; ++i) {
                    _imgData[idx++] = graph[iPos++]
                }
            }
                break
            case '10': {//1n 长度为n*0x100+m的字符串
                let count = (p[iPos] & 0x0f) * 0x100 + Number(p[iPos + 1]);
                iPos += 2
                //console.log('s 10 , '+p[iPos] +' '+p[iPos + 1]+' count:' ,count)
                for (let i = 0; i < count; ++i) {
                    _imgData[idx++] = graph[iPos++]
                }
            }
                break
            case '20': {
                // 0x2n 第二个字节x，第三个字节y，第四个字节c，代表n*0x10000+x*0x100+y个字符
                let count = (p[iPos] & 0x0F) * 0x10000 + Number(p[iPos + 1]) * 0x100 + Number(p[iPos + 2]);
                iPos += 3
                //console.log('s 20',p[iPos],p[iPos + 1],p[iPos + 2],' count:' ,count)
                for (let i = 0; i < count; ++i) {
                    _imgData[idx++] = graph[iPos++]
                }
            }
                break
            case '80': {
                let count = p[iPos] & 0x0F;
                //console.log('s 80',p[iPos],'count:',count)
                for (let i = 0; i < count; ++i) {
                    _imgData[idx++] = graph[iPos + 1]
                }
                iPos += 2;
            }
                break
            case '90': {
                let count = (p[iPos] & 0x0F) * 0x100 + Number(p[iPos + 2]);
                //console.log('s 90',p[iPos],p[iPos + 2],'count:',count)
                for (let i = 0; i < count; ++i) {
                    _imgData[idx++] = graph[iPos + 1]
                }
                iPos += 3;
            }
                break
            case 'a0': {
                let count = (p[iPos] & 0x0F) * 0x10000 + Number(p[iPos + 2]) * 0x100 + Number(p[iPos + 3]);
                //console.log('s a0',p[iPos],p[iPos + 2],p[iPos + 3],'count:',count)
                for (let i = 0; i < count; ++i) {
                    _imgData[idx++] = graph[iPos + 1]
                }
                iPos += 4;
            }
                break
            case 'c0':
                {
                    let count = p[iPos] & 0x0F;
                    //console.log('s c0',p[iPos],'count:',count)
                    for (let i = 0; i < count; ++i) {
                        _imgData[idx++] = 0
                    }
                    iPos += 1;
                }
                break
            case 'd0': {
                let count = (p[iPos] & 0x0F) * 0x100 + Number(p[iPos + 1]);
                //console.log('s d0',p[iPos],p[iPos + 1],'count:',count)
                for (let i = 0; i < count; ++i) {
                    _imgData[idx++] = 0
                }
                iPos += 2;
            }
                break
            case 'e0': {
                let count = (p[iPos] & 0x0F) * 0x10000 + Number(p[iPos + 1]) * 0x100 + Number(p[iPos + 2]);
                //console.log('s e0',p[iPos],p[iPos + 1],p[iPos + 2],'count:',count)
                for (let i = 0; i < count; ++i) {
                    _imgData[idx++] = 0
                }
                iPos += 3;
            }
                break
            default:
                // iPos++;
                break
        }
    }
    //console.log(idx,iPos)
    return { idx, _imgData };
}