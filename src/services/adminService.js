import { httpsCallable } from "firebase/functions";
import { functions } from "../firebaseConfig";

export const listUsersFunction = httpsCallable(
  functions,
  "listUsers"
);

export const setUserRoleFunction = httpsCallable(
  functions,
  "setUserRole"
);

export const setUserDisabledFunction = httpsCallable(
  functions,
  "setUserDisabled"
);