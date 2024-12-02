"use client";
import React, { ReactNode } from "react";
import { OktoProvider, BuildType } from "okto-sdk-react";
import { SessionProvider } from "next-auth/react";

export const OktoAuthProvider = ({
  children,
  session,
}: {
  children: ReactNode;
  session: any;
}) => {
  const apiKey = "ec9d3f81-6659-479f-ba2c-070dc66bf334";
  const buildType = BuildType.SANDBOX;

  return (
    <SessionProvider session={session}>
      <OktoProvider apiKey={apiKey} buildType={buildType}>
        {children}
      </OktoProvider>
    </SessionProvider>
  );
};