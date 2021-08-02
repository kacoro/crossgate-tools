import React, { useState, useRef, useEffect, useCallback } from 'react';
import { connect } from 'react-redux';
import { makeStyles, Theme, createStyles } from '@material-ui/core/styles';
import { exportCanvasAsPNG, MIME_TYPE } from '../../Utils/canvas';
import { Card, Checkbox, FormControlLabel,Button } from '@material-ui/core';
type Props = {
    currentPalet?: string | number,
    palets: Buffer
};
import { usePanelstyles } from '../../Component/usePanelstyles';

export const PaletList = (props: Props) =>{
    const classes = usePanelstyles();
    const canvas = useRef(null)
    const container = useRef(null)
    const {  palets, currentPalet } = props

    useEffect(() => {
        if(palets&&palets.length>0){
            genCanvas()
        }
    }, [palets])

    const genCanvas = () =>{
        
        let cell =  16;
        let row = 16;
        const ctx = canvas.current.getContext("2d");
        canvas.current.width  = cell*32
        canvas.current.height  = row*32
        ctx.fillStyle = "rgb(255,165,0)";
        let index = 0;
        const fillRect = (x: number, y: number)=>{
             let p = palets[index].toString(16)
             let style = `rgb(${p})`
              ctx.fillStyle = style;
            ctx.fillRect(x*32, y*32, 32, 32);
        }
        for(let i=0;i<row;i++){
            for(let j=0;j<cell;j++){
                fillRect(j,i)
                index++;
            }
        }

    }

    const handleSave = () => {
        let fileName = 'palect'+currentPalet+'.bmp';
        let mimeType:MIME_TYPE = "image/bmp";
        
        exportCanvasAsPNG(mimeType, canvas.current, fileName)
    }

    
    return <div className={classes.root}>
          <div className={classes.leftSide}>
              <Card>
                    <Button color="primary" onClick={handleSave}>保存</Button>
              </Card>
              
          </div>
         <div className={classes.Container} ref={container}>
                <canvas ref={canvas} className={classes.canvas} ></canvas>
          </div>
    </div>
}


const mapStateToProps = (state: { currentPalet: any, palets: Buffer }) => {
    return {
        currentPalet: state.currentPalet,
        palets: state.palets
    }
}

export default connect(mapStateToProps)(PaletList)