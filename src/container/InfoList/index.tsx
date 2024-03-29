import React, { useMemo,useState, useRef, useEffect, useCallback } from 'react';
import { makeStyles, Theme, createStyles } from '@material-ui/core/styles';
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
import { readGraphicInfo, getImageInfo, getImage, readGraphicInfoByStream } from '../../Utils/readImages'
import { connect } from 'react-redux';
import { g_ImgMap, myInfoList } from '../../Utils/config'
import MainCanvas from '../MainCanvas'
import { throttle, debounce } from '@kacoro/utils'
import { exportCanvasAsPNG, MIME_TYPE } from "../../Utils/canvas"
import { Card, Checkbox, FormControlLabel } from '@material-ui/core';
import PaletEditor from '../PaletEditor'
import { versionType } from 'src/Utils/version';

import {GraphicInfoPanel, infoType} from '../../Component/GraphicInfoPanel';
import { usePanelstyles } from '../../Component/usePanelstyles';

type Props = {
    folder?: string;
    currentPalet?: string | number,
    palets: Buffer,
    tempPalet:Buffer,
    allVersion:versionType[]
};

export interface Bitmap {
    data: Buffer;
    width: number;
    height: number;
}
export function InfoList(props: Props) {
    const { folder, palets, currentPalet ,tempPalet,allVersion} = props
    const classes = usePanelstyles();
    const [acount, SetAccount] = useState({ key: 'acount', name: '图片总数', value: 0 })
    const [infos, SetInfos] = useState(null);
    const canvas = useRef(null)
    const container = useRef(null)

    const [checked, setChecked] = React.useState(true);
    const graphicInfo = useRef(Buffer.allocUnsafe(0))
    const graphic = useRef('')
    const [image, SetImage] = useState({} as Bitmap);
    const [state, setState] = React.useState<{ version: string | number; imageId: number }>({
        version: '',
        imageId: 0,
    });
    const [loading, setLoading] = useState(false)
    const [loadingImg, setLoadingImg] = useState(false)
    const [dbValue, saveToDb] = useState(0);
    const myPalet = useMemo(() => {
        if(tempPalet.length>0){
            return tempPalet
        } 
        return palets
    }, [palets,tempPalet])
    const debouncedSaveByCallBack: Function = useCallback(throttle((nextValue: number) => {
        setState({
            ...state,
            imageId: nextValue,
        });
        saveToDb(nextValue)
    
    }, 1000/24), [],); // will be created only once initially

   
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

        if (folder != '' && currentPalet != "" && state.version != ""&&!loading) {
            //查找图片信息
            //  let data = readGraphicInfo(folder, state.version);
            //  console.log(data);
            setLoading(true);
            (async () => {
                graphicInfo.current = null;
                graphic.current = null;
                console.log("version")
                // let data = await readGraphicInfoByStream(folder, state.version)
                let data = await readGraphicInfo(folder, allVersion[state.version as number]);
                SetAccount({
                    ...acount,
                    'value': data.length,
                })
                if(dbValue>data.length){//如果大，则需要重置
                    saveToDb(0);
                }
               
                graphicInfo.current = data.graphicInfo
                graphic.current = data.graphicPath
                setLoading(false)

            })();

            // SetGraphicInfo(info=> {return data.graphicInfo})
            //  SetGraphic(grahic=>data.graphic)
        }

    }, [state.version]);
    //获取图片信息
    useEffect(function checkGraphicID() {
        if (graphicInfo.current && graphicInfo.current.length != 0) {
            // console.log("info")
            let info: infoType = getImageInfo(dbValue, graphicInfo.current);
             SetInfos(info)
        }
    }, [dbValue, graphicInfo.current])

    // 获取图片数据
    useEffect(function checkGraphicInfo() {
        if (graphic.current && graphic.current.length != 0 && infos) {
            
            (async () => {
                let _palet = palets
                if(tempPalet.length>0){
                    _palet = tempPalet
                }
                let {image} = await getImage(infos, graphic.current, _palet)
                // console.log("getImage",image)
                //console.log(image);
                if (image && image.width > 0) {
                    SetImage(image)
                }
               
            })();
        }
    }, [infos, palets,tempPalet]);

    //生成图片
    useEffect(() => {
        // console.log(image.width)
        if (image.width > 0) {
            const context = canvas.current.getContext("2d");
            const width = container.current.clientWidth
            const height = container.current.clientHeight
            canvas.current.width = width
            canvas.current.height = height
            // context.save();
            // console.dir(container.current.clientWidth)
            var imageData = new ImageData(
                Uint8ClampedArray.from(image.data),
                image.width,
                image.height
            );
            // console.log("image")
            context.putImageData(imageData, (width - image.width) / 2, (height - image.height) / 2);

            const test = () => {
                context.globalCompositeOperation = "lighter"; //destination-atop destination-over lighter
                context.fillStyle = "#000000"
                context.fillRect((width - image.width * 2) / 2, (height - image.height * 2) / 2, image.width * 2, image.height * 2);
            }
        }
    }, [image]);

    const handleSave = () => {
        let fileName = 'testImg';
        let mimeType:MIME_TYPE = "image/bmp";
        if(checked){//为真表示透明，直接存为png
            mimeType = "image/png";
            fileName +='.png';
        }else{//为假保存位bmp
            mimeType = "image/bmp";
            fileName +='.bmp';
        }
        exportCanvasAsPNG(mimeType, canvas.current, fileName, image)
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
                        {allVersion.map((item, index) => {
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
                    {image.data && <Button color="primary" onClick={handleSave}>保存</Button>}

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
                            <GraphicInfoPanel id={key} infos={myInfoList} info={infos}  />
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

const mapStateToProps = (state: { folder: any; currentPalet: any, palets: Buffer ,tempPalet:Buffer,allVersion:versionType[]}) => {
    return {
        folder: state.folder,
        currentPalet: state.currentPalet,
        palets: state.palets,
        tempPalet:state.tempPalet,
        allVersion:state.allVersion
    }
}

export default connect(mapStateToProps)(InfoList)