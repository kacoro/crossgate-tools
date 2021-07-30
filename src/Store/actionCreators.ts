import * as actionTypes from "./actionTypes"
import {readGraphicInfo} from "../Utils/readImages";
import {readPalet,readAllPalet, paletType} from "../Utils/readPalets";
export const selectFolder = (folder: any,allPalet:paletType[]) => {
    return {
      type: actionTypes.SELECT_FOLDER,
      folder,allPalet
    }
  }

export const selectPalet = (palet: any,palets:any[]=[]) => {
  return {
    type: actionTypes.SELECT_PALET,
    palet,palets
  }
}

export const setTempPalet = (palet:any[]=[]) => {
  return {
    type: actionTypes.SET_TEMP_PALET,
    palet
  }
}

export const ReadPaletsAsyncRequest =  (folder: any) => {
  return (dispatch:any) => {
     let allPalet =  readAllPalet(folder)
     dispatch(selectFolder(folder,allPalet))
  }
}

export const simulateAsyncRequest = (folder: any,palet: any) => {
    return (dispatch:any) => {
        let palets = readPalet(folder,palet)
        dispatch(selectPalet(palet,palets))
    }
}