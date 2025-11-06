import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { Input } from "@/components/ui/input";
import { 
  Sparkles, 
  Brain, 
  Workflow, 
  Zap, 
  ArrowRight,
  Github,
  Twitter,
  Linkedin,
  Mail
} from "lucide-react";
import heroBg from "@/assets/hero-bg.jpg";
// import arcaCharacter from "@/assets/arca-character.png";
import gsap from "gsap";
import { useLayoutEffect, useRef } from "react";

const Index = () => {
  const comp = useRef(null);
  const features = [
    {
      icon: Sparkles,
      title: "AI-Powered Generation",
      description: "Create stunning content with advanced AI that understands your vision and brings it to life instantly."
    },
    {
      icon: Brain,
      title: "Smart Collaboration",
      description: "Work seamlessly with Arca AI as your intelligent partner, adapting to your workflow and style."
    },
    {
      icon: Workflow,
      title: "Workflow Automation",
      description: "Automate repetitive tasks and focus on what matters. Let Arca handle the complexity."
    },
    {
      icon: Zap,
      title: "Context-Aware Assistance",
      description: "Arca understands your context and provides relevant suggestions at the perfect moment."
    }
  ];

  const team = [
    { name: "D. Salman Khan", role: "Co-Founder" },
    { name: "K. Karthikeyan", role: "Co-Founder" },
    { name: "M. M. Jeevaa", role: "Co-Founder" },
    { name: "M. Mukesh", role: "Co-Founder" }
  ];

  const navigate = useNavigate();

  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from(".hero-text", {
        opacity: 0,
        y: 50,
        duration: 1,
        delay: 0.5,
      });
      gsap.from(".hero-subtext", {
        opacity: 0,
        y: 50,
        duration: 1,
        delay: 0.7,
      });
      gsap.from(".hero-cta-buttons", {
        opacity: 0,
        y: 50,
        duration: 1,
        delay: 0.9,
      });
      gsap.from(".hero-innovate-text", {
        opacity: 0,
        y: 50,
        duration: 1,
        delay: 1.1,
      });
      gsap.from(".hero-innovate-subtext", {
        opacity: 0,
        y: 50,
        duration: 1,
        delay: 1.3,
      });
      gsap.from(".hero-innovate-ai-circle", {
        opacity: 0,
        scale: 0.8,
        duration: 1,
        delay: 1.5,
      });

      const tl = gsap.timeline({
        scrollTrigger: {
          scrub: 1,
          pin: true,
          trigger: "#pin-windmill",
          start: "50% 50%",
          endTrigger: "#pin-windmill-wrap",
          end: "bottom 50%",
        },
      });

      tl.to("#pin-windmill-svg", {
        rotateZ: 900,
      });

    }, comp);

    return () => ctx.revert();
  }, []);

  return (
    <div className="min-h-screen bg-background overflow-x-hidden" ref={comp}>
      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        {/* Animated Background */}
        <div 
          className="absolute inset-0 z-0"
          style={{
            backgroundImage: `url(${heroBg})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
          }}
        >
          <div className="absolute inset-0 bg-background/40 backdrop-blur-sm" />
          {/* Animated gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-b from-background/60 via-transparent to-background/80" />
        </div>

        {/* Floating particles effect */}
        <div className="absolute inset-0 z-0">
          {[...Array(20)].map((_, i) => (
            <div
              key={i}
              className="absolute w-1 h-1 bg-primary rounded-full"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
              }}
              // animate={{
              //   y: [0, -30, 0],
              //   opacity: [0.2, 0.8, 0.2],
              // }}
              // transition={{
              //   duration: 3 + Math.random() * 2,
              //   repeat: Infinity,
              //   delay: Math.random() * 2,
              // }}
            />
          ))}
        </div>

        <div className="container mx-auto px-4 z-10 relative">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div
              // initial={{ opacity: 0, x: -50 }}
              // animate={{ opacity: 1, x: 0 }}
              // transition={{ duration: 0.8 }}
              className="text-left space-y-8"
            >
              <div
                // initial={{ opacity: 0, y: 20 }}
                // animate={{ opacity: 1, y: 0 }}
                // transition={{ delay: 0.2 }}
                className="inline-block"
              >
                <span className="text-sm font-medium px-4 py-2 rounded-full glass-card neon-border">
                  Powered by Arc Nex Technologies
                </span>
              </div>

              <h1 className="text-5xl md:text-7xl font-bold leading-tight">
                Meet{" "}
                <span className="neon-text animate-glow-pulse hero-text">Arca AI</span>
                <br />
                Your Intelligent Creative Partner
              </h1>

              <p className="text-xl text-muted-foreground max-w-xl hero-subtext">
                Designed by Arc Nex Technologies to think, build, and innovate with you. 
                Experience the future of creation powered by human-like intelligence.
              </p>

              <div
                // initial={{ opacity: 0, y: 20 }}
                // animate={{ opacity: 1, y: 0 }}
                // transition={{ delay: 0.4 }}
                className="flex flex-wrap gap-4 hero-cta-buttons"
              >
                <Button size="lg" className="gradient-accent text-lg px-8 py-6 group" onClick={() => navigate('/try')}>
                  Try for Free
                  <ArrowRight className="ml-2 group-hover:translate-x-1 transition-transform" />
                </Button>
                <Button size="lg" variant="outline" className="glass-card text-lg px-8 py-6 hover:neon-border">
                  Join the Beta
                </Button>
              </div>
            </div>

            <div className="relative flex justify-center items-center h-full">
              <div className="text-center">
                <h2 className="text-4xl md:text-6xl font-bold text-white mb-4 hero-innovate-text">
                  Innovate with Arca
                </h2>
                <p className="text-xl md:text-2xl text-primary mb-8 hero-innovate-subtext">
                  Transforming Ideas into Reality
                </p>
                <div className="h-64 w-64 border-4 border-primary rounded-full flex items-center justify-center mx-auto relative hero-innovate-ai-circle">
                  <div className="absolute inset-0 bg-primary/20 blur-2xl rounded-full animate-pulse-slow" />
                  <span className="text-5xl font-extrabold text-primary relative z-10">AI</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Scroll indicator */}
        <div
          className="absolute bottom-8 left-1/2 transform -translate-x-1/2"
          // animate={{ y: [0, 10, 0] }}
          // transition={{ duration: 2, repeat: Infinity }}
        >
          <div className="w-6 h-10 rounded-full border-2 border-primary/50 flex justify-center pt-2">
            <div
              className="w-1.5 h-1.5 rounded-full bg-primary"
              // animate={{ y: [0, 12, 0] }}
              // transition={{ duration: 1.5, repeat: Infinity }}
            />
          </div>
        </div>
      </section>

      {/* Windmill Section */}
      <section id="pin-windmill-wrap" className="relative h-[200vh] bg-background flex items-center justify-center">
        <div id="pin-windmill" className="sticky top-0 flex items-center justify-center h-screen w-full">
          <svg id="pin-windmill-svg" className="w-64 h-64 text-primary" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 2v20" />
            <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
          </svg>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-32 relative">
        <div className="absolute inset-0 gradient-hero" />
        <div className="container mx-auto px-4 relative z-10">
          <div
            // initial="hidden"
            // whileInView="visible"
            // viewport={{ once: true }}
            // variants={containerVariants}
            className="text-center mb-16"
          >
            <h2 
            className="text-4xl md:text-5xl font-bold mb-6">
              Powerful Features, <span className="neon-text">Effortless Experience</span>
            </h2>
            <p 
            className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Discover how Arca AI transforms your creative process with cutting-edge technology
            </p>
          </div>

          <div
            // initial="hidden"
            // whileInView="visible"
            // viewport={{ once: true }}
            // variants={containerVariants}
            className="grid md:grid-cols-2 lg:grid-cols-4 gap-6"
          >
            {features.map((feature, index) => (
              <div
                key={index}
                // variants={itemVariants}
                // whileHover={{ scale: 1.05, y: -10 }}
                className="glass-card rounded-2xl p-8 group hover:neon-border transition-all duration-300"
              >
                <div className="mb-6 relative">
                  <div className="absolute inset-0 blur-2xl bg-primary/20 group-hover:bg-primary/40 transition-all" />
                  <feature.icon className="w-12 h-12 text-primary relative z-10" strokeWidth={1.5} />
                </div>
                <h3 className="text-xl font-bold mb-3 group-hover:text-primary transition-colors">
                  {feature.title}
                </h3>
                <p className="text-muted-foreground leading-relaxed">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Demo Section */}
      <section className="py-32 relative overflow-hidden">
        <div className="container mx-auto px-4 relative z-10">
          <div
            // initial="hidden"
            // whileInView="visible"
            // viewport={{ once: true }}
            // variants={containerVariants}
            className="max-w-5xl mx-auto"
          >
            <div 
            className="text-center mb-12">
              <h2 className="text-4xl md:text-5xl font-bold mb-6">
                See <span className="neon-text">Arca AI</span> in Action
              </h2>
              <p className="text-xl text-muted-foreground">
                Watch how Arca transforms ideas into reality with intelligent generation
              </p>
            </div>

            <div
              // variants={itemVariants}
              className="glass-strong rounded-3xl p-12 neon-border"
            >
              <div className="aspect-video bg-secondary/30 rounded-2xl flex items-center justify-center relative overflow-hidden">
                {/* Simulated demo interface */}
                <div className="text-center space-y-6">
                  <div
                    // animate={{ scale: [1, 1.1, 1] }}
                    // transition={{ duration: 2, repeat: Infinity }}
                  >
                    <Sparkles className="w-20 h-20 text-primary mx-auto" strokeWidth={1.5} />
                  </div>
                  <div className="space-y-2">
                    <p className="text-2xl font-bold">Interactive Demo</p>
                    <p className="text-muted-foreground">Type → AI Generates → Output</p>
                  </div>
                  <div className="flex gap-4 justify-center">
                    <Button size="lg" className="gradient-accent" onClick={() => navigate('/studio?tab=code')}>
                      View Code
                    </Button>
                    <Button 
                      size="lg" 
                      variant="outline" 
                      className="glass-card hover:neon-border"
                      onClick={() => navigate('/studio')}
                    >
                      Watch Demo
                    </Button>
                  </div>
                </div>

                {/* Animated lines in background */}
                {[...Array(5)].map((_, i) => (
                  <div
                    key={i}
                    className="absolute h-px bg-gradient-to-r from-transparent via-primary/30 to-transparent"
                    style={{ top: `${20 + i * 20}%`, width: '100%' }}
                    // animate={{
                    //   x: ['-100%', '100%'],
                    // }}
                    // transition={{
                    //   duration: 3 + i,
                    //   repeat: Infinity,
                    //   delay: i * 0.5,
                    // }}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Vision & Philosophy Section */}
      <section className="py-32 relative">
        <div className="absolute inset-0 gradient-hero" />
        <div className="container mx-auto px-4 relative z-10">
          <div
            // initial="hidden"
            // whileInView="visible"
            // viewport={{ once: true }}
            // variants={containerVariants}
            className="max-w-4xl mx-auto text-center space-y-8"
          >
            <h2 
            className="text-4xl md:text-5xl font-bold">
              Built by{" "}
              <span className="neon-text">Arc Nex Technologies</span>
            </h2>
            <p 
            className="text-2xl font-medium text-primary">
              Where Innovation Meets Intelligence
            </p>
            <p 
            className="text-xl text-muted-foreground leading-relaxed">
              Our mission is to simplify creation with human-like intelligence. We believe that 
              technology should amplify human potential, not replace it. Arca AI is designed to 
              understand, adapt, and evolve with you—making every interaction feel natural and empowering.
            </p>
            <div 
            className="pt-8">
              <Button size="lg" variant="outline" className="glass-card px-8 py-6 hover:neon-border">
                Learn Our Story
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section className="py-32 relative">
        <div className="container mx-auto px-4 relative z-10">
          <div
            // initial="hidden"
            // whileInView="visible"
            // viewport={{ once: true }}
            // variants={containerVariants}
            className="max-w-4xl mx-auto text-center space-y-8"
          >
            <div 
            className="text-center mb-16">
              <h2 className="text-4xl md:text-5xl font-bold mb-6">
                The Minds Behind <span className="neon-text">Arca AI</span>
              </h2>
              <p className="text-xl text-muted-foreground">
                Meet the visionary team at Arc Nex Technologies
              </p>
            </div>

            <div
              // variants={containerVariants}
              className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 max-w-6xl mx-auto"
            >
              {team.map((member, index) => (
                <div
                  key={index}
                  // variants={itemVariants}
                  // whileHover={{ scale: 1.05, y: -10 }}
                  className="glass-card rounded-2xl p-8 text-center group hover:neon-border transition-all duration-300"
                >
                  <div className="mb-6 relative mx-auto w-32 h-32">
                    {/* Glowing frame */}
                    <div className="absolute inset-0 rounded-full border-2 border-primary/30 group-hover:border-primary transition-colors" />
                    <div className="absolute inset-0 rounded-full blur-xl bg-primary/20 group-hover:bg-primary/40 transition-all" />
                    
                    {/* Initial circle */}
                    <div className="relative z-10 w-full h-full rounded-full bg-gradient-to-br from-primary/20 to-secondary flex items-center justify-center">
                      <span className="text-4xl font-bold text-primary">
                        {member.name.split(' ').map(n => n[0]).join('')}
                      </span>
                    </div>
                  </div>
                  
                  <h3 className="text-xl font-bold mb-2 group-hover:text-primary transition-colors">
                    {member.name}
                  </h3>
                  <p className="text-muted-foreground">
                    {member.role}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA / Early Access Section */}
      <section className="py-32 relative overflow-hidden">
        <div className="absolute inset-0 gradient-primary" />
        
        {/* Animated background elements */}
        <div className="absolute inset-0">
          {[...Array(10)].map((_, i) => (
            <div
              key={i}
              className="absolute w-2 h-2 bg-primary/30 rounded-full"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
              }}
              // animate={{
              //   scale: [1, 1.5, 1],
              //   opacity: [0.3, 0.7, 0.3],
              // }}
              // transition={{
              //   duration: 2 + Math.random() * 2,
              //   repeat: Infinity,
              //   delay: Math.random() * 2,
              // }}
            />
          ))}
        </div>

        <div className="container mx-auto px-4 relative z-10">
          <div
            // initial="hidden"
            // whileInView="visible"
            // viewport={{ once: true }}
            // variants={containerVariants}
            className="max-w-3xl mx-auto text-center space-y-8"
          >
            <h2 
            className="text-4xl md:text-6xl font-bold">
              Experience the Future
            </h2>
            <p 
            className="text-2xl text-muted-foreground">
              Be Among the First to Try Arca AI
            </p>
            
            <div
              // variants={itemVariants}
              className="glass-strong rounded-2xl p-8 max-w-xl mx-auto"
            >
              <form className="flex flex-col sm:flex-row gap-4" onSubmit={(e) => e.preventDefault()}>
                <Input
                  type="email"
                  placeholder="Enter your email"
                  className="flex-1 h-14 text-lg bg-secondary/50 border-primary/30 focus:border-primary"
                />
                <Button type="submit" size="lg" className="gradient-accent h-14 px-8">
                  Join Waitlist
                </Button>
              </form>
              <p className="text-sm text-muted-foreground mt-4">
                Join thousands of creators already on the waitlist
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-16 border-t border-border/50 relative">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-3 gap-12 mb-12">
            {/* Brand */}
            <div className="space-y-4">
              <h3 className="text-2xl font-bold">
                <span className="neon-text">Arca AI</span>
              </h3>
              <p className="text-muted-foreground">
                Intelligent creative partner designed by Arc Nex Technologies
              </p>
            </div>

            {/* Links */}
            <div>
              <h4 className="font-semibold mb-4 text-lg">Quick Links</h4>
              <ul className="space-y-2">
                {['Product', 'Blog', 'Support', 'Contact'].map((link) => (
                  <li key={link}>
                    <a 
                      href="#" 
                      className="text-muted-foreground hover:text-primary transition-colors"
                    >
                      {link}
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            {/* Social */}
            <div>
              <h4 className="font-semibold mb-4 text-lg">Connect</h4>
              <div className="flex gap-4">
                {[
                  { icon: Github, label: "GitHub" },
                  { icon: Twitter, label: "Twitter" },
                  { icon: Linkedin, label: "LinkedIn" },
                  { icon: Mail, label: "Email" }
                ].map((social, index) => (
                  <a
                    key={index}
                    href="#"
                    className="w-10 h-10 rounded-full glass-card flex items-center justify-center hover:neon-border transition-all group"
                    aria-label={social.label}
                  >
                    <social.icon className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors" />
                  </a>
                ))}
              </div>
            </div>
          </div>

          <div className="pt-8 border-t border-border/50 text-center text-muted-foreground">
            <p>© 2025 Arc Nex Technologies. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
