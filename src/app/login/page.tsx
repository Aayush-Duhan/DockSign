import { LoginForm } from "@/components/login-form"
import { DotBackground } from "@/components/dot-background"

export default function LoginPage() {
  return (
    <div className="relative min-h-svh">
      <DotBackground />
      <div className="relative flex min-h-svh flex-col items-center justify-center p-6 md:p-10">
        <div className="w-full max-w-sm md:max-w-3xl">
          <LoginForm />
        </div>
      </div>
    </div>
  )
}
