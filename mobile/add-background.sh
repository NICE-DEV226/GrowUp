#!/bin/bash
# Script pour ajouter un arrière-plan noir aux icônes GrowUp
# Nécessite ImageMagick : https://imagemagick.org/

echo "🎨 Ajout d'un fond noir aux icônes..."

# Créer un dossier de backup
mkdir -p assets/backup
cp assets/icon.png assets/backup/icon-original.png
echo "✅ Backup créé dans assets/backup/"

# Ajouter fond noir à l'icône principale
convert assets/icon.png -background black -alpha remove -alpha off assets/icon-black-bg.png
echo "✅ icon-black-bg.png créé"

# Ajouter fond noir à l'adaptive icon
if [ -f "assets/adaptive-icon.png" ]; then
    convert assets/adaptive-icon.png -background black -alpha remove -alpha off assets/adaptive-icon-black-bg.png
    echo "✅ adaptive-icon-black-bg.png créé"
fi

# Ajouter fond noir à l'icône de notification
if [ -f "assets/notification-icon.png" ]; then
    convert assets/notification-icon.png -background black -alpha remove -alpha off assets/notification-icon-black-bg.png
    echo "✅ notification-icon-black-bg.png créé"
fi

echo ""
echo "✨ Terminé ! Vérifiez les nouvelles icônes dans assets/"
echo ""
echo "📝 Pour appliquer les changements :"
echo "   mv assets/icon-black-bg.png assets/icon.png"
echo "   mv assets/adaptive-icon-black-bg.png assets/adaptive-icon.png"
