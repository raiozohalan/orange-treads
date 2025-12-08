"use client";

import { Activity, useState } from "react";
import FirebaseUI from "@/components/firebase/FirebaseUI";
import { signInWithEmailAndPassword, User } from "firebase/auth";
import firebaseFunctions from "@/firebase/firebaseFunctions";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { TextField, Button } from "@/components/common";
import { LoadingSpinner } from "@/components/icons";
import { auth } from "@/firebase/init";
import Alert, { AlertProps } from "@/components/common/Alert";
import logo from '@/assets/logo.webp';

const defaultSignInData = {
  email: "",
  password: "",
  showButtonLoading: false,
};

const page = () => {
  const router = useRouter();
  const [isLoading, setLoading] = useState<boolean>(false);
  const [signInData, setSignInData] = useState<{
    email: string;
    password: string;
    showButtonLoading: boolean;
  }>(defaultSignInData);
  const [error, setError] = useState<Omit<AlertProps, "onClose">>({
    type: "error",
    message: "",
  });

  const onSignInError = (error: Error) => {
    setError({
      type: "error",
      message: error.message,
    });
  };

  const onSignInSuccess = async (user: User) => {
    try {
      setLoading(true);
      setSignInData(defaultSignInData);
      setError({ type: "error", message: "" });
      const getUser = await firebaseFunctions.getItem("users", user.uid);

      if (getUser.permission) {
        const getPermissions = await firebaseFunctions.getItem(
          "permissions",
          getUser.permission
        );
        if (getPermissions.adminPortal) {
          router.push("/admin/dashboard");
          return;
        }
      } else {
        onSignInError(new Error("User does not have a permission"));
      }
    } catch (error) {
      onSignInError(new Error("Error fetching user data"));
    } finally {
      setLoading(false);
      setSignInData((prevData) => ({
        ...prevData,
        showButtonLoading: false,
      }));
    }
  };

  const onSignIn = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setSignInData((prevData) => ({ ...prevData, showButtonLoading: true }));
    setError({ type: "error", message: "" });
    signInWithEmailAndPassword(auth, signInData.email, signInData.password)
      .then((userCredential) => {
        console.log("userCredential", userCredential);
        if (userCredential.user) {
          onSignInSuccess(userCredential.user);
        }
      })
      .catch((error) => {
        onSignInError(new Error("Invalid email or password"));
      });
  };

  const handleSignInDataChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSignInData({ ...signInData, [e.target.name]: e.target.value });
  };

  const onCloseError = () => {
    setError({ type: "error", message: "" });
  };

  return (
    <div className="relative min-h-screen flex flex-col lg:flex-row items-center justify-start lg:justify-center gap-2 lg:gap-20 px-4 py-4 lg:py-10">
      <div className="relative w-[200px] h-[200px] lg:w-[324px] lg:h-[324px]">
        <Image
          fill
          className="object-contain"
          src={logo.src}
          alt="Orange Treads"
        />
      </div>
      <div className="flex-none lg:flex-1 flex flex-col items-center justify-center gap-2 w-full max-w-md bg-gray-800 p-8 rounded-lg shadow-2xs">
        <h1 className="text-2xl uppercase font-bold text-center">
          Admin Login
        </h1>
        <Alert {...error} onClose={onCloseError} className="w-full my-1" />
        <form method="post" onSubmit={onSignIn} className="flex flex-col gap-4 w-full">
          <TextField
            label="Email"
            name="email"
            value={signInData.email}
            onChange={handleSignInDataChange}
            placeholder="Email"
            disabled={isLoading}
          />
          <TextField
            type="password"
            label="Password"
            name="password"
            value={signInData.password}
            onChange={handleSignInDataChange}
            placeholder="Password"
            disabled={isLoading}
          />
          <Button
            type="submit"
            size="large"
            roundedSize="medium"
            fullWidth={true}
            disabled={isLoading || !signInData.email || !signInData.password}
          >
            {isLoading && signInData.showButtonLoading ? (
              <>
                <LoadingSpinner className="w-4 h-4 text-white animate-spin" />
                Signing in...
              </>
            ) : (
              "Sign in"
            )}
          </Button>
        </form>
        <div className="flex flex-col items-center justify-center gap-2 w-full mt-4">
          <p className="text-sm text-gray-400">Or continue with</p>
        </div>
        <Activity
          mode={
            isLoading && !signInData.showButtonLoading ? "visible" : "hidden"
          }
        >
          <div className="relative w-full min-h-[72px] flex items-center justify-center gap-2 overflow-hidden p-4 rounded-lg">
            <LoadingSpinner className="w-4 h-4 text-white animate-spin" />
            Checking account permissions...
          </div>
        </Activity>
        <FirebaseUI
          signInSuccessUrl="/admin"
          onSignInSuccess={onSignInSuccess}
          onSignInError={onSignInError}
          className={isLoading ? "select-none pointer-events-none " : ""}
        />
      </div>
    </div>
  );
};

export default page;
