import './Win2Day.css';
import React from 'react';

interface IWin2DayProps {
    children: JSX.Element,
}

export default function Win2Day(props: IWin2DayProps) {
    return (
        <div className={'win2day'}>
            <div
                className={'header'}
            >
                <img className={'mobile'}   src={process.env.PUBLIC_URL + '/mobile-header.png'} />
                <img className={'desktop'}  src={process.env.PUBLIC_URL + '/desktop-header.png'} />
            </div>
            <div className={'body'}>{props.children}</div>
        </div>
    )
}