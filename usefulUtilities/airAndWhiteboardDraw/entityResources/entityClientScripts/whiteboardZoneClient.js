//
//  drawSphereRemoverClient.js
//
//  created by Rebecca Stankus on 03/28/19
//  Copyright 2019 High Fidelity, Inc.
//
//  Distributed under the Apache License, Version 2.0.
//  See the accompanying file LICENSE or http://www.apache.org/licenses/LICENSE-2.0.html
//

(function() {
    var _this;

    var RGB_MAX_VALUE = 255;
    var DECIMAL_PLACES = 2;

    var injector;
    var whiteboard;

    var WhiteboardZone = function() {
        _this = this;
    };

    WhiteboardZone.prototype = {

        /* ON PRELOAD: Save a reference to this */
        preload: function(entityID) {
            _this.entityID = entityID;
            whiteboard = Entities.getEntityProperties(_this.entityID, 'parentID').parentID;
            MyAvatar.disableHandTouchForID(whiteboard);
            Entities.getChildrenIDs(whiteboard).forEach(function(whiteboardPiece) {
                MyAvatar.disableHandTouchForID(whiteboardPiece);
            });
        },

        /* PLAY A SOUND: Plays the specified sound at the position of the user's Avatar using the volume and playback 
        mode requested. */
        playSound: function(sound, volume, position, localOnly, loop){
            if (sound.downloaded) {
                if (injector) {
                    injector.stop();
                    injector = null;
                }
                injector = Audio.playSound(sound, {
                    position: position,
                    volume: volume,
                    localOnly: localOnly,
                    loop: loop
                });
            }
        },

        /* Convert RGB value to 0-1 scale */
        rgbConversion: function(rgbColorValue) {
            return (rgbColorValue/RGB_MAX_VALUE).toFixed(DECIMAL_PLACES);
        },
        
        /* Check for existing paint sphere and delete if found */
        removePaintSpheres: function() {
            MyAvatar.getAvatarEntitiesVariant().forEach(function(avatarEntity) {
                var name = Entities.getEntityProperties(avatarEntity.id, 'name').name;
                if (name && (name === "Whiteboard Paint Sphere" || name === "Whiteboard Paint Sphere Material")) {
                    Entities.deleteEntity(avatarEntity.id);
                }
            });
        },

        /* Create black paint sphere on user's hand */
        enterEntity: function() {
            print("ENTER");
            var paletteSquares = [];
            Entities.getChildrenIDs(whiteboard).forEach(function(whiteboardPiece) {
                var name = Entities.getEntityProperties(whiteboardPiece, 'name').name;
                if (name === "Whiteboard Palette Square") {
                    paletteSquares.push(whiteboardPiece);
                }
            });
            var numberPaletteSquares = paletteSquares.length;
            var randomPaletteSquareIndex = Math.floor(Math.random() * numberPaletteSquares);
            print("CALLING MOUSE PRESS ON ", paletteSquares[randomPaletteSquareIndex]);
            Entities.callEntityMethod(paletteSquares[randomPaletteSquareIndex],'createPaintSphere');
        },

        /* when clicked or triggered, calculate position of avatar's hand and create a paint sphere */
        leaveEntity: function( entityID, event ) {
            print("LEAVE");
            _this.removePaintSpheres();
        },

        /* ON UNLOADING THE SCRIPT: Make sure the avatar leaves the zone so extra entities are deleted and intervals ended */
        unload: function(){
            _this.removePaintSpheres();
        }
    };
    return new WhiteboardZone();
});
