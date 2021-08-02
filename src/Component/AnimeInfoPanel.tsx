import React from 'react';
import { makeStyles, Theme, createStyles } from '@material-ui/core/styles';
import Grid from '@material-ui/core/Grid';

export interface infoType {
    [key: string]: any
}

const useStyles = makeStyles((theme: Theme) =>
    createStyles({
        gridLeft: {

        },
        gridRight: {

        }
    }),
);

type Props = {
    id: string, 
    infos: infoType, 
    info: infoType
}
export const AnimeInfoPanel = (props:Props) =>{
    const { id,infos,info} = props
    const classes = useStyles();
    if (info == null) {
        return null
    }
    if (id == 'east') {
        return <>
            <Grid item xs={6} className={classes.gridLeft} >占地面积</Grid><Grid xs={6} item className={classes.gridRight}>{infos[id].name + info[id] + " " + infos['south'].name + info['south']}</Grid>
        </>
    } else if (id == 'flag') {
        return <><Grid item xs={6} className={classes.gridLeft}>{infos[id].name}</Grid><Grid item xs={6} className={classes.gridRight}>{info[id] ? "可穿越" : "不可穿越"}</Grid></>
    } else {
        return infos[id].isShow && <><Grid item xs={6} className={classes.gridLeft}>{infos[id].name}</Grid><Grid item xs={6} className={classes.gridRight}>{info[id]}</Grid></>
    }
}
