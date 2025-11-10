#!/usr/bin/env python3
"""
Script pour synchroniser toutes les icônes avec l'icône principale
Usage: python sync-all-icons.py
"""

import os
import shutil
from PIL import Image

def resize_icon(input_path, output_path, size):
    """Redimensionne une icône à la taille spécifiée"""
    img = Image.open(input_path)
    img_resized = img.resize((size, size), Image.Resampling.LANCZOS)
    img_resized.save(output_path, 'PNG', quality=100)
    print(f"✅ Créé : {output_path} ({size}x{size})")

def main():
    assets_dir = 'assets'
    main_icon = os.path.join(assets_dir, 'icon.png')
    
    # Vérifier que l'icône principale existe
    if not os.path.exists(main_icon):
        print(f"❌ Erreur : {main_icon} n'existe pas")
        return
    
    print("🎨 Synchronisation de toutes les icônes...\n")
    
    # Copier vers adaptive-icon (même taille)
    adaptive_icon = os.path.join(assets_dir, 'adaptive-icon.png')
    shutil.copy2(main_icon, adaptive_icon)
    print(f"✅ Copié : icon.png → adaptive-icon.png")
    
    # Créer notification-icon (96x96)
    notification_icon = os.path.join(assets_dir, 'notification-icon.png')
    resize_icon(main_icon, notification_icon, 96)
    
    # Créer favicon (48x48)
    favicon = os.path.join(assets_dir, 'favicon.png')
    resize_icon(main_icon, favicon, 48)
    
    print("\n✨ Terminé ! Toutes les icônes ont été synchronisées.")
    print("\n📝 Fichiers mis à jour :")
    print("  • icon.png (1024x1024) - Icône principale")
    print("  • adaptive-icon.png (1024x1024) - Android")
    print("  • notification-icon.png (96x96) - Notifications")
    print("  • favicon.png (48x48) - Web")

if __name__ == '__main__':
    main()
