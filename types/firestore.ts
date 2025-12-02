import { Timestamp } from "firebase/firestore";

export interface UserData {
  dateCreated: Timestamp;
  dateUpdated: Timestamp;
  email: string;
  name: string;
  permission: "admin" | "user";
}

export interface Permissions {
  adminPortal: boolean;
  createNewAccount: boolean;
  deleteAccount: boolean;
  editAccount: boolean;
  viewAccount: boolean;
}
