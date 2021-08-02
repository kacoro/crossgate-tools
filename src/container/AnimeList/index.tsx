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
import { readGraphicInfo, getImageInfo, getImage } from '../../Utils/readImages'
import { readAnimesInfo, getAnimeInfo, getAnime } from '../../Utils/anime'
import { connect } from 'react-redux';
import { g_ImgMap, myInfoList } from '../../Utils/config'
import { throttle, debounce } from '@kacoro/utils'
import { exportCanvasAsPNG, MIME_TYPE } from "../../Utils/canvas"
import { Card, Checkbox, FormControlLabel } from '@material-ui/core';
import PaletEditor from '../PaletEditor'
import { versionType } from 'src/Utils/version';
import { AnimeInfoPanel, infoType } from '../../Component/AnimeInfoPanel';
import { usePanelstyles } from '../../Component/usePanelstyles';
import { allAnimeType } from 'src/Utils/anime';


type Props = {
    folder?: string;
    currentPalet?: string | number,
    palets: Buffer,
    tempPalet: Buffer,
    allVersion: versionType[],
    allAnime: allAnimeType[]
};

export interface Bitmap {
    data: Buffer;
    width: number;
    height: number;
}
export function AnimeList(props: Props) {
    const { folder, palets, currentPalet, tempPalet, allVersion, allAnime } = props
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
    const [loadingImg, setLoadingImg] = useState(false)
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

    }, 1000 / 24), []); // will be created only once initially


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
    //获取图片信息
    useEffect(function checkGraphicID() {
        if (animesInfo.current && animesInfo.current.length != 0) {
            // console.log("info")
            let info: infoType = getAnimeInfo(dbValue, animesInfo.current);
            SetInfos(info)
        }
    }, [dbValue, animesInfo.current])

    // 获取图片数据
    useEffect(function checkGraphicInfo() {
        if (animePath.current && animePath.current.length != 0 && infos) {

            (async () => {
                let _palet = palets
                if (tempPalet.length > 0) {
                    _palet = tempPalet
                }
                let data: any = await getAnime(infos, animePath.current, _palet, graphicsInfo.current, graphicPath.current)
                // console.log("getImage",image)
                SetExtendInfo(data)
                //console.log(image);

            })();
        }
    }, [infos, palets, tempPalet]);

    //生成图片
    useEffect(() => {
        // console.log(image.width)
        console.log("images", extendInfo)
        if (extendInfo && extendInfo.images.length > 0) {
            cancelAnimationFrame(rAF.current);
            const context = canvas.current.getContext("2d");

            const width = container.current.clientWidth
            const heigth = container.current.clientHeight
            context.clearRect(0, 0, width, heigth)
            canvas.current.width = width
            canvas.current.height = heigth
            // context.save();
            // console.dir(container.current.clientWidth)
            let i = 0
            let info = extendInfo.info
            let images = extendInfo.images
            let imagedatas = images.map((item: any) => {
                return new ImageData(
                    Uint8ClampedArray.from(item.data),
                    item.width,
                    item.height
                );
            })

            console.log(imagedatas)

            rAF.current = requestAnimationFrame(() => {
                let timestamp = info.time / info.frames
                let start = 0;
                renderCanvas(context, start, 0, imagedatas, timestamp, width, heigth)
            })


        }
    }, [extendInfo]);

    const canvasOffscreen = useCallback((imagedatas)=>{
    },[extendInfo])

    const renderCanvas = useCallback((context: CanvasRenderingContext2D, start: number=null, i: number,
        imagedatas: ImageData[], timestamp: number, width: number, heigth: number,repeat=false) => {
        if(!start) {
            start = Date.now()
            console.time("start")
        }
        // console.log(Date.now() - start, timestamp)
        
         let durTime = Date.now() - start
         console.log(durTime)

         //默认从第一帧开始
        if (durTime >= timestamp ||i==0) {
            console.timeEnd("start")
            let index = i % imagedatas.length
            let image = imagedatas[index]
            context.clearRect(0, 0, width, heigth)
            context.putImageData(image, (width - image.width) / 2, (heigth - image.height) / 2);
            console.log({start})
            i++
            start = null
            
        }
        
       
        if(repeat||i < imagedatas.length  ){
            rAF.current = requestAnimationFrame(() => {
                renderCanvas(context, start, i, imagedatas, timestamp, width, heigth,repeat)
            })
            
        }
        
    }, [extendInfo]);



    const handleSave = () => {
        let fileName = 'testImg';
        let mimeType: MIME_TYPE = "image/bmp";
        if (checked) {//为真表示透明，直接存为png
            mimeType = "image/png";
            fileName += '.png';
        } else {//为假保存位bmp
            mimeType = "image/bmp";
            fileName += '.bmp';
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
                    {Object.keys(myInfoList).map((key: string) => (

                        <Grid container spacing={1} key={key + state.imageId} className={classes.grid}>
                            <AnimeInfoPanel id={key} infos={myInfoList} info={infos} />
                        </Grid>

                    ))}
                </List>
            </div>
            <div className={classes.Container} ref={container}>
                <canvas ref={canvas}  ></canvas>
            </div>
            <div className={classes.rightSide}>
                <PaletEditor />
            </div>
        </div>
    );
}

const mapStateToProps = (state: { folder: any; currentPalet: any, palets: Buffer, tempPalet: Buffer, allVersion: versionType[], allAnime: allAnimeType[] }) => {
    return {
        folder: state.folder,
        currentPalet: state.currentPalet,
        palets: state.palets,
        tempPalet: state.tempPalet,
        allVersion: state.allVersion,
        allAnime: state.allAnime,
    }
}

export default connect(mapStateToProps)(AnimeList)