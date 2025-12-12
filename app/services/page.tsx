"use client"

import { Header } from "@/components/navigation/header"
import { MobileNav } from "@/components/navigation/mobile-nav"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { BookingModal } from "@/components/services/booking-modal"
import Image from "next/image"
import { useState } from "react"
import { Clock, Calendar } from "lucide-react"

interface Service {
  id: string
  name: string
  duration: string
  price: string
  description: string
  image: string
  category: string
}

const services: Service[] = [
  {
    id: "1",
    name: "Tresses Box Braids",
    duration: "3-4h",
    price: "80€",
    description: "Tresses carrées classiques, protectrices et élégantes",
    image: "box+braids+hairstyle+african+woman",
    category: "Tresses",
  },
  {
    id: "2",
    name: "Vanilles Twists",
    duration: "2-3h",
    price: "65€",
    description: "Twists en vanilles pour un look naturel et facile à entretenir",
    image: "twist+hairstyle+natural+hair",
    category: "Tresses",
  },
  {
    id: "3",
    name: "Locks Naturelles",
    duration: "4-5h",
    price: "120€",
    description: "Installation ou entretien de locks pour cheveux naturels",
    image: "natural+locs+dreadlocks+hairstyle",
    category: "Locks",
  },
  {
    id: "4",
    name: "Cornrows Collées",
    duration: "2-3h",
    price: "70€",
    description: "Tresses collées au cuir chevelu, idéales pour le sport",
    image: "cornrows+braids+hairstyle",
    category: "Tresses",
  },
  {
    id: "5",
    name: "Crochet Braids",
    duration: "2h",
    price: "75€",
    description: "Installation rapide avec la technique crochet",
    image: "crochet+braids+curly+hairstyle",
    category: "Tresses",
  },
  {
    id: "6",
    name: "Passion Twists",
    duration: "3-4h",
    price: "85€",
    description: "Twists bouclés pour un look bohème et romantique",
    image: "passion+twists+curly+hairstyle",
    category: "Tresses",
  },
  {
    id: "7",
    name: "Tissage Naturel",
    duration: "2-3h",
    price: "90€",
    description: "Pose de tissage pour plus de longueur et volume",
    image: "weave+natural+hair+extension",
    category: "Extensions",
  },
  {
    id: "8",
    name: "Afro Naturel",
    duration: "1-2h",
    price: "45€",
    description: "Coupe, soin et mise en forme de votre afro naturel",
    image: "natural+afro+hairstyle",
    category: "Naturel",
  },
  {
    id: "9",
    name: "Faux Locks",
    duration: "3-4h",
    price: "95€",
    description: "Locks temporaires sans engagement",
    image: "faux+locs+temporary+hairstyle",
    category: "Locks",
  },
]

const categories = ["Tous", "Tresses", "Locks", "Extensions", "Naturel"]

export default function ServicesPage() {
  const [selectedCategory, setSelectedCategory] = useState("Tous")
  const [selectedService, setSelectedService] = useState<Service | null>(null)
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false)

  const filteredServices =
    selectedCategory === "Tous" ? services : services.filter((service) => service.category === selectedCategory)

  const handleBooking = (service: Service) => {
    setSelectedService(service)
    setIsBookingModalOpen(true)
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="pb-20 md:pb-8">
        {/* Hero Section */}
        <section className="relative h-64 md:h-80 flex items-center justify-center overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-b from-black/60 to-black/30 z-10" />
          <div className="absolute inset-0 bg-gradient-to-tr from-gold/20 via-transparent to-transparent z-[11]" />
          <Image
            src="/african-hairstylist-salon.jpg"
            alt="Services NappyLocks"
            fill
            className="object-cover"
            priority
          />
          <div className="relative z-20 container mx-auto px-4 text-center text-white">
            <h1 className="text-3xl md:text-5xl font-bold tracking-tight mb-4 text-balance">
              Nos Services de Coiffure
            </h1>
            <p className="text-lg md:text-xl text-white/90 max-w-2xl mx-auto text-pretty">
              Choisissez votre coiffure préférée et réservez en ligne
            </p>
          </div>
        </section>

        <div className="container mx-auto px-4 py-8 md:py-12">
          {/* Category Filter */}
          <div className="flex gap-2 overflow-x-auto pb-4 mb-8 -mx-4 px-4 md:mx-0 md:px-0 scrollbar-hide">
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
                  selectedCategory === category
                    ? "bg-gold text-gold-foreground shadow-lg shadow-gold/20"
                    : "bg-muted text-foreground hover:bg-muted/80"
                }`}
              >
                {category}
              </button>
            ))}
          </div>

          {/* Services Grid - Visual Gallery */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredServices.map((service) => (
              <Card
                key={service.id}
                className="overflow-hidden border-border group cursor-pointer hover:shadow-xl hover:border-gold/50 transition-all duration-300"
                onClick={() => handleBooking(service)}
              >
                {/* Image */}
                <div className="relative h-72 overflow-hidden">
                  <Image
                    src={`/.jpg?key=4xeiz&height=500&width=400&query=${service.image}`}
                    alt={service.name}
                    fill
                    className="object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                  {/* Price Badge */}
                  <div className="absolute top-4 right-4 bg-gold text-gold-foreground px-3 py-1 rounded-full text-sm font-semibold shadow-lg">
                    {service.price}
                  </div>
                </div>

                {/* Content */}
                <div className="p-5">
                  <h3 className="font-semibold text-xl mb-2">{service.name}</h3>
                  <p className="text-sm text-muted-foreground mb-4 text-pretty">{service.description}</p>

                  <div className="flex items-center gap-4 text-sm text-muted-foreground mb-4">
                    <div className="flex items-center gap-1">
                      <Clock className="w-4 h-4" />
                      <span>{service.duration}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Calendar className="w-4 h-4 text-gold" />
                      <span>Réserver</span>
                    </div>
                  </div>

                  <Button
                    className="w-full h-11 bg-gold hover:bg-gold-dark text-gold-foreground"
                    onClick={(e) => {
                      e.stopPropagation()
                      handleBooking(service)
                    }}
                  >
                    Prendre rendez-vous
                  </Button>
                </div>
              </Card>
            ))}
          </div>

          {filteredServices.length === 0 && (
            <div className="text-center py-16">
              <p className="text-muted-foreground text-lg">Aucun service trouvé dans cette catégorie</p>
            </div>
          )}
        </div>
      </main>

      <MobileNav />

      {/* Booking Modal */}
      {selectedService && (
        <BookingModal
          isOpen={isBookingModalOpen}
          onClose={() => setIsBookingModalOpen(false)}
          service={selectedService}
        />
      )}
    </div>
  )
}
