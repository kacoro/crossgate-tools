import { makeStyles, Theme, createStyles } from '@material-ui/core/styles';
export const usePanelstyles = makeStyles((theme: Theme) =>
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
        rightSide: {
            padding: '10px',
            width: "280px",
            minWidth: "280px",
            overflowX: 'hidden',
            overflowY: 'auto',
            backgroundColor: theme.palette.background.paper,
            boxShadow:"0px 5px 2px -1px rgb(0 0 0 / 50%), 0px 10px 1px 0px rgb(0 0 0 / 30%), 0px 10px 6px 0px rgb(0 0 0 / 12%)"
        },
        Container: {
            flex: 1,
            display:"flex",
            justifyContent:"center",
            alignItems:"center"
        },
        canvas:{
            background:"#fff"
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

        },
    }),
);