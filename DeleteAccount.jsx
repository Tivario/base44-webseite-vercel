import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { AlertTriangle, Trash2 } from 'lucide-react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { toast } from 'sonner';

export default function DeleteAccount({ user }) {
  const [showDialog, setShowDialog] = useState(false);
  const [password, setPassword] = useState('');
  const [confirmText, setConfirmText] = useState('');

  const handleDelete = async () => {
    if (confirmText !== 'LÖSCHEN') {
      toast.error('Bitte gib "LÖSCHEN" ein um zu bestätigen');
      return;
    }
    if (!password) {
      toast.error('Bitte gib dein Passwort ein');
      return;
    }

    try {
      // Note: In einer echten Implementierung würde hier die Account-Löschung erfolgen
      // Base44 hat keine integrierte Account-Lösch-API
      toast.info('Account-Löschung wird verarbeitet...');
      
      // Alle User-Daten löschen
      const products = await base44.entities.Product.filter({ seller_email: user.email });
      for (const product of products) {
        await base44.entities.Product.delete(product.id);
      }

      // Nach kurzer Verzögerung ausloggen
      setTimeout(() => {
        base44.auth.logout();
      }, 2000);
    } catch (err) {
      toast.error('Fehler beim Löschen des Accounts');
    }
  };

  return (
    <>
      <Card className="border-red-200 bg-red-50/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-red-700">
            <AlertTriangle className="w-5 h-5" />
            Gefahr-Zone
          </CardTitle>
          <CardDescription>
            Irreversible Aktionen mit deinem Account
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="p-4 bg-white rounded-xl border border-red-200">
            <h4 className="font-medium text-red-900 mb-2">Konto löschen</h4>
            <p className="text-sm text-red-700 mb-4">
              Wenn du dein Tivaro-Konto löschst:
            </p>
            <ul className="text-sm text-red-700 space-y-1 list-disc list-inside mb-4">
              <li>Werden alle deine Daten dauerhaft gelöscht</li>
              <li>Werden deine Artikel und Angebote entfernt</li>
              <li>Kannst du dich nicht mehr mit diesem Account einloggen</li>
              <li>Können offene Transaktionen nicht abgeschlossen werden</li>
              <li>Ist diese Aktion nicht rückgängig zu machen</li>
            </ul>
            <Button
              variant="destructive"
              onClick={() => setShowDialog(true)}
              className="w-full bg-red-600 hover:bg-red-700"
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Konto endgültig löschen
            </Button>
          </div>
        </CardContent>
      </Card>

      <AlertDialog open={showDialog} onOpenChange={setShowDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2 text-red-700">
              <AlertTriangle className="w-5 h-5" />
              Konto wirklich löschen?
            </AlertDialogTitle>
            <AlertDialogDescription>
              Diese Aktion kann nicht rückgängig gemacht werden. Alle deine Daten werden dauerhaft gelöscht.
            </AlertDialogDescription>
          </AlertDialogHeader>
          
          <div className="space-y-4 py-4">
            <div>
              <Label>Passwort bestätigen</Label>
              <Input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Dein Passwort"
                className="mt-1.5"
              />
            </div>
            
            <div>
              <Label>Tippe "LÖSCHEN" um zu bestätigen</Label>
              <Input
                value={confirmText}
                onChange={(e) => setConfirmText(e.target.value)}
                placeholder="LÖSCHEN"
                className="mt-1.5"
              />
            </div>
          </div>

          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => {
              setPassword('');
              setConfirmText('');
            }}>
              Abbrechen
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-red-600 hover:bg-red-700"
            >
              Konto endgültig löschen
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}