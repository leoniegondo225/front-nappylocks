"use client"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { MessageCircle, X, Send, Sparkles } from "lucide-react"

interface Message {
  id: string
  text: string
  sender: "user" | "bot"
  timestamp: Date
}

export function NappyBot() {
  const [isOpen, setIsOpen] = useState(false)
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      text: "Bonjour ! Je suis NappyBot, votre assistant virtuel. Comment puis-je vous aider aujourd'hui ?",
      sender: "bot",
      timestamp: new Date(),
    },
  ])
  const [inputValue, setInputValue] = useState("")
  const [isTyping, setIsTyping] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const handleSend = async () => {
    if (!inputValue.trim()) return

    const userMessage: Message = {
      id: Date.now().toString(),
      text: inputValue,
      sender: "user",
      timestamp: new Date(),
    }

    setMessages((prev) => [...prev, userMessage])
    setInputValue("")
    setIsTyping(true)

    // Simulate bot response (replace with actual API call)
    setTimeout(() => {
      const botResponse: Message = {
        id: (Date.now() + 1).toString(),
        text: getBotResponse(inputValue),
        sender: "bot",
        timestamp: new Date(),
      }
      setMessages((prev) => [...prev, botResponse])
      setIsTyping(false)
    }, 1000)
  }

  const getBotResponse = (userInput: string): string => {
    const input = userInput.toLowerCase()

    if (input.includes("rendez-vous") || input.includes("réserver")) {
      return "Pour réserver un rendez-vous, visitez notre page Services où vous pourrez choisir votre coiffure préférée et sélectionner un créneau horaire. Souhaitez-vous que je vous y redirige ?"
    }

    if (input.includes("produit") || input.includes("acheter")) {
      return "Nous proposons une large gamme de produits naturels pour cheveux. Vous pouvez explorer notre boutique en ligne. Recherchez-vous un type de produit en particulier ?"
    }

    if (input.includes("horaire") || input.includes("ouvert")) {
      return "Nous sommes ouverts du lundi au vendredi de 9h à 19h, et le samedi de 10h à 18h. Nous sommes fermés le dimanche."
    }

    if (input.includes("prix") || input.includes("tarif")) {
      return "Nos prix varient selon le service choisi. Les tresses démarrent à 65€, les locks à 95€. Consultez notre page Services pour voir tous les tarifs."
    }

    if (input.includes("livraison")) {
      return "La livraison est gratuite à partir de 50€ d'achat. Pour les commandes inférieures, les frais de livraison sont de 5,99€."
    }

    return "Je suis là pour vous aider ! Vous pouvez me poser des questions sur nos services, produits, horaires, ou prendre un rendez-vous. Comment puis-je vous assister ?"
  }

  const quickActions = [
    { label: "Réserver un RDV", action: "Je voudrais réserver un rendez-vous" },
    { label: "Voir les produits", action: "Quels produits proposez-vous ?" },
    { label: "Horaires", action: "Quels sont vos horaires ?" },
  ]

  return (
    <>
      {/* Floating Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-20 md:bottom-6 right-4 md:right-6 z-50 w-14 h-14 bg-foreground text-background rounded-full shadow-lg flex items-center justify-center hover:scale-110 transition-transform duration-200"
          aria-label="Ouvrir le chat"
        >
          <MessageCircle className="w-6 h-6" />
          <span className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full animate-pulse" />
        </button>
      )}

      {/* Chat Window */}
      {isOpen && (
        <div className="fixed inset-0 md:inset-auto md:bottom-6 md:right-6 md:w-96 md:h-[600px] z-50 bg-background md:rounded-2xl md:shadow-2xl flex flex-col border border-border overflow-hidden">
          {/* Header */}
          <div className="bg-foreground text-background p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-background text-foreground rounded-full flex items-center justify-center">
                <Sparkles className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-semibold">NappyBot</h3>
                <p className="text-xs text-background/80">Assistant virtuel</p>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="text-background hover:bg-background/10 rounded-full p-2 transition-colors"
              aria-label="Fermer le chat"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-muted/20">
            {messages.map((message) => (
              <div key={message.id} className={`flex ${message.sender === "user" ? "justify-end" : "justify-start"}`}>
                <div
                  className={`max-w-[80%] rounded-2xl px-4 py-3 ${
                    message.sender === "user" ? "bg-foreground text-background" : "bg-background border border-border"
                  }`}
                >
                  <p className="text-sm text-pretty leading-relaxed">{message.text}</p>
                  <p
                    className={`text-[10px] mt-1 ${
                      message.sender === "user" ? "text-background/60" : "text-muted-foreground"
                    }`}
                  >
                    {message.timestamp.toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" })}
                  </p>
                </div>
              </div>
            ))}

            {isTyping && (
              <div className="flex justify-start">
                <div className="bg-background border border-border rounded-2xl px-4 py-3">
                  <div className="flex gap-1">
                    <span
                      className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce"
                      style={{ animationDelay: "0ms" }}
                    />
                    <span
                      className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce"
                      style={{ animationDelay: "150ms" }}
                    />
                    <span
                      className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce"
                      style={{ animationDelay: "300ms" }}
                    />
                  </div>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Quick Actions */}
          {messages.length === 1 && (
            <div className="px-4 pb-3 flex gap-2 flex-wrap">
              {quickActions.map((action, idx) => (
                <button
                  key={idx}
                  onClick={() => {
                    setInputValue(action.action)
                    handleSend()
                  }}
                  className="text-xs px-3 py-2 bg-muted hover:bg-muted/80 rounded-full transition-colors"
                >
                  {action.label}
                </button>
              ))}
            </div>
          )}

          {/* Input */}
          <div className="p-4 border-t border-border bg-background">
            <form
              onSubmit={(e) => {
                e.preventDefault()
                handleSend()
              }}
              className="flex gap-2"
            >
              <Input
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder="Tapez votre message..."
                className="flex-1 h-11"
              />
              <Button type="submit" size="icon" className="h-11 w-11 flex-shrink-0" disabled={!inputValue.trim()}>
                <Send className="w-5 h-5" />
              </Button>
            </form>
          </div>
        </div>
      )}
    </>
  )
}
