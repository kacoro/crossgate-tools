const INCREMENT = 'INCREMENT'
const incrementAction = {"type": INCREMENT, "count": 2}


import { createStore, combineReducers } from "redux";
import  reduce  from "./reduce";

// 全局你可以创建多个reducer 在这里统一在一起
const rootReducers = combineReducers({reduce})
// 全局就管理一个store
export const store = createStore(rootReducers)