#!/usr/bin/env python3
"""
Script pour créer un splash screen cohérent avec l'icône
Usage: python create-splash.py
"""

from PIL import Image, ImageDraw
import os

def create_gradient_background(width, height, color1, color2):
    """Crée un fond avec dégradé vertical"""
    base = Image.new('RGB', (width, height), color1)
    top = Image.new('RGB', (width, height), color2)
    mask = Image.new('L', (width, height))
    mask_data = []
    for y in range(height):
        mask_data.extend([int(255 * (y / height))] * width)
    mask.putdata(mask_data)
    base.paste(top, (0, 0), mask)
    return base

def create_splash_screen(icon_path, output_path, width=1284, height=2778):
    """
    Crée un splash screen avec l'icône centrée
    
    Args:
        icon_path: Chemin de l'icône
        output_path: Chemin de sortie
        width: Largeur du splash (défaut: 1284 pour iPhone 14 Pro Max)
        height: Hauteur du splash (défaut: 2778 pour iPhone 14 Pro Max)
    """
    # Couleurs GrowUp
    color_violet = (115, 63, 234)  # #733fea
    color_blue = (152, 224, 248)   # #98e0f8
    color_black = (0, 0, 0)        # #000000
    
    # Créer le fond (noir ou dégradé)
    # Option 1: Fond noir uni
    splash = Image.new('RGB', (width, height), color_black)
    
    # Option 2: Dégradé violet (décommenter pour utiliser)
    # splash = create_gradient_background(width, height, color_violet, color_blue)
    
    # Charger et redimensionner l'icône
    icon = Image.open(icon_path)
    
    # Taille de l'icône sur le splash (40% de la largeur)
    icon_size = int(width * 0.4)
    icon_resized = icon.resize((icon_size, icon_size), Image.Resampling.LANCZOS)
    
    # Centrer l'icône
    x = (width - icon_size) // 2
    y = (height - icon_size) // 2
    
    # Coller l'icône sur le splash
    if icon_resized.mode == 'RGBA':
        splash.paste(icon_resized, (x, y), icon_resized)
    else:
        splash.paste(icon_resized, (x, y))
    
    # Sauvegarder
    splash.save(output_path, 'PNG', quality=100)
    print(f"✅ Splash screen créé : {output_path}")
    print(f"   Dimensions : {width}x{height}")
    print(f"   Icône : {icon_size}x{icon_size}")

def main():
    assets_dir = 'assets'
    icon_path = os.path.join(assets_dir, 'icon.png')
    splash_path = os.path.join(assets_dir, 'splash-new.png')
    
    # Vérifier que l'icône existe
    if not os.path.exists(icon_path):
        print(f"❌ Erreur : {icon_path} n'existe pas")
        return
    
    print("🎨 Création du splash screen...\n")
    
    # Créer le splash screen
    create_splash_screen(icon_path, splash_path)
    
    print("\n✨ Terminé !")
    print("\n📝 Prochaines étapes :")
    print("1. Vérifier splash-new.png dans assets/")
    print("2. Si OK, renommer en splash.png")
    print("3. Ou modifier le script pour changer les couleurs/taille")
    print("\n💡 Options de personnalisation :")
    print("   • Ligne 28 : Fond noir uni (actuel)")
    print("   • Ligne 31 : Fond dégradé violet → bleu")
    print("   • Ligne 38 : Taille de l'icône (40% par défaut)")

if __name__ == '__main__':
    main()
