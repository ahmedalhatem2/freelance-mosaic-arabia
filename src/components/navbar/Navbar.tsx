
import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Menu, X, PanelRight } from "lucide-react";
import { cn } from '@/lib/utils';
import { Link, useLocation } from 'react-router-dom';
import { useSidebar } from "@/components/ui/sidebar";

const Navbar = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();
  const showSidebarToggle = location.pathname === "/services" || location.pathname === "/providers";
  
  // Only try to use sidebar context if we're on a page that has it
  const sidebarContext = showSidebarToggle ? useSidebar() : null;

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { name: "الرئيسية", href: "/" },
    { name: "الخدمات", href: "/services" },
    { name: "المستقلين", href: "/providers" },
    { name: "كيف يعمل", href: "#how-it-works" },
    { name: "تواصل معنا", href: "#contact" },
  ];

  return (
    <header className={cn(
      "fixed top-0 left-0 right-0 z-50 transition-all duration-300 py-4 px-6 md:px-12",
      isScrolled ? "glass shadow-sm" : "bg-transparent"
    )}>
      <div className="container mx-auto">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <Link to="/" className="text-2xl font-bold text-primary">خدماتك</Link>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-1 space-x-reverse">
            {navLinks.map((link) => (
              <Link 
                key={link.name}
                to={link.href.startsWith('#') ? link.href : link.href}
                className="px-4 py-2 text-foreground/80 hover:text-primary transition-colors"
              >
                {link.name}
              </Link>
            ))}
          </nav>

          <div className="hidden md:flex items-center space-x-4 space-x-reverse">
            {showSidebarToggle && sidebarContext && (
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={sidebarContext.toggleSidebar}
                className="rounded-full"
                aria-label="Toggle Sidebar"
              >
                <PanelRight className="h-5 w-5" />
              </Button>
            )}
            <Link to="/login">
              <Button variant="outline" className="rounded-full">تسجيل دخول</Button>
            </Link>
            <Link to="/register-steps">
              <Button className="rounded-full">إنشاء حساب</Button>
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <button 
            className="md:hidden text-foreground"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      <div className={cn(
        "md:hidden fixed inset-0 bg-background/95 backdrop-blur-sm z-40 transition-all duration-300 flex flex-col",
        mobileMenuOpen ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-full pointer-events-none"
      )}>
        <div className="flex flex-col items-center justify-center h-full space-y-8">
          {navLinks.map((link) => (
            <Link 
              key={link.name}
              to={link.href.startsWith('#') ? link.href : link.href}
              className="text-xl font-medium hover:text-primary transition-colors"
              onClick={() => setMobileMenuOpen(false)}
            >
              {link.name}
            </Link>
          ))}
          <div className="flex flex-col space-y-4 pt-8">
            {showSidebarToggle && sidebarContext && (
              <Button 
                variant="outline" 
                className="rounded-full w-40 flex items-center justify-center gap-2"
                onClick={() => {
                  sidebarContext.toggleSidebar();
                  setMobileMenuOpen(false);
                }}
              >
                <PanelRight className="h-4 w-4" />
                <span>إظهار القائمة</span>
              </Button>
            )}
            <Link to="/login" onClick={() => setMobileMenuOpen(false)}>
              <Button variant="outline" className="rounded-full w-40">تسجيل دخول</Button>
            </Link>
            <Link to="/register-steps" onClick={() => setMobileMenuOpen(false)}>
              <Button className="rounded-full w-40">إنشاء حساب</Button>
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
