/**
 * Canonical, DOM-free Euclidean geometry for regular polygons sharing a circle.
 * Radius is an abstract length unit; measurements use R and R².
 * Both polygons have a horizontal lower edge in the canonical orientation.
 */
export const POLYGON_ID = "math.geometry.regular-polygons-circle";
export const POLYGON_DEFAULTS = Object.freeze({
  sides: 3, radius: 2, showGuides: true, showTangencies: true,
  showAngles: true, animationSpeed: 1,
});
export const POLYGON_SCHEMA = Object.freeze({
  type: "object", additionalProperties: false, properties: {
    sides: {type:"integer",minimum:3,maximum:100,default:3,description:"Number of polygon sides"},
    radius: {type:"number",minimum:0.1,maximum:10000,default:2,description:"Circle radius R, length units"},
    showGuides: {type:"boolean",default:true,description:"Show auxiliary radii and apothems"},
    showTangencies: {type:"boolean",default:true,description:"Show tangent points"},
    showAngles: {type:"boolean",default:true,description:"Show central angle annotations"},
    animationSpeed: {type:"number",minimum:0.1,maximum:5,default:1,description:"Highlighted sector revolutions per minute"},
  },
});
const isPlain = x => x !== null && typeof x === "object" && !Array.isArray(x) && Object.getPrototypeOf(x) === Object.prototype;
export function validatePolygonParameters(input) {
  if (!isPlain(input)) throw new TypeError("Parameters must be a plain object");
  const next = {...POLYGON_DEFAULTS};
  for(const [key,value] of Object.entries(input)){
    const rule=POLYGON_SCHEMA.properties[key];
    if(!rule)throw new RangeError("Unknown polygon parameter: "+key);
    if(rule.type==="boolean" ? typeof value!=="boolean" :
      typeof value!=="number" || !Number.isFinite(value) ||
      (rule.type==="integer"&&!Number.isInteger(value)) || value<rule.minimum || value>rule.maximum)
      throw new RangeError("Invalid polygon parameter: "+key);
    next[key]=value;
  }
  return next;
}
export function computeRegularPolygons(n, R) {
  if(!Number.isSafeInteger(n)||n<3||n>100)throw new RangeError("sides must be an integer 3..100");
  if(typeof R!=="number"||!Number.isFinite(R)||R<0.1||R>10000)throw new RangeError("radius must be 0.1..10000");
  const theta = Math.PI/n, cosine=Math.cos(theta), sine=Math.sin(theta), tangent=Math.tan(theta);
  const innerSide=2*R*sine, outerSide=2*R*tangent;
  const innerArea=n*R*R*Math.sin(2*theta)/2, outerArea=n*R*R*tangent;
  const innerApothem=R*cosine, outerCircumradius=R/cosine;
  // Height is measured from the horizontal bottom edge to the highest vertex/edge.
  const odd=n%2===1;
  const innerHeight=odd ? R+innerApothem : 2*innerApothem;
  const outerHeight=odd ? R+outerCircumradius : 2*R;
  const inner={side:innerSide,perimeter:n*innerSide,area:innerArea,apothem:innerApothem,
    circumradius:R,height:innerHeight};
  const outer={side:outerSide,perimeter:n*outerSide,area:outerArea,apothem:R,
    circumradius:outerCircumradius,height:outerHeight};
  return {sides:n,radius:R,centralAngleDegrees:360/n,interiorAngleDegrees:180-360/n,
    exteriorAngleDegrees:360/n,inner,outer,
    ratios:{side:1/cosine,perimeter:1/cosine,area:1/(cosine*cosine)},
    circle:{area:Math.PI*R*R,circumference:2*Math.PI*R},
    areaGap:outerArea-innerArea,
    // Symbolic coefficients: multiply length values by R and areas by R².
    coefficients:{innerSide:2*sine,outerSide:2*tangent,
      innerPerimeter:2*n*sine,outerPerimeter:2*n*tangent,
      innerArea:n*Math.sin(2*theta)/2,outerArea:n*tangent,
      innerHeight:innerHeight/R,outerHeight:outerHeight/R,
      innerApothem:cosine,outerApothem:1},
  };
}
export function createRegularPolygonModel(initial={}) {
  let parameters=validatePolygonParameters(initial);
  let elapsedSeconds=0;
  const getParameters=()=>({...parameters});
  const snapshot=()=>({
    modelVersion:"esbiko-regular-polygons.v1",
    units:{length:"circle-radius units",area:"circle-radius squared",angle:"degrees",time:"seconds"},
    parameters:getParameters(),timeSeconds:elapsedSeconds,elapsedSeconds,
    phaseRadians:elapsedSeconds*parameters.animationSpeed*2*Math.PI/60,
    geometry:computeRegularPolygons(parameters.sides,parameters.radius),
  });
  const reset=(patch)=>{if(patch!==undefined)parameters=validatePolygonParameters(patch);
    elapsedSeconds=0;return snapshot();};
  const configure=(patch)=>{parameters=validatePolygonParameters({...parameters,...patch});
    elapsedSeconds=0;return {reset:true,parameters:getParameters()};};
  const step=(dt)=>{if(!Number.isFinite(dt)||dt<0||dt>2)throw new RangeError("Invalid time step");
    elapsedSeconds+=dt;return snapshot();};
  const checkpoint=()=>({parameters:getParameters(),timeSeconds:elapsedSeconds});
  const restore=(saved)=>{
    if(!isPlain(saved)||typeof saved.timeSeconds!=="number"||
      !Number.isFinite(saved.timeSeconds)||saved.timeSeconds<0||saved.timeSeconds>120)
      throw new RangeError("Invalid polygon checkpoint");
    parameters=validatePolygonParameters(saved.parameters);elapsedSeconds=saved.timeSeconds;
    return snapshot();
  };
  return {getParameters,snapshot,configure,reset,step,checkpoint,restore,
    advance:step,trajectory:()=>[]};
}
