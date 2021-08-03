import { paletType } from "../Utils/readPalets"
import * as actionTypes from "./actionTypes"

import {versionType} from "../Utils/version"
import { hiddenPaletInfoType } from "../Utils/anime"

// export type PaletsType = Buffer[Buffer[number]] | Buffer[]

export type PaletsType = Array<number>
// export interface PaletsType{
//     [index:number]: number
// }
interface ImageList {
  [index: number]: number
}

interface initState{
  palets:PaletsType[],
  currentPalet:string,
  folder:string,
  currentVersion:string,
  imageList:ImageList[],
  currentImage:number,
  allPalet:paletType[],
  tempPalet:PaletsType,
  hiddenPalet:hiddenPaletInfoType,
  allVersion:versionType[],
  allAnimeInfo:Uint8Array[],
  allAnime:Uint8Array[],
  currentAinime:number
}

const initialState:initState = {
  palets: [] ,
  currentPalet: '', //索引
  folder: "",
  currentVersion: '',
  imageList: [],
  currentImage: 0,
  allPalet: [] ,
  tempPalet: [] , //临时存储
  hiddenPalet:{}, //隐藏调色版
  allVersion:[],
  allAnimeInfo:[],
  allAnime:[],
  currentAinime:0
}

const reducer = (state = initialState, action: any) => {
  switch (action.type) {
    case actionTypes.SELECT_FOLDER:
      return {
        ...state,
        folder: action.folder,
        allPalet: action.allPalet,
        allVersion:action.allVersion,
        allAnime:action.allAnime,
        hiddenPalet:action.hiddenPalet,
        
      }
     case actionTypes.SELECT_FOLDER_ANIME:
      return {
        ...state,
        folder: action.folder,
        allPalet: action.allPalet,
        allAnime:action.allAnime,
        hiddenPalet:action.hiddenPalet
      }


    case actionTypes.SELECT_PALET:
      return {
        ...state,
        currentPalet: action.palet,
        palets: state.allPalet[action.palet]?.data || [],
        tempPalet:[] as PaletsType
      }
    case actionTypes.SET_TEMP_PALET:
      return {
        ...state,
        tempPalet: action.palet
      }

    default:
      return state
  }


}
export default reducer