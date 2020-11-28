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

const MAX_IMG_SIZE = 1024 * 1024

const DEFAULT_CPG_LEN = 768		// 调色板文件长度256色，每个颜色3个字节存储BGR
// 游戏指定的调色板0-15 BGR
const g_c0_15 = [
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
const g_c240_255 = [
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
const g_ImgMap = [
	{ info: "GraphicInfo_20.bin", file: "Graphic_20.bin" }			// 命运的开启者
	//{ "GraphicInfo_Joy_22.bin", "Graphic_Joy_22.bin" },	// 乐园之卵
	//{ "GraphicInfoEx_4.bin", "GraphicEx_4.bin" },		// 龙之沙时计
	//{ "GraphicInfoV3_18.bin", "GraphicV3_18.bin" }, // 乐园之卵（精灵
	//{ "Puk2\\GraphicInfo_PUK2_2.bin", "Puk2\\Graphic_PUK2_2.bin"},
	//{ "Puk3\\GraphicInfo_PUK3_1.bin", "Puk3\\Graphic_PUK3_1.bin" },
];
//调色板 白天00（） 傍晚01（发橙色） 黑夜02（发蓝色） 凌晨03
const g_palet = [
	 {name:'白天',value:'palet_00.cgp'}
	// {name:'傍晚',value:'palet_01.cgp'},
	// {name:'黑夜',value:'palet_02.cgp'},
	// {name:'凌晨',value:'palet_03.cgp'}
];  
function arrTrans(num, arr) { // 一维数组转换为二维数组
	const iconsArr = []; // 声明数组
	arr.forEach((item, index) => {
	  const page = Math.floor(index / num); // 计算该元素为第几个素组内
	  if (!iconsArr[page]) { // 判断是否存在
		iconsArr[page] = [];
	  }
	  iconsArr[page].push(item);
	});
	return iconsArr;
  }
const config = {
	g_ImgMap,g_palet, g_c0_15, g_c240_255,arrTrans, MAX_IMG_SIZE, DEFAULT_CPG_LEN, imgData, imgInfoHead
}



module.exports = config