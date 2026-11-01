import assert from "node:assert/strict";
import { interpolateCameraState } from "../src/platform/agent/cameraSessionTransition.js";

const start = {x:0,y:0,zoom:1,yawDegrees:0,pitchDegrees:0};
const end = {x:0.4,y:-0.2,zoom:3,yawDegrees:360,pitchDegrees:30};
assert.deepEqual(interpolateCameraState(start,end,0),start);
assert.deepEqual(interpolateCameraState(start,end,1),end);
const halfway=interpolateCameraState(start,end,0.5);
assert.equal(halfway.zoom,2);
assert.equal(halfway.yawDegrees,180);
assert.equal(halfway.pitchDegrees,15);
assert.equal(interpolateCameraState(start,end,0.25,"linear").yawDegrees,90);
assert.equal(interpolateCameraState(start,end,-1).zoom,1);
assert.equal(interpolateCameraState(start,end,2).zoom,3);
assert.throws(()=>interpolateCameraState(start,end,NaN),RangeError);
console.log("Universal camera tween interpolation PASS");
