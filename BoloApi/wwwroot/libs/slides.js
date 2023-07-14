(function ($) {
    var methods = {
        moveto: function (args) {
            return this.each(function () {
                var selObject = $(this);
                obj = selObject.data('slides').options;
                old = selObject.data('currentslideindex');
                if (old == args.index) { return; }
                if (!selObject.data('animating')) {
                    selObject.data('animating', true);
                    if (args.index == 0) {
                        if (obj.OnStart != null) { obj.OnStart(); }
                    }
                    var hideanimate = null, showanimate = null;
                    if (old > args.index) {
                        hideanimate = obj.PrevHideAnimate;
                        showanimate = obj.PrevShowAnimate;
                    } else {
                        hideanimate = obj.NextHideAnimate;
                        showanimate = obj.NextShowAnimate;
                    }
                    selObject.children("[rst-slide-index =" + old + "]").hide(hideanimate.Effect, hideanimate.Props, hideanimate.Interval, function () { });
                    currentslide = selObject.children("[rst-slide-index =" + args.index + "]");
                    currentslide.show(showanimate.Effect, showanimate.Props, showanimate.Interval, function () {
                        if (obj.AdjustHeight) { selObject.animate({ height: currentslide.outerHeight(true) }); }
                        selObject.data('animating', false);
                        selObject.data('currentslideindex', args.index);
                        selObject.data("timepassed", 0);
                    });
                    if (args.index == selObject.children(obj.ItemSelector).length - 1) {
                        if (obj.OnEnd != null) { obj.OnEnd(); }
                    }
                    if (obj.OnChange != null) { obj.OnChange(old, args.index); }
                }

            });
        },
        init: function (options) {
            var defaultVal = {
                ItemSelector: '.rst-slide',
                AutoPlay: true,
                AdjustHeight: true,
                StartSlide: 0,
                ScrollInterval: 5,
                NextHideAnimate: { Effect: 'slide', Props: { direction: 'right' }, Interval: 1000 },
                PrevHideAnimate: { Effect: 'slide', Props: { direction: 'left' }, Interval: 1000 },
                NextShowAnimate: { Effect: 'slide', Props: { direction: 'left' }, Interval: 1000 },
                PrevShowAnimate: { Effect: 'slide', Props: { direction: 'right' }, Interval: 1000 },
                HoverPause: false,
                Circular: false,
                NextHandle: null,
                PrevHandle: null,
                PlayHandle: null,
                PauseHandle: null,
                OnInit: null,
                OnInitComplete: null,
                OnPaused: null,
                OnChange: null,
                OnStart: null,
                OnEnd: null
            };

            return this.each(function () {
                var obj = jQuery.extend(true, {}, defaultVal);
                obj = jQuery.extend(obj, options);
                if (obj.OnInit != null) {
                    obj.OnInit();
                }

                var selObject = $(this);
                var data = selObject.data('slides');
                var nextobj = null;
                var prevobj = null;
                var slidecount = 0;
                var playstatus = false;
                var intervalhandle = null;
                var currentslide = null;
                var mouseover = false;
                var direction = "r";
                var navpanel = $("<div class='rstslidenavpanel' />");

                if (obj.AutoPlay) {
                    playstatus = true;
                }
                selObject.css("position", "relative");

                if (jQuery.type(obj.PrevHandle) == "object") {
                    prevobj = obj.PrevHandle;
                }
                else if (jQuery.type(obj.PrevHandle) == "null") {
                    prevobj = $("<button type='button' class='rstslideprevbtn'></button>");
                    prevobj.appendTo(navpanel);
                    obj.PrevHandle = prevobj;
                }

                //                if (jQuery.type(obj.PlayHandle) == "null") {
                //                    obj.PlayHandle = $("<button type='button' class='rstslideplaybtn'></button>");
                //                    obj.PlayHandle.appendTo(navpanel);
                //                }

                //                if (jQuery.type(obj.PauseHandle) == "null") {
                //                    obj.PauseHandle = $("<button type='button' class='rstslidepausebtn'></button>");
                //                    obj.PauseHandle.appendTo(navpanel);
                //                }

                if (jQuery.type(obj.NextHandle) == "object") {
                    nextobj = obj.NextHandle;
                }

                if (jQuery.type(obj.NextHandle) == "null") {
                    nextobj = $("<button class='rstslidenextbtn' type='button'></button>");
                    nextobj.appendTo(navpanel);
                    obj.NextHandle = nextobj;
                }

                if (navpanel.children().length > 0) {
                    navpanel.appendTo(selObject);
                }

                if (!data) {
                    selObject.data('slides', {
                        options: obj
                    });
                }
                selObject.data('animating', false);
                selObject.data('timepassed', 0);
                selObject.data('currentslideindex', obj.StartSlide);

                var showslide = function (old, index, showeffect, hideeffect) {
                    if (!selObject.data('animating')) {
                        selObject.data('animating', true);
                        if (index == 0) {
                            if (selObject.data('slides').options.OnStart != null) { selObject.data('slides').options.OnStart(); }
                        }
                        selObject.children("[rst-slide-index =" + old + "]").hide(hideeffect.Effect, hideeffect.Props, hideeffect.Interval, function () { });
                        currentslide = selObject.children("[rst-slide-index =" + index + "]");
                        currentslide.show(showeffect.Effect, showeffect.Props, showeffect.Interval, function () {
                            if (obj.AdjustHeight) { selObject.animate({ height: currentslide.outerHeight(true) }); }
                            selObject.data('animating', false);
                            selObject.data('currentslideindex', index);
                            selObject.data("timepassed", 0);
                        });
                        if (index == (slidecount - 1)) {
                            if (selObject.data('slides').options.OnEnd != null) { selObject.data('slides').options.OnEnd(); }
                        }
                        if (selObject.data('slides').options.OnChange != null) { selObject.data('slides').options.OnChange(old, index); }
                    }
                };

                var movenext = function () {
                    if (!selObject.data('animating')) {
                        var oldindex = selObject.data('currentslideindex');
                        newindex = oldindex + 1;

                        if (newindex >= selObject.children(obj.ItemSelector).length) {
                            if (obj.Circular) {
                                newindex = 0;
                            } else { direction = "l"; newindex = selObject.children(obj.ItemSelector).length - 1; }
                        }
                        if (newindex != oldindex) {
                            showslide(oldindex, newindex, obj.NextShowAnimate, obj.NextHideAnimate);
                        }
                    }
                };

                var moveprev = function () {
                    if (!selObject.data('animating')) {
                        var oldindex = selObject.data('currentslideindex');
                        newindex = oldindex - 1;

                        if (newindex < 0) {
                            if (obj.Circular) {
                                newindex = selObject.children(obj.ItemSelector).length - 1;
                            }
                            else { direction = "r"; newindex = 0; }
                        }
                        if (newindex != oldindex) {
                            showslide(oldindex, newindex, obj.PrevShowAnimate, obj.PrevHideAnimate);
                        }
                    }
                };

                var play = function () {
                    if (intervalhandle == null) {
                        intervalhandle = setInterval(function () {
                            selObject.data("timepassed", selObject.data("timepassed") + 1);
                            if (playstatus && selObject.data("timepassed") == obj.ScrollInterval) {
                                selObject.data("timepassed", 0);
                                if (direction == "r") { movenext(); }
                                else if (direction == "l") { moveprev(); }
                            }
                        }, 1000);

                        if (obj.PlayHandle != null && obj.PlayHandle.is(":visible")) {
                            obj.PlayHandle.css("display", "none");
                        }
                        if (obj.PauseHandle != null && !obj.PauseHandle.is(":visible")) {
                            obj.PauseHandle.css("display", "inline-block");
                        }
                    }
                };
                var pause = function () {
                    clearInterval(intervalhandle);
                    intervalhandle = null;

                    if (obj.PauseHandle != null && obj.PauseHandle.is(":visible")) {
                        obj.PauseHandle.css("display", "none");
                    }
                    if (obj.PlayHandle != null && !obj.PlayHandle.is(":visible")) {
                        obj.PlayHandle.css("display", "inline-block");
                    }

                };

                if (obj.PlayHandle != null) {
                    obj.PlayHandle.click(function () { playstatus = true; play(); });
                }

                if (obj.PauseHandle != null) {
                    obj.PauseHandle.click(function () { pause(); });
                }

                if (obj.AutoPlay) {
                    play();
                }
                else {
                    if (obj.PlayHandle != null) {
                        obj.PlayHandle.css("display", "inline-block");
                    }
                    if (obj.PauseHandle != null) {
                        obj.PauseHandle.css("display", "none");
                    }
                }

                selObject.mouseover(function () {
                    if (obj.HoverPause) { playstatus = false; if (obj.OnPaused != null) { obj.OnPaused(index); } }
                });

                selObject.mouseout(function () {
                    if (obj.HoverPause) { playstatus = true; }
                });

                nextobj.click(function () {
                    pause();
                    movenext();
                    play();
                });
                prevobj.click(function () {
                    pause();
                    moveprev();
                    play();
                });
                try {
                    selObject.swipe({ OnSwipe: function (detail) {
                        if (detail.direction == "l" || detail.direction == "u") {
                            pause();
                            moveprev();
                            play();
                        } else if (detail.direction == "r" || detail.direction == "d") {
                            pause();
                            movenext();
                            play();
                        }
                    }
                    });
                }
                catch (e) { }
                $(document).keydown(function (e) {
                    if (mouseover) {
                        if (e.keyCode == 37) {
                            pause();
                            moveprev();
                            play();
                        }
                        else if (e.keyCode == 39) {
                            pause();
                            movenext();
                            play();
                        }
                    }
                });
                selObject.mouseover(function () { mouseover = true; });
                selObject.mouseout(function () { mouseover = false; });
                slidecount = selObject.children(obj.ItemSelector).length;
                selObject.children(obj.ItemSelector).each(function (index) {
                    var si = $(this);
                    si.css("width", "100%");
                    si.css("position", "absolute");
                    si.attr("rst-slide-index", index);
                    si.css("display", "none");

                    if (index == obj.StartSlide) {
                        if (obj.AdjustHeight) {
                            selObject.height(si.outerHeight(true));
                        }
                        si.show();
                        currentslide = si;
                    }

                });
                if (obj.OnInitComplete != null) {
                    obj.OnInitComplete();
                }
            });
        }
    };
    $.fn.slides = function (method) {
        if (methods[method]) {
            return methods[method].apply(this, Array.prototype.slice.call(arguments, 1));
        } else if (typeof method === 'object' || !method) {
            return methods.init.apply(this, arguments);
        } else {
            $.error('Method ' + method + ' does not exist on jQuery.slides');
        }

    };
})(jQuery);