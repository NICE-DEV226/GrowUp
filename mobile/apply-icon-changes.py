#!/usr/bin/env python3
"""
Script pour appliquer les changements d'icône avec fond noir
Usage: python apply-icon-changes.py
"""

import os
import shutil
from datetime import datetime

def main():
    assets_dir = 'assets'
    backup_dir = os.path.join(assets_dir, 'backup')
    
    # Créer le dossier de backup s'il n'existe pas
    if not os.path.exists(backup_dir):
        os.makedirs(backup_dir)
        print(f"✅ Dossier de backup créé : {backup_dir}")
    
    # Timestamp pour les backups
    timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
    
    # Liste des fichiers à remplacer
    files_to_replace = [
        ('icon.png', 'icon-black-bg.png'),
        ('adaptive-icon.png', 'adaptive-icon-black-bg.png'),
        ('notification-icon.png', 'notification-icon-black-bg.png')
    ]
    
    print("🔄 Application des changements d'icône...\n")
    
    for original, new_version in files_to_replace:
        original_path = os.path.join(assets_dir, original)
        new_path = os.path.join(assets_dir, new_version)
        
        # Vérifier que le nouveau fichier existe
        if not os.path.exists(new_path):
            print(f"⚠️  {new_version} n'existe pas, ignoré")
            continue
        
        # Backup de l'original
        if os.path.exists(original_path):
            backup_name = f"{original.replace('.png', '')}_{timestamp}.png"
            backup_path = os.path.join(backup_dir, backup_name)
            shutil.copy2(original_path, backup_path)
            print(f"✅ Backup : {original} → {backup_name}")
        
        # Remplacer par la nouvelle version
        shutil.copy2(new_path, original_path)
        print(f"✅ Remplacé : {original} par {new_version}")
        
        # Supprimer le fichier temporaire
        os.remove(new_path)
        print(f"🗑️  Supprimé : {new_version}\n")
    
    print("✨ Terminé ! Les icônes ont été mises à jour.")
    print(f"📁 Les backups sont dans : {backup_dir}")
    print("\n📝 Prochaines étapes :")
    print("1. Vérifier les nouvelles icônes dans assets/")
    print("2. Tester l'application")
    print("3. Si tout est OK, vous pouvez supprimer le dossier backup")

if __name__ == '__main__':
    main()
