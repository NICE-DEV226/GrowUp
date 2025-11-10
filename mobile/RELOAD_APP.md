# 🔄 Comment Recharger l'Application Après Modifications

## ⚠️ Problème
Les modifications du splash screen ne sont pas visibles car l'application utilise une version en cache.

## ✅ Solutions

### Solution 1 : Nettoyer le Cache (Recommandé)
```bash
cd mobile
npx expo start -c
```
Le flag `-c` nettoie le cache avant de démarrer.

### Solution 2 : Recharger dans l'App
Si l'app est déjà ouverte :
- **iOS** : Secouer l'appareil → "Reload"
- **Android** : Secouer l'appareil → "Reload"
- **Expo Go** : Appuyer sur "R" dans le terminal

### Solution 3 : Rebuild Complet
```bash
cd mobile

# Arrêter le serveur (Ctrl+C)

# Nettoyer
npx expo start -c

# Ou supprimer complètement le cache
rm -rf .expo
rm -rf node_modules/.cache

# Redémarrer
npx expo start
```

### Solution 4 : Fermer et Rouvrir l'App
1. Fermer complètement l'application
2. Rouvrir depuis l'écran d'accueil
3. Le splash screen devrait se recharger

## 🎯 Vérification

Après le rechargement, vous devriez voir :
```
Grow [LOGO] p
      ↑
   Logo = "U"
```

Au lieu de :
```
[LOGO]
GrowUp
```

## 💡 Astuce

Pour éviter ce problème à l'avenir :
- Toujours utiliser `npx expo start -c` après des modifications d'assets
- Utiliser le hot reload (modifications automatiques) pour le code
- Rebuild complet pour les changements de configuration

## 🔧 Commandes Utiles

```bash
# Démarrer avec cache nettoyé
npx expo start -c

# Démarrer en mode développement
npx expo start --dev-client

# Voir les logs
npx expo start --clear

# Rebuild iOS
npx expo run:ios

# Rebuild Android
npx expo run:android
```
