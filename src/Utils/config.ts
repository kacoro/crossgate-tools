
var _strPath;	// 程序路径
var _uMapCgp = []; // 调色板
var _vecImginfo = null; // 图片索引
var _imgEncode = 1024 * 1024 + 256 * 3; // 记录加密后的图片信息
var _imgData = 1024 * 1024 + 256 * 3; // 记录解密后的图片数据，有的带有调色板，调色板记录在最后
var _imgDataIdx = 0;	// 解密之后的idx
var _cgpLen = 0;		// 图片中调色板长度
export const BG_COLOR = 0x00 //默认的颜色填充，最好超过调色板的255，不然会把一些黑色背景删除了
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
    { name: "命运的开启者", info: "GraphicInfo_20.bin", file: "Graphic_20.bin" },			// 命运的开启者
    { name: "龙之沙时计", info: "GraphicInfoEx_4.bin", file: "GraphicEx_4.bin" },		// 龙之沙时计
    { name: "乐园之卵", info: "GraphicInfo_Joy_22.bin", file: "Graphic_Joy_22.bin" },	// 乐园之卵
    { name: "乐园之卵（精灵)", info: "GraphicInfoV3_18.bin", file: "GraphicV3_18.bin" },	// 乐园之卵（精灵

    // {name:"", info:".bin", file: ".bin" },

    //{ "GraphicInfoV3_18.bin", "GraphicV3_18.bin" }, // 乐园之卵（精灵
    //{ "Puk2\\GraphicInfo_PUK2_2.bin", "Puk2\\Graphic_PUK2_2.bin"},
    //{ "Puk3\\GraphicInfo_PUK3_1.bin", "Puk3\\Graphic_PUK3_1.bin" },
];
//调色板 白天00（） 傍晚01（发橙色） 黑夜02（发蓝色） 凌晨03
export const g_palet = [
    { name: '白天', value: 'palet_00.cgp' },
    { name: '傍晚', value: 'palet_01.cgp' },
    { name: '黑夜', value: 'palet_02.cgp' },
    { name: '凌晨', value: 'palet_03.cgp' },
    { name: '4号', value: 'palet_04.cgp' },
    { name: '5号', value: 'palet_05.cgp' },
    { name: '6号', value: 'palet_06.cgp' },
    { name: '7号', value: 'palet_07.cgp' },
    { name: '8号', value: 'palet_08.cgp' },
    { name: '9号', value: 'palet_09.cgp' },
    { name: '10号', value: 'palet_10.cgp' },
    { name: '11号', value: 'palet_11.cgp' },
    { name: '12号', value: 'palet_12.cgp' },
    { name: '13号', value: 'palet_13.cgp' },
    { name: '14号', value: 'palet_14.cgp' },
    { name: '15号', value: 'palet_15.cgp' },
];

interface binArraryType {
    [key: string]: any
    [index: number]: string | number | any
}
export const arrTrans = (num: number, arr: Array<any>) => { // 一维数组转换为二维数组
    const iconsArr: any[][] = []; // 声明数组
    arr.forEach((item, index) => {
        const page = Math.floor(index / num); // 计算该元素为第几个素组内
        if (!iconsArr[page]) { // 判断是否存在
            iconsArr[page] = []; ``
        }
        iconsArr[page].push(item);
    });
    return iconsArr;
}


interface infoType {
    [key: string]: any
}

export const clampNumber = (num: number, a: number, b: number) => {
    return Math.max(Math.min(num, Math.max(a, b)), Math.min(a, b));
}

export const myInfoList: infoType = {
    'id': { name: '图片序号', value: 0, isShow: true },
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

// 隐藏调色板本身其实是一些4X1的自带调色板的图片，它们的地图编号字段被重新解释了，表示使用这个调色板的动画序号，比如地图编号为0x1B680，那么在还原第0x1B680号动画的时候，就要使用该图片所带的调色板。
// 隐藏调色板存在于GraphicInfoV3_*.bin中，即使是AnimeInfo_PUK2_*.bin中的动画也是使用这里的调色板，从3840幅图片开始是隐藏调色板，不过并不是全部连续存在的，所以需要判断，除了宽4高1外，普通图片的地图编号高位为0或者3(乐园版本的地图)，调色板的则不是，可以依此辨别。 

// 乐园之卵的动画也有很大改变，同一类型的各种宠物，以前是各自有独立的图片，现在是通过改变调色板来区别的(我认为如果能将玩家角色这样简化就好了，宠物反而不应这样)，方向也简化了，右边的三个方向是左边对称过去的，这是一种偷工减料，不过也减少了文件的体积……同时也导致了数据格式的改变。动画信息文件中的数据头结构变化：

export const AnimeInfoList: infoType = {                   // 字节  说明
    //动画地址信息 长度12字节
    'id': { name: '动画序号 ', value: 0, isShow: true },    //  4   动画序号
    'ddr': { name: '地址', value: 0, isShow: true },        //  4   动画在数据文件中的起始位置
    'length': { name: '动作数目', value: 0, isShow: true }, //  2   动作数目
    'unknow': { name: '未知', value: 0, isShow: true },     //  2   未知
    //Anime 动画详细信息 长度12字节
    'direction': { name: '方向', value: 0, isShow: true },  //  2   0-7分别表示8个方向
    'action': { name: '动作 ', value: 0, isShow: true },    //  2   0-7分别表示8个方向
    'time': { name: '时间 ', value: 0, isShow: true },      //  2   该动作完成一遍所需时间，单位为毫秒
    'frames': { name: '帧数 ', value: 0, isShow: true },    //  4   该动画有多少帧，决定后面数据的大小
    'pelet': { name: '调色版编号', value: 0, isShow: true }, //2   2.0以后的 不一定需要用词来判断
    'reverse': { name: '反向', value: 0, isShow: true },       //2   2.0以后的 若为奇数表示该序列的图片左右反向
    //序列号 动画详细信息 长度10字节
    'graphicId': { name: '图片号 ', value: 0, isShow: true },// 4    该帧所使用的图片
    'graphicUnknow': { name: '未知 ', value: 0, isShow: true }// 4    该帧所使用的图片
};
//可能由于开发时的某些原因，造成存放了3遍序列，并且按前两遍解出的动画是错误的，要以第3遍为准，第2375号角色才是第0号  经过解析文件，发现其实覆盖了4遍
