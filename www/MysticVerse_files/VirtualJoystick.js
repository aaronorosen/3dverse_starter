//------------------------------------------------------------------------------
var VirtualJoystick = function(sdk)
{
    this.inputRelay = sdk.streamer.inputRelay;
    this.keys       =
    {
        forward   : 73,
        backward  : 75,
        up        : 69,
        down      : 81
    };


    //--------------------------------------------------------------------------
    this.create = function(container, options)
    {
        var joystickOptions = Object.assign(
            {
                zone: $(container)[0],
                color: 'black',
                position: {left: 1, top: 1},
                mode: 'static',
                restJoystick: true,
                restOpacity: 0.2,
                size: 80
            },
            options
        );

        return nipplejs.create(joystickOptions);
    };

    //--------------------------------------------------------------------------
    this.bind = function(joystick, type)
    {
        var getAxisFromEvent = function(data)
        {
            const stick     = data.instance;
            const radius    = stick.options.size / 2;
            const relativeX = data.position.x - stick.position.x;
            const relativeY = data.position.y - stick.position.y;

            return {
                x : -relativeX / radius,
                y : relativeY / radius
            };
        };

        let prevDir = null;
        let map     = null;

        switch(type)
        {
            case 'straffXZ':
                map     = { up: 'forward', down: 'backward' };

                joystick.on('plain', (e, data) =>
                {
                    const dir = data.direction.y;

                    if(prevDir && prevDir !== dir)
                    {
                        this.inputRelay.OnKeyUp({ keyCode: this.keys[map[prevDir]] });
                    }

                    prevDir = dir;
                    this.inputRelay.OnKeyDown({ keyCode: this.keys[map[prevDir]] });
                });

                joystick.on('move', (e, data) =>
                {
                    const axis = getAxisFromEvent(data);
                    this.inputRelay.sendControllerAxis(0, this.inputRelay.controllerAxis.LeftThumbstickX, axis.x);
                });

                joystick.on('end', (e, data) =>
                {
                    this.inputRelay.sendControllerAxis(0, this.inputRelay.controllerAxis.LeftThumbstickX, 0.0);

                    if(prevDir)
                    {
                        this.inputRelay.OnKeyUp({ keyCode: this.keys[map[prevDir]] });
                    }
                });
                break;

            case 'straffY':
                map = { up: 'up', down: 'down' };

                joystick.on('plain', (e, data) =>
                {
                    var dir = data.direction.y;

                    if(prevDir && prevDir !== dir)
                    {
                        this.inputRelay.OnKeyUp({ keyCode: this.keys[map[prevDir]] });
                    }

                    prevDir = dir;
                    this.inputRelay.OnKeyDown({ keyCode: this.keys[map[prevDir]] });
                });

                joystick.on('end', (e, data) =>
                {
                    if(prevDir)
                    {
                        this.inputRelay.OnKeyUp({ keyCode: this.keys[map[prevDir]] });
                    }
                });
                break;

            case 'look':
                joystick.on('move', (e, data) =>
                {
                    const axis = getAxisFromEvent(data);
                    this.inputRelay.sendControllerAxis(0, this.inputRelay.controllerAxis.RightThumbstickX, axis.x);
                    this.inputRelay.sendControllerAxis(0, this.inputRelay.controllerAxis.RightThumbstickY, axis.y);
                });

                joystick.on('end', (e, data) =>
                {
                    this.inputRelay.sendControllerAxis(0,this.inputRelay.controllerAxis.RightThumbstickX, 0.0);
                    this.inputRelay.sendControllerAxis(0,this.inputRelay.controllerAxis.RightThumbstickY, 0.0);
                });
                break;

        }
    };

    return this;
};
