import { useState, useEffect } from 'react';
import {
  User,
  Bell,
  Shield,
  Palette,
  Save,
  Eye,
  EyeOff,
  Loader2,
  CheckCircle,
  AlertCircle,
} from 'lucide-react';
import Header from '../components/layout/Header';
import { Card, CardContent, CardHeader, CardTitle, Button, Alert } from '../components/ui';
import { useAuth } from '../context/AuthContext';

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
  const { admin, updateProfile, error, clearError } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const [formData, setFormData] = useState({
    nom: '',
    telephone: '',
    adresse: '',
    ville: '',
    pays: '',
  });

  useEffect(() => {
    if (admin) {
      setFormData({
        nom: admin.nom || '',
        telephone: admin.telephone || '',
        adresse: admin.adresse || '',
        ville: admin.ville || '',
        pays: admin.pays || '',
      });
    }
  }, [admin]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setSuccess(false);
    clearError();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setSuccess(false);
    clearError();

    const result = await updateProfile(formData);
    setIsLoading(false);

    if (result) {
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Informations du profil</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit}>
          <div className="flex items-center gap-6 mb-6">
            <div className="w-20 h-20 bg-primary rounded-full flex items-center justify-center">
              <User className="w-10 h-10 text-secondary" />
            </div>
            <div>
              <p className="font-medium text-text">{admin?.nom || 'Administrateur'}</p>
              <p className="text-sm text-text-light">{admin?.email}</p>
            </div>
          </div>

          {error && (
            <Alert variant="error" className="mb-4">
              <AlertCircle className="w-5 h-5" />
              <span>{error}</span>
            </Alert>
          )}

          {success && (
            <Alert variant="success" className="mb-4">
              <CheckCircle className="w-5 h-5" />
              <span>Profil mis a jour avec succes</span>
            </Alert>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-text mb-1">Nom</label>
              <input
                type="text"
                name="nom"
                value={formData.nom}
                onChange={handleChange}
                className="input"
                placeholder="Votre nom"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-text mb-1">Email</label>
              <input
                type="email"
                value={admin?.email || ''}
                className="input bg-gray-100"
                disabled
              />
              <p className="text-xs text-text-light mt-1">L'email ne peut pas etre modifie</p>
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-text mb-1">Telephone</label>
              <input
                type="tel"
                name="telephone"
                value={formData.telephone}
                onChange={handleChange}
                className="input"
                placeholder="+33 6 12 34 56 78"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-text mb-1">Adresse</label>
              <input
                type="text"
                name="adresse"
                value={formData.adresse}
                onChange={handleChange}
                className="input"
                placeholder="123 Rue Example"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-text mb-1">Ville</label>
              <input
                type="text"
                name="ville"
                value={formData.ville}
                onChange={handleChange}
                className="input"
                placeholder="Paris"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-text mb-1">Pays</label>
              <input
                type="text"
                name="pays"
                value={formData.pays}
                onChange={handleChange}
                className="input"
                placeholder="France"
              />
            </div>
          </div>

          <div className="mt-6 flex justify-end">
            <Button type="submit" variant="primary" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Enregistrement...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  Enregistrer
                </>
              )}
            </Button>
          </div>
        </form>
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
  const { changePassword, error, clearError } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);

  const [passwords, setPasswords] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setPasswords((prev) => ({ ...prev, [name]: value }));
    setSuccess(false);
    setLocalError(null);
    clearError();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError(null);
    clearError();

    if (passwords.newPassword !== passwords.confirmPassword) {
      setLocalError('Les mots de passe ne correspondent pas');
      return;
    }

    if (passwords.newPassword.length < 6) {
      setLocalError('Le nouveau mot de passe doit contenir au moins 6 caracteres');
      return;
    }

    setIsLoading(true);
    setSuccess(false);

    const result = await changePassword({
      currentPassword: passwords.currentPassword,
      newPassword: passwords.newPassword,
    });

    setIsLoading(false);

    if (result) {
      setSuccess(true);
      setPasswords({ currentPassword: '', newPassword: '', confirmPassword: '' });
      setTimeout(() => setSuccess(false), 3000);
    }
  };

  const displayError = localError || error;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Securite du compte</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit}>
          <div className="space-y-6">
            <div>
              <h4 className="font-medium text-text mb-4">Changer le mot de passe</h4>

              {displayError && (
                <Alert variant="error" className="mb-4">
                  <AlertCircle className="w-5 h-5" />
                  <span>{displayError}</span>
                </Alert>
              )}

              {success && (
                <Alert variant="success" className="mb-4">
                  <CheckCircle className="w-5 h-5" />
                  <span>Mot de passe modifie avec succes</span>
                </Alert>
              )}

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-text mb-1">Mot de passe actuel</label>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      name="currentPassword"
                      value={passwords.currentPassword}
                      onChange={handleChange}
                      className="input pr-10"
                      placeholder="••••••••"
                      required
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
                  <input
                    type="password"
                    name="newPassword"
                    value={passwords.newPassword}
                    onChange={handleChange}
                    className="input"
                    placeholder="••••••••"
                    required
                    minLength={6}
                  />
                  <p className="text-xs text-text-light mt-1">Minimum 6 caracteres</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-text mb-1">Confirmer le mot de passe</label>
                  <input
                    type="password"
                    name="confirmPassword"
                    value={passwords.confirmPassword}
                    onChange={handleChange}
                    className="input"
                    placeholder="••••••••"
                    required
                  />
                </div>
              </div>
            </div>

            <div className="pt-6 border-t border-gray-100">
              <h4 className="font-medium text-text mb-4">Authentification a deux facteurs</h4>
              <div className="p-4 bg-background rounded-lg flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Shield className="w-6 h-6 text-text-light" />
                  <div>
                    <p className="font-medium text-text">2FA desactive</p>
                    <p className="text-sm text-text-light">Ajoutez une couche de securite supplementaire</p>
                  </div>
                </div>
                <Button type="button" variant="outline" size="sm" disabled>
                  Bientot disponible
                </Button>
              </div>
            </div>
          </div>

          <div className="mt-6 flex justify-end">
            <Button type="submit" variant="primary" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Enregistrement...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  Enregistrer
                </>
              )}
            </Button>
          </div>
        </form>
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
