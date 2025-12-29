"use client";
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { useRouter } from "next/navigation";
import { loginAction, googleLoginAction } from "@/lib/api"
import Link from "next/link";
import { useForm } from "react-hook-form";
import { useGoogleLogin } from '@react-oauth/google';
import { Spinner } from "./ui/spinner";

type LoginFormFields = { email: string; password: string };

export function LoginForm({
  className,
  ...props
}: React.ComponentProps<"div">) {
  const router = useRouter();
  const { register, handleSubmit, setError, formState: { errors, isSubmitting } } = useForm<LoginFormFields>();

  const onSubmit = async (data: LoginFormFields) => {
    try {
      const result = await loginAction(data);

      if (!result.success) {
        const err = result.error;
        
        if (err.non_field_errors) {
          setError("root", {
            type: "server",
            message: err.non_field_errors.join(" "),
          });
        }
        
        if (err.email) {
          setError("email", {
            type: "server",
            message: err.email.join(" "),
          });
        }
        
        if (err.password) {
          setError("password", {
            type: "server",
            message: err.password.join(" "),
          });
        }
      }
      else {
        router.push("/dashboard");
      }
    } catch (err: any) {
      console.log('caught error: ', err);
      setError("root", {
        type: "server",
        message: "Something went wrong. Please try again.",
      });
    }
  };
  
  const handleGoogleLogin = useGoogleLogin({
    flow: "auth-code",
    onSuccess: async (codeResponse) => {
      try {
        await googleLoginAction(codeResponse.code);
        router.push("/dashboard");
      } catch (err: any) {
        console.error("Google login error:", err);
        setError("root", {
          type: "server",
          message: err.message || "Google login failed",
        });
      }
    },
    onError: () => {
      setError("root", {
        type: "server",
        message: "Google login failed. Please try again.",
      });
    },
  });

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card>
        <CardHeader>
          <CardTitle>Login to your account</CardTitle>
          <CardDescription>
            Enter your email below to login to your account
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)}>
            <FieldGroup>
              <Field>
                <FieldLabel htmlFor="email">Email</FieldLabel>
                <Input
                  id="email"
                  type="email"
                  placeholder="m@example.com"
                  disabled={isSubmitting}
                  {...register("email")}
                />
                {errors.email && (
                  <p className="text-red-500 text-sm mt-1">{errors.email.message}</p>
                )}
              </Field>
              <Field>
                <div className="flex items-center">
                  <FieldLabel htmlFor="password">Password</FieldLabel>
                  <a
                    href="#"
                    className="ml-auto inline-block text-sm underline-offset-4 hover:underline"
                  >
                    Forgot your password?
                  </a>
                </div>
                <Input 
                  id="password" 
                  type="password" 
                  disabled={isSubmitting}
                  {...register("password")}
                />
                {errors.password && (
                  <p className="text-red-500 text-sm mt-1">{errors.password.message}</p>
                )}
              </Field>

              {errors.root && (
                <p className="text-red-500 text-center text-sm mb-2">{errors.root.message}</p>
              )}

              <Field>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? (
                    <>
                      <Spinner className="mr-1" />
                      Logging in...
                    </>
                  ) : (
                    "Login"
                  )}
                </Button>
                <Button 
                  variant="outline" 
                  type="button"
                  disabled={isSubmitting}
                  onClick={() => handleGoogleLogin()}
                >
                  Login with Google
                </Button>
                <FieldDescription className="text-center">
                  Don&apos;t have an account?{" "}
                  {isSubmitting ? (
                    <span className="text-gray-400 cursor-not-allowed">Sign up</span>
                  ) : (
                    <Link href="/signup" className="text-blue-500 underline">
                      Sign up
                    </Link>
                  )}
                </FieldDescription>
              </Field>
            </FieldGroup>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}