function decodeImgData(graph, len) {

    let p = []

    // 图片解密 Run-Length压缩
    var iPos = 0;
    var idx = 0;
    var _imgData = []
    graph.map(item => {
        item = item.toString(16)
        if (item < 10) {
            item = '0x0' + item
        } else {
            item = '0x' + item
        }
        p.push(item)
    })
    //console.log(p)

    function generateImage(count, item) {
        for (let i = 0; i < count; ++i) {
            _imgData[idx++] = item
        }

    }

    while (iPos < len) {

        let condistion = (p[iPos] & 0xf0).toString(16)

        switch (condistion) {
            case '0': {
                let count = p[iPos] & 0x0f;
                iPos++
                //console.log('s 0 , '+p[iPos] +' count:' ,count)
                for (let i = 0; i < count; ++i) {
                    _imgData[idx++] = graph[iPos++]
                }
            }
                break
            case '10': {
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
                iPos++;
                break
        }
    }
    //console.log(idx,iPos)
    return { idx, _imgData };
}

const utils = {
	decodeImgData
}

module.exports  = utils