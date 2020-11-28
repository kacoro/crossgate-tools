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
    currentPalet:'',
    folder :"",
    currentVersion:'',
    imageList:[] as ImageList ,
    currentImage:0
  }
  
  const reducer = (state = initialState, action: any) => {
    switch (action.type) { 
        case actionTypes.SELECT_FOLDER:
            return {
                ...state,
                folder: action.folder,
              }
            
        case actionTypes.SELECT_PALET:
          console.log(action)
            return {
                ...state,
                    currentPalet: action.palet,
                    palets:action.palets
            }  
                   
        default:
            return state 
    }
    
    
  }
  export default reducer