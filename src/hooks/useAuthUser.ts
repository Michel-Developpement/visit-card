import {
  User,
  browserSessionPersistence,
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  setPersistence,
  signInWithEmailAndPassword,
  signOut,
} from "firebase/auth";
import { Timestamp } from "firebase/firestore";
import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { auth } from "../firebase/firebase.config";
import useDatabase from "./useDatabase";

const useAuthUser = () => {
  const [authUser, setAuthUser] = React.useState<User | null>(null);
  const [errorFirebaseUser, setErrorFirebaseUser] = React.useState("");
  const { createUserDocument } = useDatabase();

  const navigate = useNavigate();

  const loginUser = async (
    email: string,
    password: string
  ): Promise<void | { error: boolean }> => {
    const authentification = await setPersistence(
      auth,
      browserSessionPersistence
    )
      .then(async () => {
        return await signInWithEmailAndPassword(auth, email, password)
          .then((userCredential) => setAuthUser(userCredential.user))
          .then(() => setErrorFirebaseUser(""));
      })
      .then(() => navigate("/"))
      .catch((error) => {
        setErrorFirebaseUser(error.message);
        return { error: true };
      });

    return authentification;
  };

  useEffect(() => {
    onAuthStateChanged(auth, async (user) => {
      if (user) {
        setAuthUser(user);
      } else {
        setAuthUser(null);
      }
    });
  }, []);

  const registerUser = async (
    email: string,
    password: string,
    firstname: string,
    lastname: string
  ): Promise<void | {
    error: boolean;
  }> => {
    const signupUser = await createUserWithEmailAndPassword(
      auth,
      email,
      password
    )
      .then((userCredential) => {
        setAuthUser(userCredential.user);
        createUserDocument(userCredential.user.uid, {
          mailSignUp: userCredential.user.email,
          firstname: firstname.toLowerCase(),
          lastname: lastname.toLowerCase(),
          dateSignUp: Timestamp.now(),
        });
      })
      .then(() => navigate("/"))
      .then(() => setErrorFirebaseUser(""))
      .catch((error) => {
        setErrorFirebaseUser(error.message);
        return { error: true };
      });
    return signupUser;
  };

  const logoutUser = async () => {
    await signOut(auth)
      .then(() => {
        setAuthUser(null);
        setErrorFirebaseUser("");
      })
      .catch((error) => setErrorFirebaseUser(error.message));
  };

  return { authUser, loginUser, registerUser, logoutUser, errorFirebaseUser };
};

export default useAuthUser;
