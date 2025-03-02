'use client';

import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { motion, useScroll, useTransform, AnimatePresence } from "framer-motion";
import {
  FileText,
  Bot,
  Zap,
  Shield,
  ArrowRight,
  CheckCircle,
  Sparkles,
  Workflow,
  Star,
  Quote,
  Users,
} from "lucide-react";
import { useRef, useEffect, useState } from "react";

const features = [
  {
    icon: <Bot className="h-8 w-8" />,
    title: "AI-Powered Template Creation",
    description: "Transform any signed document into a reusable template effortlessly using advanced AI technology."
  },
  {
    icon: <Zap className="h-8 w-8" />,
    title: "Intelligent Auto-Fill",
    description: "Save time with smart form filling that learns from your data and pre-populates fields automatically."
  },
  {
    icon: <Shield className="h-8 w-8" />,
    title: "Secure & Compliant",
    description: "Enterprise-grade security with ESIGN, eIDAS, GDPR, and CCPA compliance built-in."
  },
  {
    icon: <Workflow className="h-8 w-8" />,
    title: "Seamless Integration",
    description: "Connect with your existing tools through our comprehensive API and integrations."
  }
];

const benefits = [
  "Reduce document processing time by 75%",
  "Eliminate manual data entry errors",
  "Enhance security and compliance",
  "Improve user experience with AI assistance",
  "Scale your document workflows effortlessly",
  "Access documents from anywhere, anytime"
];

const testimonials = [
  {
    quote: "DocSign has revolutionized our contract workflow. What used to take days now takes minutes.",
    author: "Sarah Johnson",
    role: "VP of Operations, TechCorp",
    rating: 5
  },
  {
    quote: "The AI-powered template creation saved us countless hours. It's like having a document expert on staff.",
    author: "Michael Chen",
    role: "Legal Director, Innovate Inc",
    rating: 5
  },
  {
    quote: "Secure, intuitive, and incredibly fast. DocSign has transformed how we handle sensitive documents.",
    author: "Priya Patel",
    role: "CTO, SecureFlow",
    rating: 5
  }
];

export default function LandingPage() {
  const router = useRouter();
  const { status } = useSession();
  const scrollRef = useRef(null);
  const [currentTestimonial, setCurrentTestimonial] = useState(0);
  const [isHovering, setIsHovering] = useState(false);
  
  // 3D document animation controls
  const documentRef = useRef(null);
  const { scrollYProgress } = useScroll();
  const documentRotateX = useTransform(scrollYProgress, [0, 0.2], [15, 0]);
  const documentRotateY = useTransform(scrollYProgress, [0, 0.2], [15, 0]);
  const documentScale = useTransform(scrollYProgress, [0, 0.2], [0.9, 1]);
  
  // Testimonial carousel auto-rotation
  useEffect(() => {
    if (!isHovering) {
      const timer = setTimeout(() => {
        setCurrentTestimonial((prev) => (prev + 1) % testimonials.length);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [currentTestimonial, isHovering]);
  
  const handleGetStarted = () => {
    if (status === 'authenticated') {
      router.push('/documents');
    } else {
      router.push('/login');
    }
  };

  return (
    <div className="flex min-h-screen flex-col bg-gradient-to-b from-background to-background/90 overflow-hidden w-full">
      {/* Navigation Bar */}
      <div className="absolute top-0 w-full z-50 px-4 py-4">
        <div className="container mx-auto flex justify-between items-center">
          <div className="font-bold text-xl">DocSign</div>
          <Button 
            onClick={handleGetStarted}
            className="bg-gradient-to-r from-primary to-blue-600 hover:from-primary/90 hover:to-blue-600/90 shadow-lg hover:shadow-xl transition-all duration-300"
          >
            Get Started <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </div>
      </div>
      <div className="flex flex-col w-full">
      {/* Hero Section */}
      <section className="relative flex min-h-[calc(100vh-4rem)] items-center justify-center pt-16">
        {/* Background pattern */}
        <div className="absolute inset-0 bg-grid-pattern opacity-5 pointer-events-none" />
        
        {/* Gradient orbs */}
        <div className="absolute top-20 -left-20 w-72 h-72 bg-primary/30 rounded-full filter blur-3xl opacity-20 animate-blob" />
        <div className="absolute bottom-20 -right-20 w-72 h-72 bg-blue-500/30 rounded-full filter blur-3xl opacity-20 animate-blob animation-delay-2000" />
        
        <div className="container relative z-10 flex max-w-[64rem] flex-col items-center justify-between gap-8 text-center px-4 py-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: "easeOut" }}
            className="space-y-6"
          >
            <h1 className="text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl lg:text-7xl bg-clip-text text-transparent bg-gradient-to-r from-primary to-blue-600">
              The Next Generation of{" "}
              <span className="text-primary font-extrabold">E-Signatures</span>
            </h1>
            <p className="mx-auto mt-6 max-w-[42rem] text-xl text-muted-foreground">
              Experience the future of document signing with AI-powered automation, 
              intelligent templates, and seamless integration.
            </p>
          </motion.div>

          {/* 3D Floating Document */}
          <motion.div
            ref={documentRef}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.6 }}
            style={{ 
              rotateX: documentRotateX,
              rotateY: documentRotateY,
              scale: documentScale,
            }}
            className="relative w-72 h-72 mx-auto flex items-center justify-center"
          >
            <motion.div 
              className="absolute inset-0 bg-gradient-to-tr from-primary/20 to-blue-500/20 rounded-lg shadow-xl border border-white/10"
              animate={{ 
                rotateY: isHovering ? [0, 10, 0, -10, 0] : [0, 5, 0, -5, 0],
                rotateX: isHovering ? [0, 5, 0, -5, 0] : [0, 3, 0, -3, 0]
              }}
              transition={{ 
                duration: isHovering ? 5 : 10, 
                repeat: Infinity, 
                ease: "linear" 
              }}
              onHoverStart={() => setIsHovering(true)}
              onHoverEnd={() => setIsHovering(false)}
            >
              <div className="absolute inset-4 bg-white/5 backdrop-blur-sm rounded-md flex flex-col p-4">
                <div className="w-full h-6 bg-primary/10 rounded mb-3"></div>
                {Array.from({ length: 6 }).map((_, i) => (
                  <div key={i} className="w-full h-3 bg-white/10 rounded-sm mb-2"></div>
                ))}
                <div className="mt-auto flex justify-end">
                  <div className="w-24 h-10 bg-primary/20 rounded-md"></div>
                </div>
              </div>
              <motion.div 
                className="absolute -bottom-3 -right-3 w-16 h-16 bg-primary/30 rounded-full flex items-center justify-center"
                animate={{ scale: [1, 1.1, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                <FileText className="h-8 w-8 text-primary" />
              </motion.div>
            </motion.div>
          </motion.div>
        </div>
        
        {/* Scroll indicator */}
        <motion.div 
          className="absolute bottom-0 "
          animate={{ y: [0, 10, 0] }}
          transition={{ repeat: Infinity, duration: 1.5 }}
        >
          <div className="w-6 h-10 rounded-full border-2 border-primary/30 flex justify-center pt-2">
            <motion.div 
              className="w-1.5 h-1.5 rounded-full bg-primary"
              animate={{ y: [0, 12, 0] }}
              transition={{ repeat: Infinity, duration: 1.5 }}
            />
          </div>
        </motion.div>
      </section>

      {/* Features Section */}
      <section ref={scrollRef} className="w-full space-y-10 py-16 md:py-20 lg:py-28">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.5 }}
          className="mx-auto flex max-w-[58rem] flex-col items-center space-y-4 text-center"
        >
          <div className="rounded-full bg-primary/10 px-3 py-1 text-sm text-primary">
            Powerful Features
          </div>
          <h2 className="text-3xl font-bold leading-[1.1] sm:text-3xl md:text-5xl">
            Features
          </h2>
          <p className="max-w-[85%] leading-normal text-muted-foreground sm:text-lg sm:leading-7">
            Revolutionize your document workflows with our AI-powered features
          </p>
        </motion.div>

        <div className="container mx-auto grid grid-cols-1 justify-items-center gap-6 sm:grid-cols-2 md:max-w-[64rem] md:grid-cols-2 px-4 sm:px-6">
          {features.map((feature, i) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ delay: i * 0.1, duration: 0.5 }}
              className="w-full"
            >
              <Card className="h-full border-primary/5 bg-background/50 backdrop-blur-sm hover:shadow-md hover:border-primary/20 transition-all duration-300 feature-card">
                <CardHeader>
                  <div className="flex items-center gap-4">
                    <div className="rounded-lg bg-primary/10 p-3 text-primary feature-icon">
                      {feature.icon}
                    </div>
                    <div>
                      <CardTitle>{feature.title}</CardTitle>
                      <CardDescription className="mt-2">
                        {feature.description}
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
              </Card>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Benefits Section */}
      <section className="w-full py-16 md:py-20 lg:py-28">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.5 }}
          className="mx-auto flex max-w-[58rem] flex-col items-center justify-center gap-4 text-center"
        >
          <div className="rounded-full bg-blue-500/10 px-3 py-1 text-sm text-blue-500">
            Why DocSign
          </div>
          <h2 className="text-3xl font-bold leading-[1.1] sm:text-3xl md:text-5xl">
            Why Choose Us?
          </h2>
          <p className="max-w-[85%] leading-normal text-muted-foreground sm:text-lg sm:leading-7">
            Transform your document signing experience with our powerful platform
          </p>
        </motion.div>

        <div className="container mx-auto mt-12 grid max-w-5xl gap-6 md:grid-cols-2 px-4 sm:px-6">
          {benefits.map((benefit, i) => (
            <motion.div
              key={benefit}
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ delay: i * 0.1, duration: 0.5 }}
              className="flex items-center gap-4 p-4 rounded-lg hover:bg-primary/5 transition-colors duration-300"
            >
              <div className="rounded-full bg-green-500/10 p-2">
                <CheckCircle className="h-6 w-6 text-green-500" />
              </div>
              <p className="text-lg">{benefit}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="w-full py-16 md:py-20 relative overflow-hidden">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.5 }}
          className="mx-auto flex max-w-[58rem] flex-col items-center justify-center gap-4 text-center"
        >
          <div className="rounded-full bg-purple-500/10 px-3 py-1 text-sm text-purple-500">
            <Users className="h-4 w-4 inline mr-1" /> Testimonials
          </div>
          <h2 className="text-3xl font-bold leading-[1.1] sm:text-3xl md:text-5xl">
            What Our Users Say
          </h2>
          <p className="max-w-[85%] leading-normal text-muted-foreground sm:text-lg sm:leading-7">
            Join thousands of satisfied customers who have transformed their document workflows
          </p>
        </motion.div>

        <div className="container relative mt-16 max-w-4xl mx-auto px-4 sm:px-6">
          {/* Decorative elements */}
          <div className="absolute -top-10 -left-10 w-40 h-40 bg-purple-500/5 rounded-full filter blur-3xl" />
          <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-blue-500/5 rounded-full filter blur-3xl" />
          
          <div 
            className="relative overflow-hidden p-1 rounded-xl"
            onMouseEnter={() => setIsHovering(true)}
            onMouseLeave={() => setIsHovering(false)}
          >
            <div className="flex justify-center mb-6">
              {testimonials.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentTestimonial(index)}
                  className={`w-3 h-3 mx-1 rounded-full transition-all duration-300 ${index === currentTestimonial ? 'bg-primary scale-125' : 'bg-primary/20'}`}
                  aria-label={`Go to testimonial ${index + 1}`}
                />
              ))}
            </div>
            
            <div className="relative h-[300px] overflow-hidden">
              <AnimatePresence mode="wait">
                <motion.div
                  key={currentTestimonial}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.5 }}
                  className="absolute inset-0"
                >
                  <Card className="h-full border-primary/5 bg-background/50 backdrop-blur-sm hover:shadow-lg hover:border-primary/20 transition-all duration-300 overflow-hidden testimonial-card">
                    <CardContent className="flex flex-col items-center justify-center h-full p-8 text-center">
                      <Quote className="h-10 w-10 text-primary/20 mb-6" />
                      <p className="text-xl font-medium mb-6 italic">"{testimonials[currentTestimonial].quote}"</p>
                      <div className="mt-auto">
                        <div className="flex justify-center mb-2">
                          {Array.from({ length: testimonials[currentTestimonial].rating }).map((_, i) => (
                            <Star key={i} className="h-5 w-5 text-yellow-500 fill-yellow-500" />
                          ))}
                        </div>
                        <h4 className="font-bold text-lg">{testimonials[currentTestimonial].author}</h4>
                        <p className="text-sm text-muted-foreground">{testimonials[currentTestimonial].role}</p>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              </AnimatePresence>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      {/* Cosmic CTA Section */}
      <section className="w-full py-16 md:py-20 relative">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="cosmic-stars">
            {Array.from({ length: 50 }).map((_, i) => {
              // Use index-based positioning instead of random values
              const left = ((i % 10) * 10) + ((i % 5) * 2);
              const top = Math.floor(i / 10) * 20 + ((i % 7) * 3);
              const delay = (i % 5) * 1;
              const size = 1 + (i % 3);
              
              return (
                <div 
                  key={i} 
                  className="cosmic-star"
                  style={{
                    left: `${left}%`,
                    top: `${top}%`,
                    animationDelay: `${delay}s`,
                    width: `${size}px`,
                    height: `${size}px`,
                  }}
                />
              );
            })}
          </div>
        </div>
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.5 }}
          whileHover={{ scale: 1.02 }}
          className="cosmic-card-container"
        >
          <Card className="overflow-hidden border-0 shadow-2xl relative bg-black/90 backdrop-blur-sm cosmic-card">
            <div className="absolute inset-0 bg-gradient-to-br from-black via-black/80 to-zinc-900/50 rounded-lg opacity-90 cosmic-gradient" />
            <div className="absolute inset-0 cosmic-particles">
              {Array.from({ length: 15 }).map((_, i) => {
                // Use index-based positioning instead of random values
                const left = ((i % 5) * 20) + ((i % 3) * 5);
                const top = Math.floor(i / 5) * 30 + ((i % 4) * 5);
                const duration = 10 + (i % 10);
                
                return (
                  <div 
                    key={i} 
                    className="cosmic-particle"
                    style={{
                      left: `${left}%`,
                      top: `${top}%`,
                      animationDuration: `${duration}s`,
                    }}
                  />
                );
              })}
            </div>
            <CardContent className="relative z-10 flex flex-col items-center gap-6 p-8 md:p-12 text-center">
              <motion.div 
                className="rounded-full bg-zinc-900 p-3 backdrop-blur-sm cosmic-icon-container"
                animate={{ 
                  boxShadow: ['0 0 0 rgba(0, 0, 0, 0.4)', '0 0 20px rgba(255, 255, 255, 0.2)', '0 0 0 rgba(0, 0, 0, 0.4)'] 
                }}
                transition={{ 
                  duration: 3, 
                  repeat: Infinity,
                  ease: "easeInOut" 
                }}
              >
                <Sparkles className="h-10 w-10 text-white cosmic-icon" />
              </motion.div>
              <motion.h3 
                className="text-2xl font-bold sm:text-3xl text-foreground md:text-4xl cosmic-title"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3, duration: 0.8 }}
              >
                Ready to Get Started?
              </motion.h3>
              <motion.p 
                className="text-lg text-muted-foreground max-w-[600px] cosmic-text"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.6, duration: 0.8 }}
              >
                Join thousands of businesses that trust our platform for their e-signature needs.
              </motion.p>
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.98 }}
                className="cosmic-button-container"
              >
                <Button 
                  size="lg" 
                  variant="default"
                  onClick={handleGetStarted}
                  className="mt-2 bg-white text-black hover:bg-white/90 font-medium px-8 py-6 text-lg shadow-lg hover:shadow-xl transition-all duration-300 cosmic-button"
                >
                  Start Your Free Trial
                </Button>
                <div className="cosmic-button-glow" />
              </motion.div>
            </CardContent>
          </Card>
        </motion.div>
      </section>
      </div>

      {/* Add custom CSS for animations */}
      <style jsx global>{`
        @keyframes blob {
          0% { transform: scale(1); }
          33% { transform: scale(1.1); }
          66% { transform: scale(0.9); }
          100% { transform: scale(1); }
        }
        .animate-blob {
          animation: blob 7s infinite;
        }
        .animation-delay-2000 {
          animation-delay: 2s;
        }
        .bg-grid-pattern {
          background-image: linear-gradient(to right, rgba(255, 255, 255, 0.05) 1px, transparent 1px),
                          linear-gradient(to bottom, rgba(255, 255, 255, 0.05) 1px, transparent 1px);
          background-size: 40px 40px;
        }

        /* Cosmic animations */
        .cosmic-card-container {
          perspective: 1000px;
        }
        
        .cosmic-card {
          transform-style: preserve-3d;
          transition: transform 0.5s ease;
          box-shadow: 0 0 30px rgba(0, 0, 0, 0.5);
        }
        
        .cosmic-card:hover {
          box-shadow: 0 0 50px rgba(0, 0, 0, 0.7);
        }
        
        .cosmic-gradient {
          background-size: 200% 200%;
          animation: gradientShift 15s ease infinite;
        }
        
        @keyframes gradientShift {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
        
        .cosmic-stars {
          position: absolute;
          width: 100%;
          height: 100%;
        }
        
        .cosmic-star {
          position: absolute;
          background-color: rgba(255, 255, 255, 0.8);
          border-radius: 50%;
          opacity: 0;
          animation: twinkle 5s ease-in-out infinite;
        }
        
        @keyframes twinkle {
          0% { opacity: 0; transform: scale(0.5); }
          50% { opacity: 0.8; transform: scale(1); }
          100% { opacity: 0; transform: scale(0.5); }
        }
        
        .cosmic-particles {
          position: absolute;
          width: 100%;
          height: 100%;
          overflow: hidden;
        }
        
        .cosmic-particle {
          position: absolute;
          width: 4px;
          height: 4px;
          background: linear-gradient(to right, #333333, #666666);
          border-radius: 50%;
          filter: blur(1px);
          opacity: 0.6;
          animation: float linear infinite;
        }
        
        @keyframes float {
          0% { transform: translateY(0) translateX(0); opacity: 0; }
          10% { opacity: 0.8; }
          90% { opacity: 0.8; }
          100% { transform: translateY(-100px) translateX(20px); opacity: 0; }
        }
        
        .cosmic-button-container {
          position: relative;
        }
        
        .cosmic-button-glow {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          border-radius: 0.5rem;
          filter: blur(15px);
          background: linear-gradient(45deg, rgba(100, 100, 255, 0.4), rgba(50, 50, 200, 0.6));
          opacity: 0;
          transition: opacity 0.3s ease;
          z-index: -1;
        }
        
        .cosmic-button-container:hover .cosmic-button-glow {
          opacity: 1;
          animation: pulse 2s infinite;
        }
        
        @keyframes pulse {
          0% { transform: scale(0.95); }
          50% { transform: scale(1.05); }
          100% { transform: scale(0.95); }
        }
        
        .cosmic-icon {
          filter: drop-shadow(0 0 5px rgba(255, 255, 255, 0.5));
          animation: pulse-icon 2s infinite;
        }
        
        @keyframes pulse-icon {
          0% { transform: scale(1); filter: drop-shadow(0 0 5px rgba(255, 255, 255, 0.3)); }
          50% { transform: scale(1.1); filter: drop-shadow(0 0 10px rgba(255, 255, 255, 0.7)); }
          100% { transform: scale(1); filter: drop-shadow(0 0 5px rgba(255, 255, 255, 0.3)); }
        }
        
        .cosmic-title, .cosmic-text {
          text-shadow: 0 0 10px rgba(0, 0, 0, 0.5);
        }
        
        /* Testimonial animations */
        .testimonial-card {
          transition: all 0.3s ease;
        }
        
        .testimonial-card:hover {
          transform: translateY(-5px);
          box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
        }
        
        /* Feature card hover effects */
        .feature-card {
          transition: all 0.3s ease;
          overflow: hidden;
          position: relative;
        }
        
        .feature-card:hover {
          transform: translateY(-5px);
        }
        
        .feature-card::after {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 3px;
          background: linear-gradient(to right, var(--primary), #4f46e5);
          transform: scaleX(0);
          transform-origin: left;
          transition: transform 0.3s ease;
        }
        
        .feature-card:hover::after {
          transform: scaleX(1);
        }
        
        .feature-icon {
          transition: all 0.3s ease;
        }
        
        .feature-card:hover .feature-icon {
          transform: scale(1.1) rotate(5deg);
        }
      `}</style>
    </div>
  );
}
