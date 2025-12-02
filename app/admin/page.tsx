"use client";

import { Activity, useState } from "react";
import FirebaseUI from "@/components/firebase/FirebaseUI";
import { User } from "firebase/auth";
import firebaseFunctions from "@/firebase/firebaseFunctions";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { TextField, Button } from "@/components/common";
import LoadingSpinner from "@/components/icons/LoadingSpinner";

const page = () => {
  const router = useRouter();
  const [isLoading, setLoading] = useState<boolean>(false);

  const onSignInSuccess = async (user: User) => {
    try {
      setLoading(true);
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
        // todo: add error message
        console.log("User does not have a permission");
      }
    } catch (error) {
      // todo: add error message
      console.error("Error fetching user data:", error);
    } finally {
      setLoading(false);
    }
  };

  const onSignInError = (error: Error) => {
    console.error("onSignInError", {
      message: error.message,
      code: (error as any).code,
      name: error.name,
      stack: error.stack,
    });
  };

  return (
    <div className="relative min-h-screen flex flex-col lg:flex-row items-center justify-start lg:justify-center gap-2 lg:gap-20 px-4 py-4 lg:py-10">
      <div className="relative w-[200px] h-[200px] lg:w-[324px] lg:h-[324px]">
        <Image
          fill
          className="object-contain"
          src="/logo.png"
          alt="Orange Treads"
        />
      </div>
      <div className="flex-none lg:flex-1 flex flex-col items-center justify-center gap-2 w-full max-w-md bg-gray-800 p-8 rounded-lg shadow-2xs">
        <h1 className="text-2xl uppercase font-bold text-center">
          Admin Login
        </h1>
        <form className="flex flex-col gap-4 w-full">
          <TextField label="Email" placeholder="Email" disabled={isLoading} />
          <TextField
            label="Password"
            placeholder="Password"
            disabled={isLoading}
          />
          <Button
            size="large"
            roundedSize="medium"
            fullWidth={true}
            disabled={isLoading}
          >
            Login
          </Button>
        </form>
        <div className="flex flex-col items-center justify-center gap-2 w-full mt-4">
          <p className="text-sm text-gray-400">Or continue with</p>
        </div>
        <Activity mode={isLoading ? "visible" : "hidden"}>
          <div className="relative w-full min-h-[72px] flex items-center justify-center gap-2 overflow-hidden p-4 rounded-lg">
            <LoadingSpinner className="w-4 h-4 text-white animate-spin" />
            Checking account permissions...
          </div>
        </Activity>
        <FirebaseUI
          signInSuccessUrl="/admin"
          onSignInSuccess={onSignInSuccess}
          onSignInError={onSignInError}
        />
      </div>
    </div>
  );
};

export default page;
