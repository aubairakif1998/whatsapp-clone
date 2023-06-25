import { auth } from "../firebase";

export const signIn = async (email, password) => {
  try {
    const authUser = await auth.signInWithEmailAndPassword(email, password);
    return authUser;
  } catch (error) {
    alert(error.message);
  }
};

export const signup = async (email, password) => {
  try {
    const authUser = await auth.createUserWithEmailAndPassword(email, password);
    // --console.log("Signup - successfully ==>", authUser);
    return authUser;
  } catch (error) {
    alert(error.message);
    return null;
  }
};
