# 🔌 Intégration Frontend-Backend - TODO

## ✅ Ce qui est déjà fait

- ✅ Backend fonctionnel sur `http://localhost:4000`
- ✅ Service API configuré (`mobile/src/services/api.ts`)
- ✅ Authentification (login/signup) connectée au backend
- ✅ Token JWT stocké dans AsyncStorage
- ✅ Validation Zod sur le backend
- ✅ Indicateurs visuels sur l'inscription

## ❌ Ce qui reste à faire

### 1. Dashboard (Priorité HAUTE)

**Fichier**: `mobile/app/(tabs)/dashboard.tsx`

**Problèmes actuels**:
- ❌ Affiche "Aucune transaction" même s'il y en a
- ❌ Affiche "Aucun objectif" même s'il y en a
- ❌ Notifications mockées en dur (fausses notifications)
- ❌ Solde affiché en dur (0 €)

**À faire**:
```typescript
// 1. Charger les données au montage du composant
useEffect(() => {
  loadDashboardData();
}, []);

const loadDashboardData = async () => {
  try {
    // Charger les stats
    const statsResponse = await api.get('/stats/dashboard');
    setBalance(statsResponse.data.totalBalance);
    setIncome(statsResponse.data.totalIncome);
    setExpense(statsResponse.data.totalExpense);
    
    // Charger les dernières transactions (5)
    const transactionsResponse = await api.get('/transactions?limit=5');
    setRecentTransactions(transactionsResponse.data.transactions);
    
    // Charger les objectifs (3 premiers)
    const goalsResponse = await api.get('/goals');
    setRecentGoals(goalsResponse.data.goals.slice(0, 3));
    
    // Charger les notifications non lues
    const notificationsResponse = await api.get('/notifications?unreadOnly=true&limit=10');
    setNotifications(notificationsResponse.data.notifications);
    setUnreadCount(notificationsResponse.data.unreadCount);
  } catch (error) {
    console.error('Erreur chargement dashboard:', error);
  }
};
```

**Supprimer**:
- Les notifications mockées (lignes avec "Transaction ajoutée", "Il y a 2 heures", etc.)
- Remplacer par les vraies notifications du backend

### 2. Page Transactions (Priorité HAUTE)

**Fichier**: `mobile/app/(tabs)/transactions.tsx`

**À faire**:
```typescript
// Charger les transactions depuis le backend
const loadTransactions = async () => {
  try {
    const response = await api.get('/transactions', {
      params: {
        type: filter, // 'all', 'income', 'expense'
        search: searchQuery,
        limit: 50
      }
    });
    setTransactions(response.data.transactions);
  } catch (error) {
    console.error('Erreur chargement transactions:', error);
  }
};

// Créer une transaction
const handleAddTransaction = async () => {
  try {
    await api.post('/transactions', {
      type: transactionType,
      category: selectedCategory,
      amount: parseFloat(amount),
      date: selectedDate.toISOString(),
      note: note
    });
    
    // Recharger les transactions
    await loadTransactions();
    closeModal();
  } catch (error) {
    Alert.alert('Erreur', 'Impossible de créer la transaction');
  }
};

// Supprimer une transaction
const handleDeleteTransaction = async (id: string) => {
  try {
    await api.delete(`/transactions/${id}`);
    await loadTransactions();
  } catch (error) {
    Alert.alert('Erreur', 'Impossible de supprimer la transaction');
  }
};
```

### 3. Page Goals (Priorité HAUTE)

**Fichier**: `mobile/app/(tabs)/goals.tsx`

**À faire**:
```typescript
// Charger les objectifs
const loadGoals = async () => {
  try {
    const response = await api.get('/goals');
    setGoals(response.data.goals);
  } catch (error) {
    console.error('Erreur chargement objectifs:', error);
  }
};

// Créer un objectif
const handleAddGoal = async () => {
  try {
    await api.post('/goals', {
      title: goalTitle,
      targetAmount: parseFloat(targetAmount),
      deadline: deadline?.toISOString(),
      icon: selectedIcon,
      color: selectedColor,
      category: selectedCategory
    });
    
    await loadGoals();
    closeModal();
  } catch (error) {
    Alert.alert('Erreur', 'Impossible de créer l\'objectif');
  }
};

// Allouer de l'argent
const handleAllocate = async (goalId: string, amount: number) => {
  try {
    await api.post(`/goals/${goalId}/allocate`, {
      amount: amount
    });
    
    await loadGoals();
  } catch (error) {
    Alert.alert('Erreur', 'Impossible d\'allouer l\'argent');
  }
};
```

### 4. Page Profile (Priorité MOYENNE)

**Fichier**: `mobile/app/(tabs)/profile.tsx`

**À faire**:
```typescript
// Charger le profil
const loadProfile = async () => {
  try {
    const response = await api.get('/users/me');
    setUserName(response.data.user.name);
    setUserEmail(response.data.user.email);
    setProfilePhoto(response.data.user.profilePhoto);
    setSelectedCurrency(response.data.user.currency);
    setSelectedLanguage(response.data.user.language);
    setSelectedCountry(getCountryByCode(response.data.user.country));
  } catch (error) {
    console.error('Erreur chargement profil:', error);
  }
};

// Mettre à jour le profil
const handleUpdateProfile = async () => {
  try {
    await api.put('/users/me', {
      name: editName,
      currency: selectedCurrency,
      language: selectedLanguage
    });
    
    await loadProfile();
  } catch (error) {
    Alert.alert('Erreur', 'Impossible de mettre à jour le profil');
  }
};

// Upload photo
const handleUploadPhoto = async (uri: string) => {
  try {
    const formData = new FormData();
    formData.append('photo', {
      uri,
      type: 'image/jpeg',
      name: 'profile.jpg'
    } as any);
    
    const response = await api.post('/users/me/photo', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    
    setProfilePhoto(response.data.photoUrl);
  } catch (error) {
    Alert.alert('Erreur', 'Impossible d\'uploader la photo');
  }
};
```

### 5. Ajouter un bouton de déconnexion (Priorité HAUTE)

**Fichier**: `mobile/app/(tabs)/profile.tsx`

**À ajouter**:
```typescript
const handleLogout = async () => {
  Alert.alert(
    'Déconnexion',
    'Êtes-vous sûr de vouloir vous déconnecter ?',
    [
      { text: 'Annuler', style: 'cancel' },
      {
        text: 'Déconnecter',
        style: 'destructive',
        onPress: async () => {
          // Vider AsyncStorage
          await AsyncStorage.multiRemove([
            'token',
            'user',
            'hasSeenOnboarding',
            'transactions',
            'goals',
            'pendingSync'
          ]);
          
          // Rediriger vers login
          router.replace('/(auth)/login');
        }
      }
    ]
  );
};

// Dans le JSX, ajouter un bouton
<TouchableOpacity 
  style={styles.logoutButton}
  onPress={handleLogout}
>
  <MaterialCommunityIcons name="logout" size={20} color="#ff6b6b" />
  <Text style={styles.logoutText}>Se déconnecter</Text>
</TouchableOpacity>
```

### 6. Supprimer les données mockées

**Fichiers à nettoyer**:
- `mobile/app/(tabs)/dashboard.tsx` - Supprimer les fausses notifications
- `mobile/app/(tabs)/transactions.tsx` - Supprimer les transactions mockées
- `mobile/app/(tabs)/goals.tsx` - Supprimer les objectifs mockés

**Rechercher et supprimer**:
```typescript
// Supprimer toutes les lignes comme :
const mockTransactions = [...]
const mockGoals = [...]
const mockNotifications = [...]

// Remplacer par :
const [transactions, setTransactions] = useState([]);
const [goals, setGoals] = useState([]);
const [notifications, setNotifications] = useState([]);
```

## 📋 Ordre de priorité

### Phase 1 - Essentiel (1-2 heures)
1. ✅ Ajouter bouton de déconnexion
2. ✅ Connecter Dashboard au backend (stats + transactions récentes)
3. ✅ Supprimer les fausses notifications

### Phase 2 - Fonctionnalités (2-3 heures)
4. ✅ Connecter page Transactions (CRUD complet)
5. ✅ Connecter page Goals (CRUD + allocation)
6. ✅ Connecter page Profile (update + photo)

### Phase 3 - Polish (1 heure)
7. ✅ Gestion des erreurs réseau
8. ✅ Loading states
9. ✅ Messages de succès
10. ✅ Pull-to-refresh fonctionnel

## 🔧 Configuration requise

### mobile/.env
```env
EXPO_PUBLIC_API_URL=http://localhost:4000/api
```

### Vérifier que le backend tourne
```bash
# Terminal 1 - Backend
cd backend
npm run dev

# Terminal 2 - Frontend
cd mobile
npx expo start
```

## 🎯 Résultat attendu

Après l'intégration :
- ✅ Nouvel utilisateur voit un dashboard vide (0 transaction, 0 objectif)
- ✅ Peut créer des transactions qui s'affichent immédiatement
- ✅ Peut créer des objectifs et allouer de l'argent
- ✅ Le solde se met à jour automatiquement
- ✅ Les notifications sont réelles (objectif atteint, etc.)
- ✅ Peut se déconnecter et se reconnecter
- ✅ Les données persistent dans MongoDB

## 📝 Notes importantes

1. **AsyncStorage** : Utilisé uniquement pour le cache offline, pas comme source de vérité
2. **MongoDB** : Source de vérité pour toutes les données
3. **Token JWT** : Expire après 24h (à configurer dans le backend)
4. **Erreurs réseau** : Toujours gérer avec try/catch et Alert.alert()
5. **Loading states** : Afficher un spinner pendant les requêtes API

---

**Status actuel** : Frontend avec données mockées, Backend fonctionnel  
**Prochaine étape** : Intégration complète frontend-backend
