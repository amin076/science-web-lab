/** SI-independent vector primitives. Vectors are finite [x,y,z] arrays. */
export function finite(value, name = 'value') {
  if (!Number.isFinite(value)) throw new TypeError(`${name} must be finite`);
  return value;
}
export function positive(value, name) {
  finite(value, name);
  if (value <= 0) throw new RangeError(`${name} must be positive`);
  return value;
}
export function vector3(value, name = 'vector') {
  if (!Array.isArray(value) || value.length !== 3) throw new TypeError(`${name} must be [x,y,z]`);
  return value.map((x) => finite(x, name));
}
export const add = (a,b) => vector3(a).map((x,i) => finite(x + vector3(b)[i]));
export const scale = (a,k) => vector3(a).map(x => finite(x * finite(k)));
export const subtract = (a,b) => add(a, scale(b,-1));
export const dot = (a,b) => finite(vector3(a).reduce((s,x,i) => s + x * vector3(b)[i],0));
export const magnitude = a => Math.hypot(...vector3(a));
export function cross(a,b) {
  const [x,y,z]=vector3(a), [u,v,w]=vector3(b);
  return vector3([y*w-z*v,z*u-x*w,x*v-y*u]);
}
