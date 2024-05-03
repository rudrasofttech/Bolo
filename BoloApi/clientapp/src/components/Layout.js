import React, { Fragment, useState } from 'react';
import NavBar from './shared/NavBar';
import Search from './Search';
import NotificationList from './NotificationList';
import SendPulse from './shared/SendPulse';
import AskPushNotification from './AskPushNotification';
import Sidebar from './shared/Sidebar';
import { useMediaQuery } from 'react-responsive';

function Layout(props) {
    const [showSearch, setShowSearch] = useState(false);
    const [showNotification, setShowNotification] = useState(false);
    const [keywords, setKeywords] = useState("");
    const [unseennotificationcount, setUnseenNotificationCount] = useState(0);
    const isDesktopOrLaptop = useMediaQuery({
        query: '(min-width: 1224px)'
    })
    const isBigScreen = useMediaQuery({ query: '(min-width: 1824px)' })
    const isTabletOrMobile = useMediaQuery({ query: '(max-width: 1224px)' })
    const isPortrait = useMediaQuery({ query: '(orientation: portrait)' })
    //const isRetina = useMediaQuery({ query: '(min-resolution: 2dppx)' })

    const showNotificationModal = () => {
        return <>
            <div className={showNotification ? "modal d-block" : "modal fade"} id="NotificationModal" data-bs-backdrop="static" data-bs-keyboard="false" tabIndex="-1" aria-labelledby="notificationModalLabel" aria-hidden="true">
                <div className="modal-dialog modal-lg rounded-4 modal-dialog-scrollable modal-fullscreen-sm-down">
                    <div className="modal-content">
                        <div className="modal-header">
                            <h3 className="modal-title text-primary fw-semibold fs-4" id="notificationModalLabel">Notifications</h3>
                            <button type="button" className="btn-close" onClick={() => { setShowNotification(false); }} aria-label="Close"></button>
                        </div>
                        <div className="modal-body modal-dialog-scrollable">
                            <NotificationList onNotificationClick={() => { setShowNotification(false); }} onUpdateUnseen={(data) => { setUnseenNotificationCount(data); }} />
                        </div>
                        <div className="modal-footer">
                            <AskPushNotification />
                        </div>
                    </div>
                    
                </div>
            </div>
            {showNotification ? <div className="modal-backdrop fade show"></div> : null}
        </>;
    }

    const showSearchModal = () => {
        if (showSearch) {
            return <>
                <div className="modal  d-block" data-backdrop="static" data-keyboard="false" tabIndex="-1" role="dialog" aria-labelledby="staticBackdropLabel" aria-hidden="true">
                    <div className="modal-dialog modal-lg modal-dialog-scrollable modal-fullscreen-sm-down">
                        <div className="modal-content">
                            <div className="modal-header">
                                
                                    <input type="text" style={{ width: "calc(100% - 40px)" }} value={keywords} onChange={(e) => { setKeywords(e.target.value); }} className="form-control shadow-none border"
                                        placeholder="Search People, Topics, Hashtags" maxLength="150" />
                                
                                <button type="button" className="btn-close" onClick={() => { setShowSearch(false); }} aria-label="Close"></button>
                            </div>
                            <div className="modal-body">
                                <Search keywords={keywords} />
                            </div>
                        </div>
                    </div>
                </div>
                <div className="modal-backdrop fade show"></div>
            </>;
        } else
            return null;
    };

    return <>
        {
            <NavBar
                unseennotificationcount={unseennotificationcount}
                onAddPostClick={() => { console.log("add post click"); }}
                onSearchClick={() => { setShowSearch(true); }}
                onNotificationClick={() => { setShowNotification(true); }} />
        }
        <div className="container-fluid">
            <div className="row">
                <div className="col-md-1 sidemenubar d-none d-md-block">
                    <Sidebar unseennotificationcount={unseennotificationcount}
                        onAddPostClick={() => { console.log("add post click"); }}
                        onSearchClick={() => { setShowSearch(true); }}
                        onNotificationClick={() => { setShowNotification(true); }} />
                </div>
                <div className="col">
                    <Fragment>
                        {props.children}
                        {showSearchModal()}
                        {showNotificationModal()}
                        <SendPulse />
                    </Fragment>
                </div>
            </div>
        </div>
        
    </>;
}

export default Layout;