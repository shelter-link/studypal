"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { getCurrentUser } from "@/actions/passageUser";
import Loader from "@/components/Loader";
import TutorDetailsForm from "@/components/TutorDetailsForm";
import { initialTutorValues, tutorSchema } from "@/schemas/tutor";

export default function PostAuth() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [userId, setUserId] = useState();
  const [name, setName] = useState();
  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(tutorSchema),
    defaultValues: initialTutorValues,
  });

  useEffect(() => {
    (async () => {
      const { isAuthorized, userInfo } = await getCurrentUser();
      if (!isAuthorized) {
        router.replace("/");
      } else {
        const userId = userInfo.id;
        const res = await fetch("/api/tutors/" + userId);
        const data = await res.json();
        if (data.status === "success") {
          router.replace("/");
        } else {
          setUserId(userId);
          setName(
            `${userInfo.user_metadata.first_name} ${userInfo.user_metadata.last_name}`,
          );
          setIsLoading(false);
        }
      }
    })();
  }, []);

  const onSubmit = async (data) => {
    setIsLoading(true);
    const res = await fetch("/api/tutors/new", {
      method: "POST",
      body: JSON.stringify({
        userId,
        name,
        ...data,
      }),
    });
    const json = await res.json();
    if (json.status === "success") {
      router.replace("/settings/account");
    }
  };

  if (isLoading)
    return (
      <div className="flex justify-center mt-20">
        <Loader />
      </div>
    );

  return (
    <div className="flex lg:mx-44 md:mx-16 mx-6">
      <div className="w-full flex justify-center md:py-16 py-6">
        <div className="md:w-2/3 w-full flex flex-col py-6 px-8 border border-neutral-400 rounded-lg">
          <h1 className="text-3xl text-center font-bold">Hey, {name}! 👋</h1>
          <p className="text-center">
            Thanks for joining StudyPal! Let's setup your tutor profile!
          </p>
          <TutorDetailsForm
            control={control}
            onSubmit={handleSubmit(onSubmit)}
            errors={errors}
          />
        </div>
      </div>
    </div>
  );
}
