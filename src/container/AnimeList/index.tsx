import React, { useMemo, useState, useRef, useEffect, useCallback } from 'react';
import List from '@material-ui/core/List';
import Grid from '@material-ui/core/Grid';
import Paper from '@material-ui/core/Paper';
import FormControl from '@material-ui/core/FormControl';
import Select from '@material-ui/core/Select';
import InputLabel from '@material-ui/core/InputLabel';
import InputBase from '@material-ui/core/InputBase';
import IconButton from '@material-ui/core/IconButton';
import Button from '@material-ui/core/Button';
import Remove from '@material-ui/icons/Remove';
import Add from '@material-ui/icons/Add';
import { readAnimesInfo, getAnimeInfo, getAnime, hiddenPaletInfoType, getframe } from '../../Utils/anime'
import { connect } from 'react-redux';
import { g_ImgMap, myInfoList, AnimeInfoList } from '../../Utils/config'
import { throttle, debounce } from '@kacoro/utils'
import { exportCanvasAsPNG, MIME_TYPE, canvasOffScreen } from "../../Utils/canvas"
import { Card, Checkbox, FormControlLabel } from '@material-ui/core';
import PaletEditor from '../PaletEditor'
import { versionType } from 'src/Utils/version';
import { AnimeInfoPanel, infoType } from '../../Component/AnimeInfoPanel';
import { usePanelstyles } from '../../Component/usePanelstyles';
import { allAnimeType } from 'src/Utils/anime';
import { graphicInfo } from '../../Utils/readImages';
import { genGif256, frameType } from '../../Utils/image/gif';
import { saveFile } from '../../Utils/file'
import { bytes2Int } from '../../Utils/covert';
type Props = {
    folder?: string;
    currentPalet?: string | number,
    palets: Buffer,
    tempPalet: Buffer,
    allVersion: versionType[],
    allAnime: allAnimeType[],
    hiddenPalet: hiddenPaletInfoType
};

export interface Bitmap {
    data: Buffer;
    width: number;
    height: number;
}
export function AnimeList(props: Props) {
    const { folder, palets, currentPalet, tempPalet, allVersion, allAnime, hiddenPalet } = props
    const classes = usePanelstyles();
    const [acount, SetAccount] = useState({ key: 'acount', name: '动画总数', value: 0 })
    const [infos, SetInfos] = useState(null);
    const [extendInfo, SetExtendInfo] = useState(null);
    const canvas = useRef(null)
    const container = useRef(null)

    const [checked, setChecked] = React.useState(true);
    const animesInfo = useRef(Buffer.allocUnsafe(0))
    const graphicsInfo = useRef(Buffer.allocUnsafe(0))
    const animePath = useRef('')
    const graphicPath = useRef('')
    const rAF = useRef(null)
    // const [image, SetImage] = useState({} as Bitmap);
    const [state, setState] = React.useState<{ version: string | number; imageId: number }>({
        version: '',
        imageId: 0,
    });
    const [loading, setLoading] = useState(false)
    const [dbValue, saveToDb] = useState(0);

    const myPalet = useMemo(() => {
        if (tempPalet.length > 0) {
            return tempPalet
        }
        return palets
    }, [palets, tempPalet])
    const debouncedSaveByCallBack: Function = useCallback(throttle((nextValue: number) => {
        setState({
            ...state,
            imageId: nextValue,
        });
        saveToDb(nextValue)

    }, 50), []); // will be created only once initially 1000 / 24


    const handleChangeChecked = (event: { target: { checked: boolean | ((prevState: boolean) => boolean); }; }) => {
        setChecked(event.target.checked);
    };
    const handleChange = (event: React.ChangeEvent<{ name?: string; value: unknown }>) => {
        const name = event.target.name as keyof typeof state;
        if (name == 'imageId') {
            let value = Number(event.target.value);
            if (value < 0) {
                value = acount.value - 1
            }
            if (value >= acount.value) {
                value = 0
            }
            debouncedSaveByCallBack(value);
        } else {
            setState({
                ...state,
                [name]: event.target.value as string,
            });
        }
    };

    //切换版本 获取二进制图片信息和图片数据
    useEffect(function checkVersion() {

        if (folder != '' && currentPalet != "" && state.version != "" && !loading) {
            //查找图片信息
            //  let data = readGraphicInfo(folder, state.version);
            //  console.log(data);
            setLoading(true);
            (async () => {
                animesInfo.current = null;
                animePath.current = null;
                console.log("version")
                let data = await readAnimesInfo(folder, allAnime[state.version as number]);
                SetAccount({
                    ...acount,
                    'value': data.length,
                })
                console.log('Anime', data)
                if (dbValue > data.length) {//如果大，则需要重置
                    saveToDb(0);
                }

                animesInfo.current = data.animesInfo
                animePath.current = data.animePath
                graphicsInfo.current = data.graphicsInfo
                graphicPath.current = data.graphicPath
                setLoading(false)

            })();

            // SetGraphicInfo(info=> {return data.graphicInfo})
            //  SetGraphic(grahic=>data.graphic)
        }

    }, [state.version]);
    //获取动画信息
    useEffect(function () {
        if (animesInfo.current && animesInfo.current.length != 0) {
            // console.log("info")
            (async () => {
                getAnimeInfo({ cancel: true })
                let info = await getAnimeInfo({ index: dbValue, animesInfo: animesInfo.current })
                SetInfos(info)
                SetExtendInfo((data: any) => {
                    return { ...data,hiddenPalet:null }
                })

            })()

        }
    }, [dbValue, animesInfo.current])

    // 获取动画数据
    useEffect(function () {
        if (animePath.current && animePath.current.length != 0 && infos) {

            (async () => {
                let _palet = palets
                if (tempPalet.length > 0) {
                    _palet = tempPalet
                }
                let data: any = await getAnime(infos, animePath.current, _palet, graphicsInfo.current, graphicPath.current, hiddenPalet)
                // console.log("getImage",image)
                // console.log(data)
                SetExtendInfo(data)
                //console.log(image);

            })();
        }
    }, [infos, palets, tempPalet]);

    const updateInfo = (name: string, value: number) => {
        SetExtendInfo((data: any) => {
            let info = { ...data.info, [name]: value }
            return { ...data, info }
        })
    }

    // 获取图片数据
    useEffect(() => {
        if (animePath.current && animePath.current.length != 0 && infos) {

            (async () => {
                let _palet = palets
                if (tempPalet.length > 0) {
                    _palet = tempPalet
                }
                let { images,imageDatas, graphicInfos, gifInfo, time, frames, reverse }: any = await getframe(extendInfo.info.action, extendInfo.info.direction, extendInfo.AnimeGroup, extendInfo.hiddenPalet, _palet, graphicsInfo.current, graphicPath.current)
                // console.log("getImage",image)
                SetExtendInfo((data: { images: any; info: any }) => {
                    let info = { ...data.info, time, frames, reverse }
                    return { ...data, images: images,imageDatas, graphicInfos, gifInfo, info }
                })
                //console.log(image);

            })();
        }
    }, [extendInfo?.info?.action, extendInfo?.info?.direction]);



    //生成图片
    useEffect(() => {

        console.log("images", extendInfo?.info?.reverse)
        if (canvas.current && extendInfo && extendInfo.images && extendInfo.gifInfo && extendInfo.images.length > 0) {
            const context = canvas.current.getContext("2d");
            let gifInfo = extendInfo.gifInfo
            const width = gifInfo.width
            const height = gifInfo.height
            // console.log(extendInfo.gifInfo)
            cancelAnimationFrame(rAF.current);
            // context.clearRect(0, 0, width, height)
            // cancelAnimationFrame(rAF.current);
            // context.clearRect(0, 0, width, heigth)
            canvas.current.width = width
            canvas.current.height = height
            if (extendInfo?.info?.reverse % 2) {
                console.log(extendInfo.info.reserve)
                context.translate(canvas.current.width, 0);
                context.scale(-1, 1); //左右镜像翻转
            }
            // context.save();
            // console.dir(container.current.clientWidth)
            let i = 0
            let info = extendInfo.info
            let images = extendInfo.images
            let imagedatas: [Promise<ImageBitmap>] = images.map((item: any) => {
                let imageData = new ImageData(
                    Uint8ClampedArray.from(item.data),
                    item.width,
                    item.height
                );
                return createImageBitmap(imageData, 0, 0, item.width, item.height)
            })

            Promise.all(imagedatas).then(function (sprites) {
                // Draw each sprite onto the canvas
                // console.log({ sprites })
                // (milliseconds / (desc.v1.duration / desc.v1.frames)) % desc.v1.frames;
                rAF.current = requestAnimationFrame(() => {
                    // (milliseconds / (desc.v1.duration / desc.v1.frames)) % desc.v1.frames
                    let timestamp = info.time / info.frames
                    let start = 0;
                    renderCanvas(context, start, 0, gifInfo.frames, sprites, timestamp, width, height, true)
                })
            });

        } else {

        }
    }, [extendInfo?.images]);


    const getOffset = (_graphicInfo: graphicInfo, width: number, height: number) => {
        let offset = {
            x: 0, y: 0
        }
        
        let center = {
            x: (canvas.current.width) / 2,
            y: (canvas.current.height) / 2
        }
        // console.log("center:", center, _graphicInfo)
        offset.x = _graphicInfo.x
        offset.y = _graphicInfo.y
        // console.log("offset:", offset)
        return offset
    }

    const renderCanvas = useCallback((context: CanvasRenderingContext2D, start: number = null, i: number,
        graphicInfos: graphicInfo[], sprites: ImageBitmap[], timestamp: number, width: number, height: number,
        repeat = false, scale = 1) => {
        if (!start) {
            start = Date.now()
            // console.time("start")
        }

        let durTime = Date.now() - start
        // console.log(durTime)

        //默认从第一帧开始
        if (durTime >= timestamp || i == 0) {

            let index = i % sprites.length
            // console.log(graphicInfos[index].x)
            let offset = getOffset(graphicInfos[index], width, height)
            let image = sprites[index]
            context.clearRect(0, 0, container.current.clientWidth, container.current.clientHeight)
            // if(extendInfo?.info?.reverse==5){
            //     console.log(extendInfo?.info?.reverse)
            //     context.translate(canvas.current.width/2, 0);
            //     context.scale(-1, 1); //左右镜像翻转
            // }
            context.drawImage(image, offset.x, offset.y,// 2+ offset.y,
                // image.width,
                // image.height,
            )
            // context.putImageData(image, (width - image.width) / 2, (heigth - image.height) / 2);
            // console.log({ start,i })
            // console.timeEnd("start")
            i++
            start = null
            if (repeat && typeof repeat == 'number' && (index == sprites.length - 1)) {
                // console.log({repeat})
                repeat--
            }
        }


        if (repeat || i < sprites.length) {

            rAF.current = requestAnimationFrame(() => {
                renderCanvas(context, start, i, graphicInfos, sprites, timestamp, width, height, repeat)
            })
        }

    }, [extendInfo?.images]);



    const handleSave = () => {
        if (extendInfo && extendInfo.gifInfo) {
            let gifInfo = extendInfo.gifInfo

            let fileName = infos.id+'.gif';
            let _palette = palets
            if (tempPalet.length > 0) {
                _palette = tempPalet
            }
            if (extendInfo.hiddenPalet) {
                _palette = extendInfo.hiddenPalet
            }
            console.log(extendInfo.hiddenPalet)
            let palette:number[] =[]
            for (let index = 0; index < _palette.length; index++) {
                let color =  _palette[index] as unknown as Uint8Array
                let rgb = "0x"+ bytes2Int(color.reverse()).toString(16)
                // let rgb = "0x"+  0xff & color[0].toString(16)  + 0xff & color[1].toString(16) + 0xff & color[2].toString(16)

                palette.push(parseInt(rgb))
            }
            // let palette:number[] = _palette.map((item )=>{
            //     let color =  item as unknown as number[]
            //     return color[0] << 16 & 0xff + color[1] << 8 & 0xff + color[2]  & 0xff
            // })
            console.log(gifInfo,palette)
            console.log(extendInfo.imageDatas)
             let data = genGif256(gifInfo.width,gifInfo.height,extendInfo.info.time,palette,gifInfo.frames,extendInfo.imageDatas)
             console.log(data)
              saveFile(data,fileName)
        }   

        // exportCanvasAsPNG(mimeType, canvas.current, fileName, extendInfo)
    }

    return (
        <div className={classes.root}>
            <div className={classes.leftSide}>
                <FormControl className={classes.formControl}>
                    <InputLabel htmlFor="age-native-simple">版本</InputLabel>
                    <Select
                        native
                        value={state.version}
                        onChange={handleChange}
                        inputProps={{
                            name: 'version',
                            id: 'version-native',
                        }}
                    >
                        <option aria-label="None" value="" />
                        {allAnime.map((item, index) => {
                            return <option key={index} value={index}>{item.name}</option>
                        })}

                    </Select>
                </FormControl>
                <Paper component="form" className={classes.search} >
                    <IconButton onClick={() => {
                        let value = state.imageId > 0 ? Number(state.imageId) - 1 : acount.value - 1
                        debouncedSaveByCallBack(value)
                    }}>
                        <Remove color="primary" />
                    </IconButton>
                    <InputBase id="filled-basic" className={classes.input} placeholder="物理编号"
                        inputProps={{ 'aria-label': '物理编号' }} onKeyDown={(event) => {
                            if (event.key === 'Enter') {

                                // updateImage(event.target.value)
                                event.stopPropagation;
                                event.preventDefault()
                                return false;
                            }
                        }} type="number" value={state.imageId} name="imageId" onChange={handleChange} />
                    <IconButton onClick={() => {
                        let value = state.imageId >= acount.value - 1 ? 0 : Number(state.imageId) + 1;

                        debouncedSaveByCallBack(value)
                    }

                    }>
                        <Add color="primary" />
                    </IconButton>
                </Paper>
                <Card>
                    {extendInfo && <Button color="primary" onClick={handleSave}>保存</Button>}

                    <FormControlLabel
                        label="背景透明"
                        control={
                            <Checkbox
                                defaultChecked
                                color="primary"
                                onChange={handleChangeChecked}
                                inputProps={{ 'aria-label': '背景透明' }}
                            />
                        }
                    />
                </Card>

                <List >
                    <Grid container spacing={1} className={classes.grid}>
                        <Grid item xs={6} className={classes.gridLeft} >{acount.name}</Grid><Grid xs={6} item className={classes.gridRight}>{acount.value}</Grid>
                    </Grid>
                    {extendInfo && <AnimeInfoPanel
                        updateInfo={updateInfo}
                        extendInfo={extendInfo.info} info={infos} />}
                </List>
            </div>
            <div className={classes.Container} ref={container}>
                <canvas ref={canvas} className={classes.canvas} ></canvas>
            </div>
            <div className={classes.rightSide}>
                <PaletEditor />
            </div>
        </div>
    );
}

const mapStateToProps = (state: { folder: any; currentPalet: any, palets: Buffer, tempPalet: Buffer, allVersion: versionType[], allAnime: allAnimeType[], hiddenPalet: hiddenPaletInfoType }) => {
    return {
        folder: state.folder,
        currentPalet: state.currentPalet,
        palets: state.palets,
        tempPalet: state.tempPalet,
        allVersion: state.allVersion,
        allAnime: state.allAnime,
        hiddenPalet: state.hiddenPalet
    }
}

export default connect(mapStateToProps)(AnimeList)