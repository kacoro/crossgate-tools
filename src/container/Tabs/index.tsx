import React from 'react';
import PropTypes from 'prop-types';
import { makeStyles } from '@material-ui/core/styles';
import AppBar from '@material-ui/core/AppBar';
import Tabs from '@material-ui/core/Tabs';
import Tab from '@material-ui/core/Tab';
import CropOriginal from '@material-ui/icons/CropOriginal';
import FavoriteIcon from '@material-ui/icons/Favorite';
import Box from '@material-ui/core/Box';
import InfoList from '../InfoList'
import PaletList from '../PaletList'
import  AnimeList  from '../AnimeList';
function TabPanel(props: { [x: string]: any; children: any; value: any; index: any; }) {
  const { children, value, index, ...other } = props;
  const classes = useStyles();
  return (
    <div className={classes.panel}
      role="tabpanel"
      hidden={value !== index}
      id={`scrollable-force-tabpanel-${index}`}
      aria-labelledby={`scrollable-force-tab-${index}`}
      {...other}
    >
      {value === index && (
        <>
          {children}
        </>
      )}
    </div>
  );
}

TabPanel.propTypes = {
  children: PropTypes.node,
  index: PropTypes.any.isRequired,
  value: PropTypes.any.isRequired,
};

function a11yProps(index: number) {
  return {
    id: `scrollable-force-tab-${index}`,
    'aria-controls': `scrollable-force-tabpanel-${index}`,
  };
}

const useStyles = makeStyles((theme) => ({
  root: {
    flexGrow: 1,
    width: '100%',
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
    backgroundColor: theme.palette.background.paper,
  },
  panel:{
    flex:1,
    overflow:"hidden"
  }
}));

export default function ScrollableTabsButtonForce() {
  const classes = useStyles();
  const [value, setValue] = React.useState(0);

  const handleChange = (_event: any, newValue: React.SetStateAction<number>) => {
    setValue(newValue);
  };

  return (
    <Box className={classes.root}>
      <AppBar position="static" color="default">
        <Tabs 
          value={value}
          onChange={handleChange}
          scrollButtons="on"
          indicatorColor="primary"
          textColor="primary"
          centered
          aria-label="scrollable force tabs example"
        >
          <Tab label="动画" icon={<FavoriteIcon />} {...a11yProps(0)} />
          <Tab label="图片" icon={<CropOriginal />} {...a11yProps(1)} />
          <Tab label="调色板" icon={<FavoriteIcon />} {...a11yProps(2)} />
          {/* <Tab label="地图" icon={<FavoriteIcon />} {...a11yProps(1)} />
          <Tab label="宠物" icon={<PersonPinIcon />} {...a11yProps(2)} />
          <Tab label="人物" icon={<HelpIcon />} {...a11yProps(3)} />
          <Tab label="建筑" icon={<ShoppingBasket />} {...a11yProps(4)} /> */}
        </Tabs>
      </AppBar>
      <TabPanel value={value} index={0} className={classes.panel}>
           <AnimeList/>
      </TabPanel>
      <TabPanel value={value} index={1} className={classes.panel}>
       <InfoList />
      </TabPanel>
      <TabPanel value={value} index={2} className={classes.panel}>
          <PaletList/>
      </TabPanel>
      {/* <TabPanel value={value} index={2}>
      </TabPanel>
      <TabPanel value={value} index={3}>
        Item Three
      </TabPanel>
      <TabPanel value={value} index={4}>
        Item Four
      </TabPanel> */}
    </Box>
  );
}
