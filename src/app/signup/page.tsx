import { ClientFormWrapper } from "@/components/client-form-wrapper"
import { DotBackground } from "@/components/dot-background"

export default function SignUpPage() {
  return (
    <div className="relative min-h-svh">
      <DotBackground />
      <div className="relative flex min-h-svh flex-col items-center justify-center p-6 md:p-10">
        <div className="w-full max-w-sm md:max-w-3xl">
          <ClientFormWrapper />
        </div>
      </div>
    </div>
  )
}