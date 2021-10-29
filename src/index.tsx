import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import App from './App';
import {DeviceFrameset} from 'react-device-frameset'
import 'react-device-frameset/lib/css/marvel-devices.min.css';
import Win2Day from "./Win2Day/Win2day";

ReactDOM.render(
    <React.StrictMode>
        <App/>

        {/* <div className={'devices'}>
            <div className={'device mobile'}>
                <DeviceFrameset device={'iPhone X'} color="white">
                    <App/>
                </DeviceFrameset>
            </div>
            <div className={'device'}>
                <DeviceFrameset device="MacBook Pro">
                    <App/>
                </DeviceFrameset>
            </div>
        </div>*/}
    </React.StrictMode>,
    document.getElementById('root')
);
