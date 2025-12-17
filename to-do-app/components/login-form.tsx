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

type LoginFormFields = { email: string; password: string };

export function LoginForm({
  className,
  ...props
}: React.ComponentProps<"div">) {
  const router = useRouter();
  const { register, handleSubmit, setError, formState: { errors, isSubmitting } } = useForm<LoginFormFields>({ mode: "onChange" });

  const onSubmit = async (data: LoginFormFields) => {
    try {
      await loginAction(data);
      router.push("/dashboard");
    } catch (err: any) {
      console.log(err);
      setError("root", {
        type: "server",
        message: err.message || "Invalid credentials",
      });

      Object.keys(err || {}).forEach((key) => {
        setError(key as keyof LoginFormFields, {
          type: "server",
          message: err[key].join(" "),
        });
      });

      if (!err) {
        setError("root", {
          type: "server",
          message: "Something went wrong",
        });
      }
    }
  };
  
  const handleGoogleLogin = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      try {
        const userInfoResponse = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
          headers: {
            Authorization: `Bearer ${tokenResponse.access_token}`,
          },
        });
        
        const userInfo = await userInfoResponse.json();
        
        // Send to your backend
        await googleLoginAction(tokenResponse.access_token, userInfo);
        router.push("/tasks");
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
                  {...register("email", {
                    required: "Email is required",
                    pattern: {
                      value: /\S+@\S+\.\S+/,
                      message: "Invalid email address",
                    },
                  })}
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
                  {...register("password", {
                    required: "Password is required",
                    minLength: { value: 8, message: "Password must be at least 8 characters" },
                  })}
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
                  {isSubmitting ? "Logging in..." : "Login"}
                </Button>
                <Button 
                  variant="outline" 
                  type="button"
                  onClick={() => handleGoogleLogin()}
                >
                  Login with Google
                </Button>
                <FieldDescription className="text-center">
                  Don&apos;t have an account? <Link href="/signup" className="text-blue-500 underline">Sign up</Link>
                </FieldDescription>
              </Field>
            </FieldGroup>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
