//------------------------------------------------------------------------------
var SpeedSwiper = function(sdk)
{
    //--------------------------------------------------------------------------
    this.create = function(container, options)
    {
        // Ensure no scroll especially for ios
        container.on('touchmove', function(e) { e.preventDefault(); });

        var swiperOptions = Object.assign(
            {
                loop: false,
                direction: "vertical",
                speed: 100,
                grabCursor: true,
                mousewheelControl: true,
                mousewheel: true,
                slidesPerView: 5,
                freeMode: true,
                freeModeMomentum: true,
                freeModeSticky: true,
                centeredSlides: true,
            },
            options
        );

        var swiper =  new Swiper(container.find('.swiper-container'), swiperOptions);
        for(var i=1; i <= 120; i+=1)
        {
            swiper.addSlide(0, '<div class="swiper-slide number__slider-item"><span>' + i + '</span></div>');
        }

        return swiper;
    };

    //--------------------------------------------------------------------------
    this.bind = function(swiper, canvas, startSpeed)
    {
        var previousSpeed = parseFloat($('.swiper-wrapper>.swiper-slide:nth-child('+(swiper.activeIndex+1)+')').text());
        console.log("initial speed", previousSpeed);

        var onSlideChange = function ()
        {
            var speed = parseFloat($('.swiper-wrapper>.swiper-slide:nth-child('+(swiper.activeIndex+1)+')').text());
            var deltaSpeed = speed - previousSpeed;

            console.log("delea speed", deltaSpeed);
            // some hack cause fast slide doesn't produce the right speed server side...
            setTimeout(function()
            {
                sdk.streamer.inputRelay.OnMouseWheel({wheelDelta: deltaSpeed * 120});
            }, 50);

            previousSpeed = speed;
        };

        swiper.on('slideChange', onSlideChange);

        if(startSpeed > 0)
        {
            swiper.slideTo(120 - startSpeed);
        }

        canvas.addEventListener('mousewheel', function(e)
        {
            var index = swiper.activeIndex;
            var hookChangeFunc = function()
            {
                swiper.on('slideChange', onSlideChange);
            };

            if(event.wheelDelta)
                index += -e.wheelDelta / 120;
            else
                index += -event.detail * -60;

            if(index > 119) index = 119;
            if(index < 0) index = 0;

            if(index === swiper.activeIndex) return;

            swiper.off('slideChange', onSlideChange);
            swiper.once('slideChange', hookChangeFunc);

            swiper.slideTo(index);
            previousSpeed = parseFloat($('.swiper-wrapper>.swiper-slide:nth-child('+(index+1)+')').text());
        });
    };
};