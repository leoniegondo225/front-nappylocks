"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { RefreshCw, Download, Upload } from "lucide-react"

interface SettingsTabProps {
  onRefresh: () => void
}

export function SettingsTab({ onRefresh }: SettingsTabProps) {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Paramètres système</CardTitle>
          <CardDescription>Configuration de la plateforme</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Mode maintenance</Label>
              <p className="text-sm text-muted-foreground">Mettre la plateforme en maintenance</p>
            </div>
            <Switch />
          </div>
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Notifications email</Label>
              <p className="text-sm text-muted-foreground">Activer les notifications par email</p>
            </div>
            <Switch defaultChecked />
          </div>
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Mode sécurisé</Label>
              <p className="text-sm text-muted-foreground">Activer l'authentification à deux facteurs</p>
            </div>
            <Switch />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Sauvegarde et restauration</CardTitle>
          <CardDescription>Gestion des données</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-4">
            <Button variant="outline" className="flex-1 bg-transparent">
              <Download className="w-4 h-4 mr-2" />
              Télécharger sauvegarde
            </Button>
            <Button variant="outline" className="flex-1 bg-transparent">
              <Upload className="w-4 h-4 mr-2" />
              Importer sauvegarde
            </Button>
          </div>
          <Button variant="outline" className="w-full bg-transparent" onClick={onRefresh}>
            <RefreshCw className="w-4 h-4 mr-2" />
            Rafraîchir les données
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
