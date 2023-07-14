(function ($) {
    $.fn.swipe = function (options) {
        var defaultVal = {
            PreventDefault: true,
            EnableMouse: true,
            TrackMouse: 'click',
            Distance: 100,
            OnTouch: function (detail) { },
            OnMove: function (detail) { },
            OnSwipe: function (detail) { },
            OnEnd: function () { }
        };

        var obj = $.extend(defaultVal, options);
        var startTime;
        var endTime;


        return this.each(function () {
            var selobj = $(this);
            var curX, curY;
            var startX, startY;
            var mdown = false;

            var touchStart = function (event) {
                if (event.targetTouches.length > 1) { return; }

                startX = event.targetTouches[0].pageX;
                startY = event.targetTouches[0].pageY;
                curX = event.targetTouches[0].pageX;
                curY = event.targetTouches[0].pageY
                startTime = new Date();

                obj.OnTouch({ client: { x: event.targetTouches[0].clientX, y: event.targetTouches[0].clientY },
                    page: { x: event.targetTouches[0].pageX, y: event.targetTouches[0].pageY },
                    screen: { x: event.targetTouches[0].screenX, y: event.targetTouches[0].screenY }
                });
            };

            var mouseDown = function (e) {

                mdown = true;
                startX = e.pageX;
                startY = e.pageY;
                curX = e.pageX;
                curY = e.pageY;
                startTime = new Date();
                obj.OnTouch({ client: { x: e.clientX, y: e.clientY },
                    page: { x: e.pageX, y: e.pageY },
                    screen: { x: e.screenX, y: e.screenY }
                });

                if (obj.PreventDefault) {
                    e.preventDefault();
                }
            };

            var mouseMove = function (e) {

                if (mdown) {
                    det = {
                        diffx: e.pageX - curX,
                        diffy: e.pageY - curY,
                        client: { x: e.clientX, y: e.clientY },
                        page: { x: e.pageX, y: e.pageY },
                        screen: { x: e.screenX, y: e.screenY }
                    };
                    obj.OnMove(det);

                    curX = e.pageX;
                    curY = e.pageY;
                }
                if (obj.PreventDefault) {
                    e.preventDefault();
                }
            };

            var moveEnd = function (e) {
                if (mdown) {
                    var x = curX - startX;
                    var y = curY - startY;
                    endTime = Math.abs(new Date() - startTime) / 1000;
                    mdown = false;
                    if (Math.abs(x) >= Math.abs(y)) {
                        if (Math.abs(x) >= obj.Distance) {
                            if (x >= 0) {
                                det = { direction: 'r', distance: Math.abs(x), speed: (Math.abs(x) / endTime), time: endTime };
                                obj.OnSwipe(det);
                            }
                            else {
                                det = { direction: 'l', distance: Math.abs(x), speed: (Math.abs(x) / endTime), time: endTime };
                                obj.OnSwipe(det);
                            }
                        }
                    }
                    else {
                        if (Math.abs(y) >= obj.Distance) {
                            if (y >= 0) {
                                det = { direction: 'd', distance: Math.abs(y), speed: (Math.abs(y) / endTime), time: endTime };
                                obj.OnSwipe(det);
                            }
                            else {
                                det = { direction: 'u', distance: Math.abs(y), speed: (Math.abs(y) / endTime), time: endTime };
                                obj.OnSwipe(det);
                            }
                        }
                    }
                }
                if (obj.PreventDefault) {
                    e.preventDefault();
                }
                obj.OnEnd();
            };

            var touchMove = function (event) {

                if (event.targetTouches.length > 1) { return; }
                det = { diffx: event.targetTouches[0].pageX - curX, diffy: event.targetTouches[0].pageY - curY,
                    client: { x: event.targetTouches[0].clientX, y: event.targetTouches[0].clientY },
                    page: { x: event.targetTouches[0].pageX, y: event.targetTouches[0].pageY },
                    screen: { x: event.targetTouches[0].screenX, y: event.targetTouches[0].screenY },
                    evt : event
                };
                obj.OnMove(det);

                curX = event.targetTouches[0].pageX;
                curY = event.targetTouches[0].pageY;

                if (obj.PreventDefault) {
                    event.preventDefault();
                }
            };

            var touchEnd = function (event) {
                var x = curX - startX;
                var y = curY - startY;
                endTime = Math.abs(new Date() - startTime) / 1000;
                mdown = false;
                if (Math.abs(x) >= Math.abs(y)) {
                    if (Math.abs(x) >= obj.Distance) {
                        if (x >= 0) {
                            det = { direction: 'r', distance: Math.abs(x), speed: (Math.abs(x) / endTime), time: endTime };
                            obj.OnSwipe(det);
                        }
                        else {
                            det = { direction: 'l', distance: Math.abs(x), speed: (Math.abs(x) / endTime), time: endTime };
                            obj.OnSwipe(det);
                        }
                    }
                }
                else {
                    if (Math.abs(y) >= obj.Distance) {
                        if (y >= 0) {
                            det = { direction: 'd', distance: Math.abs(y), speed: (Math.abs(y) / endTime), time: endTime };
                            obj.OnSwipe(det);
                        }
                        else {
                            det = { direction: 'u', distance: Math.abs(y), speed: (Math.abs(y) / endTime), time: endTime };
                            obj.OnSwipe(det);
                        }
                    }
                }
                obj.OnEnd();
            };
            var touchCancel = function (event) { };
            if (obj.EnableMouse) {
                if (obj.TrackMouse == 'click') {
                    selobj.mousedown(function (e) {
                        if (!e) { e = window.event; }
                        var kc = (e.keyCode || e.which);
                        if (kc == 1) {
                            mouseDown(e);
                        }
                    });
                    selobj.mouseup(moveEnd);
                    $("body").mouseup(moveEnd);
                } else if (obj.TrackMouse == 'hover') {
                    selobj.mouseover(mouseDown);
                    selobj.mouseout(moveEnd);
                }
                selobj.mousemove(mouseMove);
            }

            this.addEventListener("touchstart", touchStart, false);
            this.addEventListener("touchmove", touchMove, false);
            this.addEventListener("touchend", touchEnd, false);
            this.addEventListener("touchcancel", touchCancel, false);
        });
    };
})(jQuery);