#!/usr/bin/env python3
"""
Script pour vérifier que toutes les icônes sont correctes
Usage: python verify-icons.py
"""

import os
from PIL import Image

def verify_icon(path, expected_size=None, expected_mode='RGB'):
    """Vérifie qu'une icône est valide"""
    if not os.path.exists(path):
        return False, f"❌ Fichier manquant"
    
    try:
        img = Image.open(path)
        width, height = img.size
        mode = img.mode
        
        issues = []
        
        # Vérifier la taille
        if expected_size and (width != expected_size or height != expected_size):
            issues.append(f"Taille incorrecte: {width}x{height} (attendu: {expected_size}x{expected_size})")
        
        # Vérifier le mode
        if mode not in ['RGB', 'RGBA']:
            issues.append(f"Mode incorrect: {mode} (attendu: RGB ou RGBA)")
        
        # Vérifier si l'image a de la transparence
        has_alpha = mode == 'RGBA'
        if has_alpha:
            # Vérifier s'il y a vraiment de la transparence
            alpha = img.split()[-1]
            if alpha.getextrema()[0] < 255:
                issues.append("⚠️  Contient de la transparence (devrait être opaque)")
        
        if issues:
            return False, " | ".join(issues)
        
        return True, f"✅ OK ({width}x{height}, {mode})"
        
    except Exception as e:
        return False, f"❌ Erreur: {e}"

def main():
    print("🔍 Vérification des icônes GrowUp...\n")
    
    assets_dir = 'assets'
    
    # Liste des icônes à vérifier
    icons_to_check = [
        ('icon.png', 1024, 'Icône principale'),
        ('adaptive-icon.png', 1024, 'Icône adaptative Android'),
        ('notification-icon.png', 96, 'Icône de notification'),
        ('favicon.png', 48, 'Favicon web'),
        ('splash.png', None, 'Écran de démarrage'),
    ]
    
    all_ok = True
    
    for filename, expected_size, description in icons_to_check:
        path = os.path.join(assets_dir, filename)
        is_ok, message = verify_icon(path, expected_size)
        
        status = "✅" if is_ok else "❌"
        print(f"{status} {description}")
        print(f"   {filename}: {message}")
        print()
        
        if not is_ok:
            all_ok = False
    
    # Vérifier app.json
    print("📄 Vérification de app.json...")
    app_json_path = 'app.json'
    if os.path.exists(app_json_path):
        import json
        with open(app_json_path, 'r', encoding='utf-8') as f:
            config = json.load(f)
            expo = config.get('expo', {})
            
            # Vérifier les chemins
            icon_path = expo.get('icon', '')
            if icon_path == './assets/icon.png':
                print("   ✅ Chemin de l'icône correct")
            else:
                print(f"   ⚠️  Chemin de l'icône: {icon_path}")
                all_ok = False
            
            # Vérifier Android adaptive icon
            android = expo.get('android', {})
            adaptive = android.get('adaptiveIcon', {})
            adaptive_path = adaptive.get('foregroundImage', '')
            if adaptive_path == './assets/adaptive-icon.png':
                print("   ✅ Chemin adaptive icon correct")
            else:
                print(f"   ⚠️  Chemin adaptive icon: {adaptive_path}")
                all_ok = False
            
            bg_color = adaptive.get('backgroundColor', '')
            if bg_color:
                print(f"   ✅ Couleur de fond Android: {bg_color}")
            else:
                print("   ⚠️  Couleur de fond Android non définie")
    else:
        print("   ❌ app.json non trouvé")
        all_ok = False
    
    print("\n" + "="*50)
    if all_ok:
        print("✨ Toutes les vérifications sont passées !")
        print("\n📱 Vos icônes sont prêtes pour iOS et Android")
        print("\n🚀 Prochaines étapes :")
        print("   1. Tester avec: npx expo start")
        print("   2. Builder pour iOS: npx expo run:ios")
        print("   3. Builder pour Android: npx expo run:android")
    else:
        print("⚠️  Certaines vérifications ont échoué")
        print("\n🔧 Corrections recommandées :")
        print("   1. Vérifier les fichiers manquants")
        print("   2. Regénérer les icônes: python sync-all-icons.py")
        print("   3. Vérifier app.json")

if __name__ == '__main__':
    main()
