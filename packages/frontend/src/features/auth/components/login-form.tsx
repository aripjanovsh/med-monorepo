"use client";

import { useForm } from "@/hooks/use-form";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useLoginMutation } from "@/features/auth";
import { loginSchema, LoginFormData } from "@/features/auth/auth.schema";
import { Form, FormField } from "@/components/ui/form";
import { PhoneField } from "@/components/fields/phone-field";

export function LoginForm({
  className,
  ...props
}: React.ComponentProps<"form">) {
  const router = useRouter();
  const [login, { isLoading, error }] = useLoginMutation();

  const form = useForm<LoginFormData>({
    schema: loginSchema,
    defaultValues: {
      phone: "",
      password: "",
    },
  });

  const onSubmit = async (data: LoginFormData) => {
    try {
      await login(data).unwrap();
      router.push("/cabinet");
    } catch (err) {
      console.error("Login failed:", err);
    }
  };

  return (
    <Form {...form}>
      <form
        className={cn("flex flex-col gap-6", className)}
        onSubmit={form.handleSubmit(onSubmit)}
        {...props}
      >
        <div className="flex flex-col items-center gap-2 text-center">
          <h1 className="text-2xl font-bold">Авторизация</h1>
          <p className="text-muted-foreground text-sm text-balance">
            Введите ваш номер телефона и пароль
          </p>
        </div>
        <div className="grid gap-6">
          {error && (
            <div className="p-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded-md">
              {"data" in error
                ? (error.data as any)?.message || "Login failed"
                : "Network error"}
            </div>
          )}
          <div className="grid gap-3">
            <FormField
              control={form.control}
              name="phone"
              render={({ field }) => (
                <PhoneField
                  {...field}
                  label="Номер телефона"
                  placeholder="+998 99 999 99 99"
                />
              )}
            />
          </div>
          <div className="grid gap-3">
            <div className="flex items-center">
              <Label htmlFor="password">Пароль</Label>
              <a
                href="#"
                className="ml-auto text-sm underline-offset-4 hover:underline"
              >
                Забыли пароль?
              </a>
            </div>
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => <Input {...field} type="password" />}
            />
          </div>
          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? "Авторизация..." : "Войти"}
          </Button>
        </div>
      </form>
    </Form>
  );
}
