import React,{useEffect} from 'react';
import AppBar from '@material-ui/core/AppBar';
import Toolbar from '@material-ui/core/Toolbar';
import IconButton from '@material-ui/core/IconButton';
import Typography from '@material-ui/core/Typography';
import { makeStyles } from '@material-ui/core/styles';
import MenuIcon from '@material-ui/icons/Menu';
import SearchIcon from '@material-ui/icons/Search';
import MoreIcon from '@material-ui/icons/MoreVert';
import FormControl from '@material-ui/core/FormControl';
import Select from '@material-ui/core/Select';
import InputLabel from '@material-ui/core/InputLabel';
import  InputBase  from '@material-ui/core/InputBase';
import Button from '@material-ui/core/Button';
import FolderOpen from '@material-ui/icons/FolderOpen';
import Grid from '@material-ui/core/Grid'
import TextField from '@material-ui/core/TextField'

import { connect } from 'react-redux';

const fs = require('fs')
const { dialog } = require('electron').remote;
const path = require('path')
import * as actionTypes from "../../Store/actionTypes"
import { selectFolder,simulateAsyncRequest } from "../../store/actionCreators"
const useStyles = makeStyles((theme) => ({
  root: {
    flexGrow: 1,
  },
  margin:{
    marginRight:theme.spacing(4),
  },
  menuButton: {
    marginRight: theme.spacing(2),
  },
  toolbar: {
    minHeight: 48,
    alignItems: 'flex-start',
    paddingTop: theme.spacing(2),
     paddingBottom: theme.spacing(2),
  },
  formControl:{
    width: '220px',
},
folderText:{
    width:'300px'
},
  title: {
    flexGrow: 1,
    alignSelf: 'flex-end',
    paddingBottom: theme.spacing(1),
  },
}));

type Props = {
    folder?: string;
    palet?:string |number,
    selectFolder: (folder:string) => void;
    selectPalet: (folder:string,palet:string|number) => void;
  };


export  function ProminentAppBar(props:Props) {
    const { selectFolder,selectPalet } = props;
   const classes = useStyles();

  const [state, setState] = React.useState<{ palet: string | number;folder:string }>({
    palet: localStorage.getItem('palet')||'',
    folder: localStorage.getItem('folder')||'',
  });

  
  useEffect( function folder() {
    // 👍 将条件判断放置在 effect 中
    if (state.folder !== '') {
      localStorage.setItem('folder', state.folder);
      //可以先读取所有调色板信息。并且缓存起来。使用redux
      selectFolder(state.folder);
    }
    if (state.palet !== '') {
        console.log("select palet")
        localStorage.setItem('palet', state.palet.toString());
        
        selectPalet(state.folder,state.palet)
        
      }
  });

  const handleChange = (event: React.ChangeEvent<{ name?: string; value: unknown }>) => {
    const name = event.target.name as keyof typeof state;
    setState({
      ...state,
      [name]: event.target.value,
    });
  };

  function handleOpenFolder(){
    var folder = dialog.showOpenDialogSync({ properties: ['openDirectory'] })
    setState({
        ...state,
        "folder": folder[0]
      });
  }


  return (
    <div className={classes.root}>
      <AppBar position="static">
        <Toolbar className={classes.toolbar}>
          <IconButton
            edge="start"
            className={classes.menuButton}
            color="inherit"
            aria-label="open drawer"
          >
            <MenuIcon />
          </IconButton>
          <Typography className={classes.title} variant="h5" noWrap>
            CrossGate Tools
          </Typography>
          <div className={classes.margin}>
            <Grid container spacing={1} alignItems="flex-end">
                <Grid item>
                    <TextField className={classes.folderText} disabled id="input-with-icon-grid" value={state.folder} label="选择游戏所在目录"  onClick={handleOpenFolder} />
                </Grid>
                <Grid item>
                 
                    <FolderOpen onClick={handleOpenFolder} />
                  
                </Grid>
            </Grid>
            </div>
          <FormControl className={classes.formControl}>
                <InputLabel htmlFor="age-native-simple">选择调色板</InputLabel>
                <Select
                native
                value={state.palet}
                onChange={handleChange}
                inputProps={{
                    name: 'palet',
                    id: 'palet-native',
                }}
                >
                <option aria-label="None" value="" />
                <option value={0}>白天</option>
                <option value={1}>黄昏</option>
                <option value={2}>黑夜</option>
                <option value={3}>凌晨</option>
                </Select>
              
            </FormControl>
          <IconButton aria-label="search" color="inherit">
            <SearchIcon />
          </IconButton>
          <IconButton aria-label="display more actions" edge="end" color="inherit">
            <MoreIcon />
          </IconButton>
        </Toolbar>
      </AppBar>
    </div>
  );
}

const mapStateToProps = (state: { articles: any; }) => {
    return {
      articles: state.articles,
    }
  }
  const mapDispatchToProps = (dispatch:any) => {
    return {
        selectFolder: (folder: any) =>dispatch(selectFolder(folder)),  // dispatch({ type: actionTypes.SELECT_FOLDER, data: folder }),
        selectPalet: (folder: any,palet: any) =>
        dispatch(simulateAsyncRequest(folder,palet)),
    }
  }
export default connect(mapStateToProps,mapDispatchToProps)(ProminentAppBar)