"use client";

import PageHeader from "@/components/layouts/page-header";
import { ProfileForm } from "@/features/profile/components/profile-form";

export default function ProfilePage() {
  return (
    <>
      <div className="max-w-4xl mx-auto space-y-6">
        <PageHeader title="Мой профиль" />
        <ProfileForm />
      </div>
    </>
  );
}
