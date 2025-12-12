"use client";

import { useForm } from "@/hooks/use-form";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { useLoginMutation } from "@/features/auth";
import { loginSchema, LoginFormData } from "@/features/auth/auth.schema";
import { Form, FormField } from "@/components/ui/form";
import { PhoneField } from "@/components/fields/phone-field";

export function LoginForm({
  className,
  ...props
}: React.ComponentProps<"div">) {
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
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card className="overflow-hidden p-0">
        <CardContent className="grid p-0 md:grid-cols-2">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="p-6 md:p-8">
              <div className="flex flex-col gap-6">
                <div className="flex flex-col items-center gap-2 text-center">
                  <h1 className="text-2xl font-bold">Добро пожаловать</h1>
                  <p className="text-muted-foreground text-balance">
                    Войдите в свой аккаунт
                  </p>
                </div>
                {error && (
                  <div className="p-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded-md">
                    {"data" in error
                      ? (error.data as any)?.message || "Ошибка входа"
                      : "Ошибка сети"}
                  </div>
                )}
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
                <div className="space-y-2">
                  <div className="flex items-center">
                    <Label htmlFor="password">Пароль</Label>
                    <a
                      href="#"
                      className="ml-auto text-sm underline-offset-2 hover:underline"
                    >
                      Забыли пароль?
                    </a>
                  </div>
                  <FormField
                    control={form.control}
                    name="password"
                    render={({ field }) => (
                      <Input id="password" {...field} type="password" />
                    )}
                  />
                </div>
                <Button type="submit" disabled={isLoading}>
                  {isLoading ? "Вход..." : "Войти"}
                </Button>
                <p className="text-sm text-muted-foreground text-center">
                  Нет аккаунта?{" "}
                  <a href="#" className="hover:underline">
                    Зарегистрироваться
                  </a>
                </p>
              </div>
            </form>
          </Form>
          <div className="bg-muted relative hidden md:block">
            <img
              src="/intro-min.png"
              alt="Image"
              className="absolute inset-0 h-full w-full object-cover dark:brightness-[0.2] dark:grayscale"
            />
          </div>
        </CardContent>
      </Card>
      <p className="text-sm text-muted-foreground px-6 text-center">
        Нажимая продолжить, вы соглашаетесь с{" "}
        <a href="#" className="hover:underline">
          Условиями использования
        </a>{" "}
        и{" "}
        <a href="#" className="hover:underline">
          Политикой конфиденциальности
        </a>
        .
      </p>
    </div>
  );
}
