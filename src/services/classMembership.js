import {collection,collectionGroup,query,where,getDocs,getDoc,doc,runTransaction,serverTimestamp,arrayRemove} from 'firebase/firestore';
import {db} from '@/firebaseConfig';
const record = snapshot => ({...snapshot.data(),id:snapshot.id});
export async function listPublicClasses(){
  return (await getDocs(query(collection(db,'classes'),where('isPublic','==',true)))).docs.map(record);
}
export async function listStudentClasses(uid){
  const [available,memberships,legacy]=await Promise.all([
    listPublicClasses(),getDocs(query(collectionGroup(db,'students'),where('uid','==',uid))),
    getDocs(query(collection(db,'classes'),where('approvedStudents','array-contains',uid))),
  ]);
  const joined=new Map(legacy.docs.map(s=>[s.id,record(s)]));
  for(const membership of memberships.docs){
    const classRef=membership.ref.parent.parent;
    // Only canonical classroom membership paths belong to this dashboard.
    if(!classRef || classRef.parent.path!=='classes')continue;
    try{const snapshot=await getDoc(classRef);if(snapshot.exists())joined.set(snapshot.id,record(snapshot));}
    catch(error){if(error.code!=='permission-denied')throw error;}
  }
  return {joined:[...joined.values()],available:available.filter(c=>!joined.has(c.id))};
}
export async function joinPublicClass(classId,user){
  const classRef=doc(db,'classes',classId),memberRef=doc(classRef,'students',user.uid);
  await runTransaction(db,async tx=>{
    const [classSnap,membership]=await Promise.all([tx.get(classRef),tx.get(memberRef)]);
    if(membership.exists())return;
    if(!classSnap.exists()||classSnap.data().isPublic!==true)throw new Error('This class is not open for enrollment.');
    tx.set(memberRef,{uid:user.uid,email:user.email||'',joinedAt:serverTimestamp()});
  });
}
export async function resolveLegacyJoinRequest(classId,uid,accept){
  const classRef=doc(db,'classes',classId),memberRef=doc(classRef,'students',uid);
  await runTransaction(db,async tx=>{
    const [classSnap,membership]=await Promise.all([tx.get(classRef),tx.get(memberRef)]);
    if(!classSnap.exists()||!classSnap.data().pendingStudents?.includes(uid))throw new Error('This request has already been processed.');
    if(accept&&!membership.exists())tx.set(memberRef,{uid,joinedAt:serverTimestamp()});
    tx.update(classRef,{pendingStudents:arrayRemove(uid)});
  });
}
