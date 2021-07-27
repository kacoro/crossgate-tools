import { paletType } from "src/Utils/readPalets"
import * as actionTypes from "./actionTypes"
interface PaletsType{
    [index:number]:number | string
}
interface ImageList{
  [index:number]:number 
}

const initialState = {
    articles: [
      { id: 1, title: "post 1", body: "Quisque cursus, metus vitae pharetra" },
      { id: 2, title: "post 2", body: "Quisque cursus, metus vitae pharetra" },
    ],
    palets :[] as PaletsType,
    currentPalet:'', //索引
    folder :"",
    currentVersion:'',
    imageList:[] as ImageList ,
    currentImage:0,
    allPalet:[] as paletType[] 
  }
  
  const reducer = (state = initialState, action: any) => {
    switch (action.type) { 
        case actionTypes.SELECT_FOLDER:
            return {
                ...state,
                folder: action.folder,
                allPalet:action.allPalet
              }
            
        case actionTypes.SELECT_PALET:
            return {
                ...state,
                    currentPalet: action.palet,
                    palets:state.allPalet[action.palet]?.data|| []
            }  
                   
        default:
            return state 
    }
    
    
  }
  export default reducer