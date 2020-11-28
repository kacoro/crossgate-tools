import React from 'react';
import ReactDOM from 'react-dom';
import App from '@container/App';
import { createStore, applyMiddleware  } from "redux";
import { Provider } from "react-redux"
import reducer from "./Store/reduce";
const store = createStore(reducer, applyMiddleware(thunk))
import thunk from "redux-thunk";

ReactDOM.render(<Provider store={store}><App/></Provider>,document.getElementById('root'));