import * as actionTypes from "./actionTypes"
import {readGraphicInfo} from "../Utils/readImages";
import {readPalet} from "../Utils/readPalets";
export const selectFolder = (folder: any) => {
    return {
      type: actionTypes.SELECT_FOLDER,
      folder,
    }
  }

export const selectPalet = (palet: any,palets:any[]) => {
  return {
    type: actionTypes.SELECT_PALET,
    palet,palets
  }
}

export const simulateAsyncRequest = (folder: any,palet: any) => {
    return (dispatch:any) => {
        let palets = readPalet(folder,palet)
        dispatch(selectPalet(palet,palets))
    }
}