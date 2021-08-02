import * as actionTypes from "./actionTypes"
import {readGraphicInfo} from "../Utils/readImages";
import {readPalet,readAllPalet, paletType} from "../Utils/readPalets";
import { readAllVersion, versionType } from "../Utils/version";
import { allAnimeType, readAllAnime } from "../Utils/anime";
export const selectFolder = (folder: any,allPalet:paletType[],allVersion: versionType[],allAnime: allAnimeType[]) => {
    return {
      type: actionTypes.SELECT_FOLDER,
      folder,allPalet,allVersion,allAnime
    }
}

export const selectFolderAnime = (folder: any,allPalet:paletType[],allAnime: allAnimeType[]) => {
  return {
    type: actionTypes.SELECT_FOLDER_ANIME,
    folder,allPalet,allAnime
  }
}

export const selectPalet = (palet: any,palets:any[]=[]) => {
  return {
    type: actionTypes.SELECT_PALET,
    palet,palets
  }
}

export const setTempPalet = (palet:any[]=[]) => {``
  return {
    type: actionTypes.SET_TEMP_PALET,
    palet
  }
}

export const ReadPaletsAsyncRequest =  (folder: any,anime=false) => {
  return (dispatch:any) => {
     let allPalet =  readAllPalet(folder)
     if(!anime){
      let allVersion =  readAllVersion(folder)
      let allAnime =  readAllAnime(folder)
      dispatch(selectFolder(folder,allPalet,allVersion,allAnime))
     }else{
      let allAnime =  readAllAnime(folder)
       dispatch(selectFolderAnime(folder,allPalet,allAnime))
     }
     
  }
}

export const simulateAsyncRequest = (folder: any,palet: any) => {
    return (dispatch:any) => {
        let palets = readPalet(folder,palet)
        dispatch(selectPalet(palet,palets))
    }
}