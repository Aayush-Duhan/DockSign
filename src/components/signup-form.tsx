'use client';

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { motion, HTMLMotionProps } from "framer-motion"
import { Eye, EyeOff } from "lucide-react"

export function SignUpForm({
  className,
  ...props
}: HTMLMotionProps<"div">) {
  const router = useRouter()
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    if (password !== confirmPassword) {
      setError("Passwords do not match")
      setIsLoading(false)
      return
    }

    try {
      await new Promise((resolve) => setTimeout(resolve, 1000))
      router.push("/login")
      router.refresh()
    } catch (error) {
      setError("An error occurred. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className={cn("flex flex-col gap-6", className)} 
      {...props}
    >
      <Card className="overflow-hidden p-0 bg-black/80 border-white/10 backdrop-blur-sm shadow-2xl">
        <CardContent className="grid p-0 md:grid-cols-2">
          <form className="p-8 md:p-10" onSubmit={handleSubmit}>
            <div className="flex flex-col gap-8">
              <div className="flex flex-col items-center text-center space-y-2.5">
                <motion.h1 
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2, duration: 0.5 }}
                  className="text-3xl font-bold text-white tracking-tight"
                >
                  Create account
                </motion.h1>
                <p className="text-white/60 text-balance text-lg">
                  Sign up for your DocSign account
                </p>
              </div>
              {error && (
                <motion.div 
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="rounded-lg bg-red-950/50 p-4 border border-red-800/50 backdrop-blur-sm"
                >
                  <div className="flex items-center">
                    <div className="text-sm text-red-400 font-medium">{error}</div>
                  </div>
                </motion.div>
              )}
              <div className="grid gap-6">
                <div className="space-y-2">
                  <Label htmlFor="name" className="text-white/70 text-sm font-medium">Full Name</Label>
                  <Input
                    id="name"
                    type="text"
                    placeholder="John Doe"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    className="bg-black/50 border-white/10 text-white placeholder:text-white/30 h-11 transition-colors focus:border-white/20"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-white/70 text-sm font-medium">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="m@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="bg-black/50 border-white/10 text-white placeholder:text-white/30 h-11 transition-colors focus:border-white/20"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password" className="text-white/70 text-sm font-medium">Password</Label>
                  <div className="relative">
                    <Input 
                      id="password" 
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      className="bg-black/50 border-white/10 text-white h-11 transition-colors focus:border-white/20 pr-10" 
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="absolute right-0 top-0 h-11 w-11 text-white/50 hover:text-white hover:bg-transparent"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                      <span className="sr-only">
                        {showPassword ? "Hide password" : "Show password"}
                      </span>
                    </Button>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="confirmPassword" className="text-white/70 text-sm font-medium">Confirm Password</Label>
                  <div className="relative">
                    <Input 
                      id="confirmPassword" 
                      type={showConfirmPassword ? "text" : "password"}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      required
                      className="bg-black/50 border-white/10 text-white h-11 transition-colors focus:border-white/20 pr-10" 
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="absolute right-0 top-0 h-11 w-11 text-white/50 hover:text-white hover:bg-transparent"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    >
                      {showConfirmPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                      <span className="sr-only">
                        {showConfirmPassword ? "Hide password" : "Show password"}
                      </span>
                    </Button>
                  </div>
                </div>
              </div>
              <div className="space-y-4">
                <Button 
                  type="submit" 
                  className="w-full bg-white text-black hover:bg-white/90 h-11 font-medium transition-colors"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="flex items-center space-x-2"
                    >
                      <svg className="animate-spin h-4 w-4 text-black" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      <span>Creating account...</span>
                    </motion.div>
                  ) : (
                    "Sign up"
                  )}
                </Button>
                <div className="text-center text-sm text-white/60">
                  Already have an account?{" "}
                  <Link href="/login" className="text-white underline underline-offset-4 hover:text-white/90 font-medium transition-colors">
                    Sign in
                  </Link>
                </div>
              </div>
            </div>
          </form>
          <div className="bg-black relative hidden md:block">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-600/20 via-blue-900/20 to-black/50" />
            <img
              src="/hero.png"
              alt="Digital Signatures"
              className="absolute inset-0 h-full w-full object-cover mix-blend-luminosity opacity-60"
            />
            <div className="absolute inset-0 bg-gradient-to-l from-black/80 via-black/50 to-transparent" />
          </div>
        </CardContent>
      </Card>
      <div className="text-white/40 *:[a]:hover:text-white text-center text-xs text-balance *:[a]:underline *:[a]:underline-offset-4 *:[a]:transition-colors">
        By clicking continue, you agree to our <a href="#">Terms of Service</a>{" "}
        and <a href="#">Privacy Policy</a>.
      </div>
    </motion.div>
  )
} 