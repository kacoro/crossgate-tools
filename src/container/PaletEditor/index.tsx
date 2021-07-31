import React, { useMemo, useState, useRef, useEffect, useCallback } from 'react';
import { connect } from 'react-redux';
import { makeStyles, Theme, createStyles } from '@material-ui/core/styles';
import { exportCanvasAsPNG, MIME_TYPE } from '../../Utils/canvas';
import { Card, Checkbox, FormControlLabel, Button } from '@material-ui/core';
import { SketchPicker } from 'react-color';
import { setTempPalet } from "../../Store/actionCreators"
import { PaletsType } from '../../Store/reduce';
import { SavePalet } from '../../Utils/readPalets'

const useStyles = makeStyles((theme: Theme) =>
    createStyles({
        root: {
            flexGrow: 1,
            display: "flex",
            height: '100%',
            overflow: 'hidden',
            flexDirection: "column"
        },
        top: {
            padding: '10px',
            width: "280px",
            minWidth: "280px",
            overflowX: 'hidden',
            overflowY: 'auto',
            //borderRight:"1px solid #ccc",
        },
        Container: {
            flex: 1,
            display: "flex",
            justifyContent: "space-around",
            alignItems: "center",
            flexDirection: "column",

        },
        canvas: {

        },

    }),
);
type Props = {
    tempPalet: PaletsType[],
    palets: PaletsType[],
    setTempPalet: (palet: PaletsType[]) => void;
};
export const PaletEditor = (props: Props) => {
    const classes = useStyles();
    const canvas = useRef(null)
    const container = useRef(null)
    const { palets, tempPalet, setTempPalet } = props
    const [color, setColor] = useState("rgb(0,0,0)");
    const [pos, setPos] = useState({ x: 0, y: 0 });
    const myPalet = useMemo(() => {
        if(tempPalet.length>0){
            return [...tempPalet]
        } 
        return [...palets]
    }, [palets,tempPalet])
    
    
    
   
    useEffect(() => {
        if (palets && palets.length > 0) {
            genCanvas()
        }
    }, [palets])

    const fillRect = (x: number, y: number, style: string) => {
        const ctx = canvas.current.getContext("2d");
        let size = 16
        ctx.fillStyle = style;
        ctx.fillRect(x * size, y * size, size, size);
    }

    const genCanvas = () => {
        let cell = 16;
        let row = 16;
        let size = 16;
        const ctx = canvas.current.getContext("2d");
        canvas.current.width = cell * size
        canvas.current.height = row * size
        ctx.fillStyle = "rgb(0,0,0)";
        let index = 0;

        for (let i = 0; i < row; i++) {
            for (let j = 0; j < cell; j++) {
                let p = palets[index].toString()
                let style = `rgb(${p})`
                fillRect(j, i, style)
                index++;
            }
        }
    }

    const handleClick = (e: any) => {
        let size = 16;
        console.dir(e)
        console.dir(canvas.current)
        const { offsetTop, offsetLeft } = canvas.current
        const { clientX, clientY } = e
        let x = Math.floor((clientX - offsetLeft) / size)
        let y = Math.floor((clientY - offsetTop) / size)
        const ctx = canvas.current.getContext("2d");
        var colorData = ctx.getImageData(x * size, y * size, 1, 1);
        let red = colorData.data[0];
        let green = colorData.data[1];
        let blue = colorData.data[2];
        // let alpha = colorData.data[3];
        let _color = `rgb(${red},${green},${blue})`
        setPos({ x, y })
        setColor(_color)
        e.persist()
        console.log(x, y, _color)
    }

    const handleSave = () => {
        if(!myPalet) return false
        SavePalet(myPalet )
    }
    const handleSetTempPalet = (color: { r: number; g: number; b: number; }) => { //设置temp
        // let fileName = 'palect'+currentPalet+'.bmp';
        // let mimeType:MIME_TYPE = "image/bmp";
        let index = pos.y * 16 + pos.x
        
        myPalet[index] = [color.r, color.g, color.b]
       
        setTempPalet([...myPalet])
        // myPalet[index][0] = color[0]
        // let _tempPalet = 
        // exportCanvasAsPNG(mimeType, canvas.current, fileName)
    }

    const restore = () => { //还原
        setTempPalet([] as PaletsType[])
        genCanvas()
    }

    const handleColorChange = (color: any) => {
        console.log(color)
        handleSetTempPalet(color.rgb)
         fillRect(pos.x,pos.y,color.hex)
        setColor(color)
    }

    return <div className={classes.root}>
        <div className={classes.top}>
            <Card>
                <Button color="primary" onClick={handleSave}>保存</Button>
                <Button color="secondary" onClick={restore}>还原</Button>
            </Card>
        </div>
        <div className={classes.Container} ref={container}>
            <canvas ref={canvas} className={classes.canvas} onClick={handleClick} ></canvas>
            <div className={classes.canvas} >
                <SketchPicker
                    color={color} onChangeComplete={handleColorChange}
                />
            </div>
        </div>
    </div>
}


const mapStateToProps = (state: { tempPalet: PaletsType[], palets: PaletsType[] }) => {
    return {
        tempPalet: state.tempPalet,
        palets: state.palets
    }
}
const mapDispatchToProps = (dispatch: any) => {
    return {
        // selectFolder: (folder: any) =>dispatch(selectFolder(folder)),  // dispatch({ type: actionTypes.SELECT_FOLDER, data: folder }),
        setTempPalet: (palet: any) =>dispatch(setTempPalet(palet)),
    }
}
export default connect(mapStateToProps, mapDispatchToProps)(PaletEditor)