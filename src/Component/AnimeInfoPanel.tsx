import React from 'react';
import { makeStyles, Theme, createStyles } from '@material-ui/core/styles';
import Grid from '@material-ui/core/Grid';
import { usePanelstyles } from './usePanelstyles';
import TextField from '@material-ui/core/TextField';
export interface infoType {
    [key: string]: any
}
import { AnimeInfoList } from '../Utils/config'
import Divider from '@material-ui/core/Divider';

const actionName = [
    "站立","走路","跑步准备","跑步","跑步结束","攻击","魔法","投掷","受伤","防御","倒下",
    "坐下","招手","高兴","生气","悲伤","点头","拳","剪","包","钓鱼"]

type Props = {
    extendInfo: infoType,
    info: infoType,
    updateInfo(name: string, value: number): void
}
export const AnimeInfoPanel = (props: Props) => {
    const { extendInfo, info, updateInfo } = props
    const classes = usePanelstyles();
    const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        // setName(event.target.value);
        let name = event.target.name
        if(!event.target.value) return ;
        let value = parseInt(event.target.value)
        
        if (name == "action") {
            if(value<0) {value = 20} else{
                value = value % 21
            }
           
        }
        if (name == "direction") {
            if(value<0) {value = 7} else{
                value = value % 8
            }
        }
        updateInfo(event.target.name, value)
    }

    return <>
        {info&&Object.keys(info).map((key: string) => {
            return AnimeInfoList[key] && <Grid container spacing={1} key={key} className={classes.grid}>
                <Grid item xs={6} className={classes.gridRight}>{AnimeInfoList[key].name}</Grid>
                <Grid item xs={6} className={classes.gridRight}>{info[key]}</Grid>
            </Grid>
        })
        }
        <Divider />
        {extendInfo&&Object.keys(extendInfo).map((key: string) => {
            return AnimeInfoList[key] && <Grid container spacing={1} key={key} className={classes.grid}>
                <Grid item xs={6} className={classes.gridRight}>{AnimeInfoList[key].name}</Grid>
                <Grid item xs={6} className={classes.gridRight}>
                    {key == "action" || key == "direction" ?
                        <TextField id="filled-basic" className={classes.input}
                            onKeyDown={(event) => {
                                if (event.key === 'Enter') {
                                    event.stopPropagation;
                                    event.preventDefault()
                                    return false;
                                }
                            }} type="number" value={extendInfo[key]} name={key} onChange={handleChange} />
                        : extendInfo[key]

                    }
                    {key == "action"&&actionName[extendInfo[key]]}
                </Grid>
            </Grid>
        })
        }
    </>
  
}
