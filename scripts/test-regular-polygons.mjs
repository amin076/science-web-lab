/* eslint-env node */
import assert from "node:assert/strict";
import {computeRegularPolygons,createRegularPolygonModel,validatePolygonParameters} from "../src/esbiko-physics/math/regularPolygonModel.js";
const near=(a,b,tol=1e-10)=>assert.ok(Math.abs(a-b)<=tol*Math.max(1,Math.abs(a),Math.abs(b)),a+" != "+b);
for(const n of [3,4,5,6,8,12,20,50,100]){
  for(const R of [0.1,1,2,10,10000]){
    const g=computeRegularPolygons(n,R),c=Math.cos(Math.PI/n);
    near(g.inner.area,n*R*R*Math.sin(2*Math.PI/n)/2);
    near(g.outer.area,n*R*R*Math.tan(Math.PI/n));
    near(g.inner.apothem,R*c);
    near(g.outer.apothem,R);
    near(g.inner.side,2*R*Math.sin(Math.PI/n));
    near(g.outer.side,2*R*Math.tan(Math.PI/n));
    near(g.ratios.area,1/(c*c));
    near(g.ratios.side,g.outer.side/g.inner.side);
    near(g.centralAngleDegrees+g.interiorAngleDegrees,180);
    assert.ok(g.inner.area<=g.circle.area&&g.circle.area<=g.outer.area);
    if(n%2===0){near(g.inner.height,2*R*c);near(g.outer.height,2*R);}
    else {near(g.inner.height,R*(1+c));near(g.outer.height,R+R/c);}
  }
}
const t=computeRegularPolygons(3,2),s=computeRegularPolygons(4,2);
near(t.inner.side,2*Math.sqrt(3));near(t.outer.side,4*Math.sqrt(3));
near(t.ratios.area,4);near(t.inner.height,3);near(t.outer.height,6);
near(s.inner.area,8);near(s.outer.area,16);near(s.ratios.area,2);
near(s.inner.height,2*Math.sqrt(2));near(s.outer.height,4);
const model=createRegularPolygonModel({sides:5,radius:3});
const saved=model.checkpoint();model.advance(1.5);assert.equal(model.snapshot().timeSeconds,1.5);
model.restore(saved);assert.equal(model.snapshot().timeSeconds,0);
model.configure({sides:20});assert.equal(model.snapshot().geometry.sides,20);
assert.equal(model.snapshot().parameters.radius,3);
for(const bad of [{sides:2},{sides:101},{sides:3.5},{radius:Infinity},{radius:0},{invalid:1},{animationSpeed:0}]){
 assert.throws(()=>validatePolygonParameters(bad));
}
console.log("Regular polygon model: passed geometry, scaling, limits, validation, reset and checkpoint checks.");
