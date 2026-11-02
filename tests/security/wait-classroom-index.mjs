import {GoogleAuth} from 'google-auth-library';
import {setTimeout} from 'node:timers/promises';
const project=process.argv[2];
if(!project || !/^[a-z0-9-]+$/.test(project))throw new Error('A project ID is required');
const client=await new GoogleAuth({scopes:['https://www.googleapis.com/auth/datastore']}).getClient();
const url=`https://firestore.googleapis.com/v1/projects/${project}/databases/(default)/collectionGroups/students/fields/uid`;
for(let attempt=0;attempt<40;attempt++){
 const {data}=await client.request({url});
 const index=data.indexConfig?.indexes?.find(i=>i.queryScope==='COLLECTION_GROUP'&&i.fields?.some(f=>f.fieldPath==='uid'&&f.order==='ASCENDING'));
 if(index?.state==='READY'){console.log('Classroom membership index is ready');process.exit(0);}
 if(index?.state==='NEEDS_REPAIR')throw new Error('Classroom index requires repair');
 console.log('Waiting for classroom membership index',index?.state||'not yet visible');
 await setTimeout(15000);
}
throw new Error('Classroom membership index was not ready within 10 minutes; Hosting deployment stopped');
