#!/usr/bin/env python3
"""
Script pour ajouter un arrière-plan noir à l'icône GrowUp
Usage: python add-background.py
"""

from PIL import Image
import os

def add_black_background(input_path, output_path, background_color=(0, 0, 0)):
    """
    Ajoute un arrière-plan de couleur à une image PNG transparente
    
    Args:
        input_path: Chemin de l'image source
        output_path: Chemin de l'image de sortie
        background_color: Tuple RGB de la couleur de fond (par défaut noir)
    """
    # Ouvrir l'image avec transparence
    img = Image.open(input_path).convert('RGBA')
    
    # Créer une nouvelle image avec fond noir
    background = Image.new('RGBA', img.size, background_color + (255,))
    
    # Composer l'image sur le fond
    result = Image.alpha_composite(background, img)
    
    # Convertir en RGB (sans canal alpha)
    result = result.convert('RGB')
    
    # Sauvegarder
    result.save(output_path, 'PNG', quality=100)
    print(f"✅ Icône créée : {output_path}")

def main():
    # Chemins des fichiers
    assets_dir = 'assets'
    input_icon = os.path.join(assets_dir, 'icon.png')
    output_icon = os.path.join(assets_dir, 'icon-black-bg.png')
    
    # Vérifier que le fichier existe
    if not os.path.exists(input_icon):
        print(f"❌ Erreur : {input_icon} n'existe pas")
        return
    
    # Ajouter le fond noir
    print(f"🎨 Ajout d'un fond noir à {input_icon}...")
    try:
        add_black_background(input_icon, output_icon, background_color=(0, 0, 0))
    except Exception as e:
        print(f"❌ Erreur lors de la création de l'icône : {e}")
        return
    
    # Créer aussi les autres icônes avec fond noir
    print("\n🎨 Création des autres icônes...")
    
    # Adaptive icon
    input_adaptive = os.path.join(assets_dir, 'adaptive-icon.png')
    if os.path.exists(input_adaptive):
        try:
            output_adaptive = os.path.join(assets_dir, 'adaptive-icon-black-bg.png')
            add_black_background(input_adaptive, output_adaptive, background_color=(0, 0, 0))
        except Exception as e:
            print(f"⚠️  Impossible de traiter adaptive-icon.png : {e}")
    
    # Notification icon
    input_notif = os.path.join(assets_dir, 'notification-icon.png')
    if os.path.exists(input_notif):
        try:
            output_notif = os.path.join(assets_dir, 'notification-icon-black-bg.png')
            add_black_background(input_notif, output_notif, background_color=(0, 0, 0))
        except Exception as e:
            print(f"⚠️  Impossible de traiter notification-icon.png : {e}")
    
    print("\n✨ Terminé ! Les nouvelles icônes sont dans le dossier assets/")
    print("\n📝 Prochaines étapes :")
    print("1. Vérifier les icônes générées")
    print("2. Renommer icon-black-bg.png en icon.png (après backup)")
    print("3. Mettre à jour app.json si nécessaire")

if __name__ == '__main__':
    main()
