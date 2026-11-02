export const MAX_CLASS_UPLOAD_BYTES = 20 * 1024 * 1024;
const allowed = /^(image\/.*|audio\/.*|video\/.*|text\/plain|text\/csv|application\/pdf|application\/zip|application\/octet-stream|application\/msword|application\/vnd\..*)$/;
export function validateClassUpload(file){
  if(file.size>MAX_CLASS_UPLOAD_BYTES)throw new Error('Please choose a file no larger than 20 MB.');
  if(!allowed.test(file.type||'application/octet-stream'))throw new Error('This file type is not supported for class uploads.');
}
