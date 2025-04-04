
import React, { useState, useEffect } from 'react';
import { Badge } from "@/components/ui/badge";
import { Search } from "lucide-react";
import Navbar from "@/components/navbar/Navbar";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import Footer from "@/components/footer/Footer";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { useQuery } from "@tanstack/react-query";
import { fetchServices, fetchCategories } from "@/api/services";
import { Service, Category } from "@/types/api";
import ServicesList from "@/components/services/ServicesList";
import { toast } from "@/hooks/use-toast";
import { useLocation, useSearchParams } from 'react-router-dom';
import { useAuth } from '@/context/AuthProvider';

const Services = () => {
  const location = useLocation();
  const [searchParams, setSearchParams] = useSearchParams();
  const categoryParam = searchParams.get("category");
  const searchQueryParam = searchParams.get("search");
  const { token } = useAuth();
  
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedSort, setSelectedSort] = useState("newest");
  const [selectedGovernorate, setSelectedGovernorate] = useState("all");
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [selectedRatings, setSelectedRatings] = useState<number[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Fetch categories
  const { 
    data: categories = [], 
    isLoading: isLoadingCategories,
    error: categoriesError
  } = useQuery({
    queryKey: ["categories"],
    queryFn: () => fetchCategories()
  });

  // Fetch services
  const { 
    data: services = [], 
    isLoading: isLoadingServices,
    error: servicesError
  } = useQuery({
    queryKey: ["services"],
    queryFn: () => fetchServices()
  });

  // Set category from URL parameter on initial load
  useEffect(() => {
    if (categoryParam && categories.length > 0) {
      const categoryExists = categories.some(
        category => category.id.toString() === categoryParam
      );
      
      if (categoryExists) {
        setSelectedCategory(categoryParam);
      }
    }
  }, [categoryParam, categories]);

  // Set search query from URL parameter
  useEffect(() => {
    if (searchQueryParam) {
      setSearchQuery(searchQueryParam);
      // Open sidebar on mobile if coming with a search query
      setSidebarOpen(true);
    }
  }, [searchQueryParam]);

  useEffect(() => {
    if (categoriesError) {
      toast({
        variant: "destructive",
        title: "خطأ في جلب التصنيفات",
        description: "حدث خطأ أثناء محاولة جلب التصنيفات. يرجى المحاولة مرة أخرى.",
      });
    }

    if (servicesError) {
      toast({
        variant: "destructive",
        title: "خطأ في جلب الخدمات",
        description: "حدث خطأ أثناء محاولة جلب الخدمات. يرجى المحاولة مرة أخرى.",
      });
    }
  }, [categoriesError, servicesError]);

  // Update URL when search query changes
  const handleSearchChange = (value: string) => {
    setSearchQuery(value);
    if (value) {
      searchParams.set("search", value);
    } else {
      searchParams.delete("search");
    }
    setSearchParams(searchParams);
  };

  // Syrian governorates
  const governorates = [
    { id: "all", name: "جميع المحافظات" },
    { id: "1", name: "دمشق" },
    { id: "2", name: "حلب" },
    { id: "3", name: "حمص" },
    { id: "4", name: "حماة" },
    { id: "5", name: "اللاذقية" },
    { id: "6", name: "طرطوس" },
    { id: "7", name: "دير الزور" },
    { id: "8", name: "الرقة" },
    { id: "9", name: "الحسكة" },
    { id: "10", name: "درعا" },
    { id: "11", name: "إدلب" },
    { id: "12", name: "السويداء" },
    { id: "13", name: "القنيطرة" },
    { id: "14", name: "ريف دمشق" }
  ];

  // Get category counts
  const getCategoryCount = (categoryId: number) => {
    return services.filter(service => service.category_id === categoryId).length;
  };

  // Filter services by category
  const categoryFiltered: Service[] = selectedCategory === "all" 
    ? services 
    : services.filter(service => service.category_id.toString() === selectedCategory);

  // Apply search filter
  const searchFiltered = searchQuery 
    ? categoryFiltered.filter(service => 
        service.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        service.desc.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : categoryFiltered;

  // Sort services
  const sortedServices = [...searchFiltered].sort((a, b) => {
    switch (selectedSort) {
      case "top-rated": {
        const aRating = a.rates.length ? a.rates.reduce((sum, rate) => sum + rate.num_star, 0) / a.rates.length : 0;
        const bRating = b.rates.length ? b.rates.reduce((sum, rate) => sum + rate.num_star, 0) / b.rates.length : 0;
        return bRating - aRating;
      }
      case "price-high-low":
        return b.price - a.price;
      case "price-low-high":
        return a.price - b.price;
      case "newest":
      default:
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    }
  });

  // Apply additional filters
  const filteredServices = sortedServices.filter(service => {
    // Filter by governorate (region_id)
    if (selectedGovernorate !== "all" && service.profile.user.region_id.toString() !== selectedGovernorate) {
      return false;
    }
    
    // Filter by price range
    if (minPrice && service.price < parseInt(minPrice)) {
      return false;
    }
    
    if (maxPrice && service.price > parseInt(maxPrice)) {
      return false;
    }
    
    // Filter by rating
    if (selectedRatings.length > 0) {
      const avgRating = service.rates.length ? 
        service.rates.reduce((sum, rate) => sum + rate.num_star, 0) / service.rates.length : 0;
      
      if (!selectedRatings.some(rating => avgRating >= rating)) {
        return false;
      }
    }
    
    return true;
  });

  const toggleRating = (rating: number) => {
    setSelectedRatings(prev => 
      prev.includes(rating) 
        ? prev.filter(r => r !== rating) 
        : [...prev, rating]
    );
  };

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Navbar />
      
      <div className="container mx-auto mt-24 px-4 flex-grow">
        <div className="flex flex-col md:flex-row gap-8 py-10">
          <div className="w-full flex flex-col md:flex-row gap-6">
            {/* Mobile sidebar trigger */}
            <div className="md:hidden mb-4">
              <Button 
                onClick={toggleSidebar} 
                variant="outline" 
                className="w-full justify-between"
              >
                <span>فلترة الخدمات</span>
                <Search className="h-5 w-5" />
              </Button>
            </div>
            
            {/* Sidebar */}
            <aside className={`w-full md:w-64 bg-card border shadow-sm rounded-xl p-4 ${sidebarOpen ? 'block' : 'hidden'} md:block`}>
              <div className="relative mb-6">
                <Input 
                  placeholder="ابحث عن خدمة..." 
                  className="pl-10 pr-3 rounded-full"
                  value={searchQuery}
                  onChange={(e) => handleSearchChange(e.target.value)}
                />
                <Search className="absolute top-1/2 transform -translate-y-1/2 left-3 h-5 w-5 text-muted-foreground" />
              </div>
              
              <h3 className="text-lg font-bold mb-4">التصنيفات</h3>
              {isLoadingCategories ? (
                <p>جاري تحميل التصنيفات...</p>
              ) : (
                <div className="space-y-1">
                  <Button 
                    variant="ghost" 
                    onClick={() => setSelectedCategory("all")}
                    className={`justify-between w-full ${selectedCategory === "all" ? 'bg-primary/10 text-primary' : ''}`}
                  >
                    <span>جميع الخدمات</span>
                    <Badge variant="secondary" className="rounded-full">
                      {services.length}
                    </Badge>
                  </Button>
                  
                  {categories.map((category) => (
                    <Button 
                      key={category.id}
                      variant="ghost"
                      onClick={() => setSelectedCategory(category.id.toString())}
                      className={`justify-between w-full ${selectedCategory === category.id.toString() ? 'bg-primary/10 text-primary' : ''}`}
                    >
                      <span>{category.name}</span>
                      <Badge variant="secondary" className="rounded-full">
                        {getCategoryCount(category.id)}
                      </Badge>
                    </Button>
                  ))}
                </div>
              )}
              
              <Separator className="my-6" />
              
              <div className="space-y-4">
                <h3 className="text-lg font-bold mb-4">المحافظة</h3>
                <Select 
                  value={selectedGovernorate} 
                  onValueChange={setSelectedGovernorate}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="اختر المحافظة" />
                  </SelectTrigger>
                  <SelectContent>
                    {governorates.map(gov => (
                      <SelectItem key={gov.id} value={gov.id}>
                        {gov.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <Separator className="my-6" />
              
              <div className="space-y-4">
                <h3 className="text-lg font-bold mb-4">السعر</h3>
                <div className="flex gap-3">
                  <Input 
                    type="number" 
                    placeholder="من" 
                    value={minPrice}
                    onChange={(e) => setMinPrice(e.target.value)}
                  />
                  <Input 
                    type="number" 
                    placeholder="إلى" 
                    value={maxPrice}
                    onChange={(e) => setMaxPrice(e.target.value)}
                  />
                </div>
                <Button className="w-full rounded-full">
                  تطبيق
                </Button>
              </div>
              
              <Separator className="my-6" />
              
              <div className="space-y-4">
                <h3 className="text-lg font-bold mb-4">التقييم</h3>
                <div className="space-y-2">
                  {[5, 4, 3, 2, 1].map((rating) => (
                    <label key={rating} className="flex items-center space-x-reverse space-x-2 cursor-pointer">
                      <input 
                        type="checkbox" 
                        className="w-4 h-4 text-primary border-gray-300 rounded"
                        checked={selectedRatings.includes(rating)}
                        onChange={() => toggleRating(rating)}
                      />
                      <div className="flex items-center gap-1 text-amber-400">
                        {Array(rating).fill(0).map((_, i) => (
                          <svg key={i} className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                            <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
                          </svg>
                        ))}
                        <span className="text-foreground mr-1">وأعلى</span>
                      </div>
                    </label>
                  ))}
                </div>
              </div>
            </aside>
            
            {/* Main content */}
            <main className="w-full md:flex-1">
              {isLoadingServices ? (
                <div className="flex justify-center items-center py-16">
                  <p className="text-lg">جاري تحميل الخدمات...</p>
                </div>
              ) : (
                <ServicesList 
                  services={services}
                  filteredServices={filteredServices}
                  selectedCategory={selectedCategory}
                  selectedSort={selectedSort}
                  setSelectedSort={setSelectedSort}
                  categories={categories}
                />
              )}
            </main>
          </div>
        </div>
      </div>
      
      <Footer />
    </div>
  );
};

export default Services;
