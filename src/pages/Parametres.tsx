import { useState } from 'react';
import {
  User,
  Bell,
  Shield,
  Palette,
  Save,
  Eye,
  EyeOff,
} from 'lucide-react';
import Header from '../components/layout/Header';
import { Card, CardContent, CardHeader, CardTitle, Button } from '../components/ui';

type SettingsTab = 'profile' | 'notifications' | 'security' | 'appearance';

export default function Parametres() {
  const [activeTab, setActiveTab] = useState<SettingsTab>('profile');
  const [showPassword, setShowPassword] = useState(false);

  const tabs = [
    { id: 'profile' as const, label: 'Profil', icon: User },
    { id: 'notifications' as const, label: 'Notifications', icon: Bell },
    { id: 'security' as const, label: 'Sécurité', icon: Shield },
    { id: 'appearance' as const, label: 'Apparence', icon: Palette },
  ];

  return (
    <div>
      <Header title="Paramètres" subtitle="Configurez votre espace administrateur" />

      <div className="p-6">
        <div className="flex flex-col md:flex-row gap-6">
          {/* Sidebar */}
          <div className="md:w-64">
            <Card>
              <CardContent className="p-2">
                {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                      activeTab === tab.id
                        ? 'bg-primary text-white'
                        : 'text-text-light hover:bg-gray-100'
                    }`}
                  >
                    <tab.icon className="w-5 h-5" />
                    <span className="font-medium">{tab.label}</span>
                  </button>
                ))}
              </CardContent>
            </Card>
          </div>

          {/* Content */}
          <div className="flex-1">
            {activeTab === 'profile' && <ProfileSettings />}
            {activeTab === 'notifications' && <NotificationSettings />}
            {activeTab === 'security' && <SecuritySettings showPassword={showPassword} setShowPassword={setShowPassword} />}
            {activeTab === 'appearance' && <AppearanceSettings />}
          </div>
        </div>
      </div>
    </div>
  );
}

function ProfileSettings() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Informations du profil</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex items-center gap-6 mb-6">
          <div className="w-20 h-20 bg-primary rounded-full flex items-center justify-center">
            <User className="w-10 h-10 text-secondary" />
          </div>
          <div>
            <Button variant="outline" size="sm">
              Changer la photo
            </Button>
            <p className="text-xs text-text-light mt-2">JPG, PNG ou GIF. Max 2MB.</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-text mb-1">Prénom</label>
            <input type="text" defaultValue="Admin" className="input" />
          </div>
          <div>
            <label className="block text-sm font-medium text-text mb-1">Nom</label>
            <input type="text" defaultValue="User" className="input" />
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-text mb-1">Email</label>
            <input type="email" defaultValue="admin@med.com" className="input" />
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-text mb-1">Téléphone</label>
            <input type="tel" defaultValue="+33 6 12 34 56 78" className="input" />
          </div>
        </div>

        <div className="mt-6 flex justify-end">
          <Button variant="primary">
            <Save className="w-4 h-4 mr-2" />
            Enregistrer
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

function NotificationSettings() {
  const [notifications, setNotifications] = useState({
    newOrder: true,
    orderStatus: true,
    lowStock: true,
    newClient: false,
    marketing: false,
  });

  const toggleNotification = (key: keyof typeof notifications) => {
    setNotifications((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Préférences de notification</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {[
            { key: 'newOrder' as const, label: 'Nouvelle commande', desc: 'Recevoir une notification pour chaque nouvelle commande' },
            { key: 'orderStatus' as const, label: 'Changement de statut', desc: 'Notification quand une commande change de statut' },
            { key: 'lowStock' as const, label: 'Alerte stock faible', desc: 'Notification quand le stock d\'un véhicule est faible' },
            { key: 'newClient' as const, label: 'Nouveau client', desc: 'Notification lors de l\'inscription d\'un nouveau client' },
            { key: 'marketing' as const, label: 'Communications marketing', desc: 'Recevoir des informations sur les nouvelles fonctionnalités' },
          ].map((item) => (
            <div key={item.key} className="flex items-center justify-between p-4 bg-background rounded-lg">
              <div>
                <p className="font-medium text-text">{item.label}</p>
                <p className="text-sm text-text-light">{item.desc}</p>
              </div>
              <button
                onClick={() => toggleNotification(item.key)}
                className={`relative w-12 h-6 rounded-full transition-colors ${
                  notifications[item.key] ? 'bg-secondary' : 'bg-gray-300'
                }`}
              >
                <span
                  className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform ${
                    notifications[item.key] ? 'translate-x-7' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>
          ))}
        </div>

        <div className="mt-6 flex justify-end">
          <Button variant="primary">
            <Save className="w-4 h-4 mr-2" />
            Enregistrer
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

function SecuritySettings({
  showPassword,
  setShowPassword,
}: {
  showPassword: boolean;
  setShowPassword: (show: boolean) => void;
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Sécurité du compte</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          <div>
            <h4 className="font-medium text-text mb-4">Changer le mot de passe</h4>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-text mb-1">Mot de passe actuel</label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    className="input pr-10"
                    placeholder="••••••••"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-text-light"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-text mb-1">Nouveau mot de passe</label>
                <input type="password" className="input" placeholder="••••••••" />
              </div>
              <div>
                <label className="block text-sm font-medium text-text mb-1">Confirmer le mot de passe</label>
                <input type="password" className="input" placeholder="••••••••" />
              </div>
            </div>
          </div>

          <div className="pt-6 border-t border-gray-100">
            <h4 className="font-medium text-text mb-4">Authentification à deux facteurs</h4>
            <div className="p-4 bg-background rounded-lg flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Shield className="w-6 h-6 text-text-light" />
                <div>
                  <p className="font-medium text-text">2FA désactivé</p>
                  <p className="text-sm text-text-light">Ajoutez une couche de sécurité supplémentaire</p>
                </div>
              </div>
              <Button variant="outline" size="sm">
                Activer
              </Button>
            </div>
          </div>
        </div>

        <div className="mt-6 flex justify-end">
          <Button variant="primary">
            <Save className="w-4 h-4 mr-2" />
            Enregistrer
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

function AppearanceSettings() {
  const [theme, setTheme] = useState<'light' | 'dark' | 'system'>('light');
  const [language, setLanguage] = useState('fr');

  return (
    <Card>
      <CardHeader>
        <CardTitle>Apparence et langue</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-text mb-3">Thème</label>
            <div className="grid grid-cols-3 gap-4">
              {[
                { value: 'light' as const, label: 'Clair' },
                { value: 'dark' as const, label: 'Sombre' },
                { value: 'system' as const, label: 'Système' },
              ].map((option) => (
                <button
                  key={option.value}
                  onClick={() => setTheme(option.value)}
                  className={`p-4 rounded-lg border-2 transition-colors ${
                    theme === option.value
                      ? 'border-secondary bg-secondary/10'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div
                    className={`w-full h-20 rounded-lg mb-2 ${
                      option.value === 'dark' ? 'bg-gray-800' : 'bg-gray-100'
                    }`}
                  />
                  <p className="font-medium text-text">{option.label}</p>
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-text mb-1">Langue</label>
            <select
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
              className="input"
            >
              <option value="fr">Français</option>
              <option value="en">English</option>
              <option value="es">Español</option>
            </select>
          </div>
        </div>

        <div className="mt-6 flex justify-end">
          <Button variant="primary">
            <Save className="w-4 h-4 mr-2" />
            Enregistrer
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
