import React, { useState, useRef, useEffect, useCallback } from 'react';
import { connect } from 'react-redux';
import { makeStyles, Theme, createStyles } from '@material-ui/core/styles';
import { exportCanvasAsPNG, MIME_TYPE } from '../../Utils/canvas';
import { Card, Checkbox, FormControlLabel,Button } from '@material-ui/core';
type Props = {
    currentPalet?: string | number,
    palets: Buffer
};
const useStyles = makeStyles((theme: Theme) =>
    createStyles({
        root: {
            flexGrow: 1,
            display: "flex",
            height: '100%',
            overflow: 'hidden',
        },
        leftSide: {
            padding: '10px',
            width: "280px",
            minWidth: "280px",
            overflowX: 'hidden',
            overflowY: 'auto',
            backgroundColor: theme.palette.background.paper,
            //borderRight:"1px solid #ccc",
            boxShadow:"0px 5px 2px -1px rgb(0 0 0 / 50%), 0px 10px 1px 0px rgb(0 0 0 / 30%), 0px 10px 6px 0px rgb(0 0 0 / 12%)"
        },
        Container: {
            flex: 1,
            display:"flex",
            justifyContent:"center",
            alignItems:"center"
        },
        canvas:{
            
        },
        demo: {
            backgroundColor: theme.palette.background.paper,
        },
        formControl: {
            width: '100%',
        },
        title: {
            margin: theme.spacing(4, 0, 2),
        },
        select: {
            width: '100%'
        },
        itemText: {
            paddingTop: 0,
            paddingBottom: 0,
            marginTop: 0,
            marginBottom: 0,
            color: "#fff"
        },
        search: {
            padding: '2px 10px',
            display: 'flex',
            alignItems: 'center',
            width: 280,
        },
        input: {
            marginLeft: theme.spacing(1),
            flex: 1,
            textAlign: "center",

        },
        iconButton: {
            padding: 10,
        },
        grid: {
            padding: '8px 16px',
            color: "#fff"
        },
        gridLeft: {

        },
        gridRight: {

        }
    }),
);
export const PaletList = (props: Props) =>{
    const classes = useStyles();
    const canvas = useRef(null)
    const container = useRef(null)
    const {  palets, currentPalet } = props

    useEffect(() => {
        if(palets&&palets.length>0){
            genCanvas()
        }
    }, [palets])

    const genCanvas = () =>{
        
        let cell =  17;
        let row = 15;
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