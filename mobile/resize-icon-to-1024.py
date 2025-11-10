#!/usr/bin/env python3
"""
Script pour redimensionner l'icône à 1024x1024
Usage: python resize-icon-to-1024.py
"""

import os
from PIL import Image
from datetime import datetime

def resize_to_1024(input_path, output_path):
    """Redimensionne une image à 1024x1024"""
    img = Image.open(input_path)
    
    # Redimensionner avec haute qualité
    img_resized = img.resize((1024, 1024), Image.Resampling.LANCZOS)
    
    # Sauvegarder
    img_resized.save(output_path, 'PNG', quality=100, optimize=True)
    print(f"✅ Redimensionné : {output_path} (1024x1024)")

def main():
    assets_dir = 'assets'
    backup_dir = os.path.join(assets_dir, 'backup')
    
    # Créer le dossier de backup
    if not os.path.exists(backup_dir):
        os.makedirs(backup_dir)
    
    timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
    
    print("🎨 Redimensionnement des icônes à 1024x1024...\n")
    
    # Liste des icônes à redimensionner
    icons = ['icon.png', 'adaptive-icon.png']
    
    for icon_name in icons:
        icon_path = os.path.join(assets_dir, icon_name)
        
        if not os.path.exists(icon_path):
            print(f"⚠️  {icon_name} n'existe pas, ignoré")
            continue
        
        # Vérifier la taille actuelle
        img = Image.open(icon_path)
        width, height = img.size
        print(f"📏 {icon_name} : {width}x{height}")
        
        if width == 1024 and height == 1024:
            print(f"   ✅ Déjà à la bonne taille\n")
            continue
        
        # Backup
        backup_name = f"{icon_name.replace('.png', '')}_{width}x{height}_{timestamp}.png"
        backup_path = os.path.join(backup_dir, backup_name)
        img.save(backup_path, 'PNG')
        print(f"   💾 Backup : {backup_name}")
        
        # Redimensionner
        resize_to_1024(icon_path, icon_path)
        print()
    
    print("✨ Terminé !")
    print("\n📝 Prochaines étapes :")
    print("   1. Vérifier : python verify-icons.py")
    print("   2. Synchroniser : python sync-all-icons.py")
    print("   3. Tester : npx expo start")

if __name__ == '__main__':
    main()
