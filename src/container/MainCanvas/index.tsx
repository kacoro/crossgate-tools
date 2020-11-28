import React, { Component, Fragment ,useEffect} from 'react';

interface imageType{
    data:Buffer,
    width:number,
    height:number
}

interface propsTypes{
    image:imageType
}

export default function MainCanvas(props:propsTypes){
 
    const {image} = props;

    console.log(image)
    const canvas = React.useRef(null)
        useEffect(() => {
            if(image.width>0){
                const ctx = canvas.current.getContext("2d");
                var imageData = new ImageData(
                    Uint8ClampedArray.from(image.data),
                    image.width,
                    image.height
                );
                ctx.putImageData(imageData, 0, 0);
            }
        });
        
    return (
        <>
            <canvas id="canvas" ref={canvas}   style={{background:"#000"}} ></canvas>
        </>
       );
}